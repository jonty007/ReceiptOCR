import { Router } from 'express';
import { Receipt, User, File, ReceiptAmount, sequelize } from '../../db';
import Busboy from 'busboy';
import { isAuthenticated } from '../../middlewares';
import { StorageType, FileContainers } from '../../common/Mappings';
import { logger } from '../../app/app.logger';
const azureStorage = require('../../boundaries/azure_storage');
const azureVision = require('../../boundaries/azure_vision');
const axios = require('axios');
const sjcl = require('sjcl');
import { zip_inflate } from './zlib';

const receiptRouter = Router();

receiptRouter.get('/receipt/user', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user;

    const {
      company_name,
      invoice_date_start,
      invoice_date_end,
      receipt_number,
      company_payment,
      category,
      warranty_unit,
      return_unit,
      paid_with,
      amount_min,
      amount_max
    } = req.query;

    let receipts = await Receipt.findAll({
      where: {
        user_id: user_id,
        deleted: false
      },
      order: [['created_at', 'ASC']],
      include: [...Receipt.getStandardInclude()]
    });

    if (company_name) {
      receipts = receipts.filter(receipt => {
        return receipt.company_name.toLowerCase().indexOf(company_name.toLocaleLowerCase()) > -1;
      });
    }
    if (invoice_date_start) {
      receipts = receipts.filter(receipt => {
        return new Date(receipt.invoice_date) >= new Date(invoice_date_start);
      });
    }

    if (invoice_date_end) {
      receipts = receipts.filter(receipt => {
        return new Date(receipt.invoice_date) <= new Date(invoice_date_end);
      });
    }

    if (amount_min) {
      receipts = receipts.filter(receipt => {
        return receipt.tax_sum >= amount_min;
      });
    }

    if (amount_max) {
      receipts = receipts.filter(receipt => {
        return receipt.tax_sum <= amount_max;
      });
    }

    if (receipt_number) {
      receipts = receipts.filter(receipt => {
        return (
          receipt.receipt_number.toLowerCase().indexOf(receipt_number.toLocaleLowerCase()) > -1
        );
      });
    }

    if (typeof company_payment === 'boolean') {
      receipts = receipts.filter(receipt => {
        return receipt.company_payment === company_payment;
      });
    }

    if (category) {
      receipts = receipts.filter(receipt => {
        return receipt.category.toLowerCase().indexOf(category.toLocaleLowerCase()) > -1;
      });
    }

    if (warranty_unit) {
      receipts = receipts.filter(receipt => {
        return receipt.warranty_unit.toLowerCase().indexOf(warranty_unit.toLocaleLowerCase()) > -1;
      });
    }

    if (return_unit) {
      receipts = receipts.filter(receipt => {
        return receipt.return_unit.toLowerCase().indexOf(return_unit.toLocaleLowerCase()) > -1;
      });
    }

    if (paid_with) {
      receipts = receipts.filter(receipt => {
        return receipt.paid_with.toLowerCase().indexOf(paid_with.toLocaleLowerCase()) > -1;
      });
    }

    return res.send({ message: 'RECEIPT_GET.SUCCESSFUL', data: receipts });
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

receiptRouter.get('/receipt/org', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user;

    const user = await User.findOne({
      where: {
        id: user_id,
        deleted: false
      }
    });

    const receipts = await Receipt.findAll({
      where: {
        org_id: user.org_id,
        deleted: false
      },
      include: [...Receipt.getStandardInclude()]
    });

    return res.send({ message: 'RECEIPT_GET.SUCCESSFUL', data: receipts });
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

receiptRouter.get('/receipt/:receipt_id', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { receipt_id } = req.params;

    const receipt = await Receipt.findOne({
      where: {
        id: receipt_id,
        user_id: user_id,
        deleted: false
      },
      include: [...Receipt.getStandardInclude()]
    });

    return res.send({ message: 'RECEIPT_GET.SUCCESSFUL', data: receipt });
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

receiptRouter.get(
  '/receipt/receipt_file/:receipt_id',
  isAuthenticated(),
  async (req, res, next) => {
    try {
      const { receipt_id } = req.params;
      const { user_id } = req.user;
      const receipt = await Receipt.findOne({
        where: {
          id: receipt_id,
          user_id: user_id,
          deleted: false
        },
        include: [...Receipt.getStandardInclude()]
      });

      if (!receipt) {
        return res.status(404).send({ message: 'RECEIPT.UPDATE.NO_EXIST' });
      }

      let data = null;
      if (receipt.receipt_file_id && receipt.receipt_file) {
        let { receipt_file } = receipt;
        let name = receipt_file.id + '_' + receipt_file.name;
        data = await azureStorage.downloadBlob(name);
        let buf = Buffer.from(data.data);
        let base64 = `data:${receipt_file.mime_type};base64,${buf.toString('base64')}`;
        return res.send({ type: data.type, base64: base64, meta: receipt_file });
      }

      return res.send({ data });
    } catch (e) {
      if (e.message) {
        return res.status(405).send({
          message: e.message
        });
      }
      return next(e);
    }
  }
);

receiptRouter.get(
  '/receipt/receipt_file/:receipt_id/buffer',
  isAuthenticated(),
  async (req, res, next) => {
    try {
      const { receipt_id } = req.params;
      const { user_id } = req.user;
      const receipt = await Receipt.findOne({
        where: {
          id: receipt_id,
          user_id: user_id,
          deleted: false
        },
        include: [...Receipt.getStandardInclude()]
      });

      let data = null;
      if (receipt.receipt_file_id && receipt.receipt_file) {
        let { receipt_file } = receipt;
        let name = receipt_file.id + '_' + receipt_file.name;
        data = await azureStorage.downloadBlob(name);
        return res.send({ type: data.type, data: data.data, meta: receipt_file });
      }

      return res.send({ data });
    } catch (e) {
      if (e.message) {
        return res.status(405).send({
          message: e.message
        });
      }
      return next(e);
    }
  }
);

receiptRouter.post('/receiptqr', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const { user_id } = req.user;

    busboy.on('file', async (fieldName, file, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED' });
      }
      let data = {
        message: 'send this data object in receipt OCR form as QRData'
      };
      res.send({ data });
    });

    return req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
  }
});

receiptRouter.post('/receiptocr', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const { user_id } = req.user;

    const formData = {};

    busboy.on('file', async (fieldName, file, filename, encoding, mime_type) => {
      try {
        if (!mime_type || !filename) {
          return res.status(400).send({ message: 'VAL_FAILED' });
        }

        const bufContent = [];

        file.on('data', data => {
          bufContent.push(data);
        });

        file.on('end', async data => {
          let fileContent = Buffer.concat(bufContent);
          const ocrData = {};
          ocrData['receipt_number'] = null;
          ocrData['receipt_date'] = null;
          ocrData['company_name'] = null;
          ocrData['tax_details'] = [];

          if (formData['QRData']) {
            let qrData = formData['QRData'];
            extractData(ocrData, qrData);
          }

          let azureData = {};

          if (!ocrData['receipt_date']) {
            logger.info('QR code missing, using azure');
            azureData = await azureVision.extractReceipt(fileContent);
            if (azureData && azureData.analyzeResult && azureData.analyzeResult.readResults) {
              let readResult = azureData.analyzeResult.readResults[0];
              let lines = readResult.lines;
              let efstaNumbers = [];
              lines.forEach(line => {
                if (line.text) {
                  if (line.text.toLowerCase().includes('efsta') && false) {
                    logger.info(line.text);
                    let n1 = line.text.match(/\d+/)[0];
                    let n2 = line.text.split('#')[1].trim();
                    let n3 = line.text.split(' ')[line.text.split(' ').length - 1].trim();
                    efstaNumbers.push(n1);
                    efstaNumbers.push(n2);
                    efstaNumbers.push(n3);
                  }
                }
              });

              if (efstaNumbers && efstaNumbers.length) {
                for (let i = 0; i < efstaNumbers.length; i++) {
                  let number = efstaNumbers[i];
                  try {
                    if (typeof BigInt(number) === 'bigint') {
                      let key = sjcl.hash.sha256.hash(number);
                      let k = sjcl.hash.sha256.hash(key);
                      let code = sjcl.codec.base64url.fromBits(k);
                      let efstResult = await axios.get(
                        `https://efsta.net:8084/ext.svc/?index=${code}`
                      );
                      if (efstResult.data && efstResult.data.length != 0) {
                        let dataString = efstResult.data[0];
                        let aes = new sjcl.cipher.aes(key);
                        let enc = sjcl.codec.base64.toBits(dataString);
                        let dec = sjcl.mode.gcm.decrypt(aes, enc, [0, 0, 0], []);
                        let zip_inflate_data_length = sjcl.bitArray.bitLength(dec) / 8;
                        let finalResult = zip_inflate(dec, zip_inflate_data_length);
                        let efstaQrData = JSON.parse(finalResult);
                        extractData(ocrData, efstaQrData['QR']);
                        break;
                      }
                    }
                  } catch (err) {
                    logger.error(err);
                  }
                }
              }
            }
          }

          if (
            !ocrData['receipt_date'] &&
            azureData &&
            azureData.analyzeResult &&
            azureData.analyzeResult.readResults
          ) {
            logger.info('EFSTA code missing, using manual OCR');
            let readResult = azureData.analyzeResult.readResults[0];
            let lines = readResult.lines;
            if (lines[0].text) {
              ocrData['company_name'] = lines[0].text;
            }

            let dateFound = false;
            for(let i = 0; i < lines.length; i++) {
              let line = lines[i];
              if (line.words) {
                let words = line.words;
                for(let j = 0; j < words.length; j++) {
                  let word =  words[j];
                  if (checkForDate(word.text)) {
                    let basicDate = checkForDate(word.text);
                    ocrData['receipt_date'] = formatDate(basicDate);
                    dateFound = true;
                    break;
                  }
                }
              }
              if (dateFound) {
                break;
              }
            }
          }

          res.send({ data: ocrData });
        });
      } catch (err) {
        return res.status(405).send({
          message: err.message
        });
      }
    });

    busboy.on('field', (fieldName, value) => {
      formData[fieldName] = value;
    });

    return req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
  }
});

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

function checkDateParse(str,  operator) {
  let arr = str.split(operator);

  if (Date.parse(str)) {
    return str;
  }

  if (Date.parse(`${arr[1]}${operator}${arr[0]}${operator}${arr[2]}`)) {
    return `${arr[1]}${operator}${arr[0]}${operator}${arr[2]}`;
  }
  return false;
}

function checkForDate(str) {
  if (!str) {
    return false;
  }
  let strArr = [],
    i;

  strArr = str.split('-');
  if (strArr.length === 3) {
    for (i = 0; i < strArr.length; i++) {
      if (!strArr[i]) {
        return false;
      }
    }
    let temp = checkDateParse(str, '-');
    if (temp) {
      return temp;
    }
  }

  strArr = str.split('/');
  if (strArr.length === 3) {
    for (i = 0; i < strArr.length; i++) {
      if (!strArr[i]) {
        return false;
      }
    }
    let temp = checkDateParse(str, '/');
    if (temp) {
      return temp;
    }
  }

  strArr = str.split('.');
  if (strArr.length === 3) {
    for (i = 0; i < strArr.length; i++) {
      if (!strArr[i]) {
        return false;
      }
    }
    let temp = checkDateParse(str, '.');
    if (temp) {
      return temp;
    }
  }
  return false;
}

function extractData(ocrData, qrData) {
  if (qrData.startsWith('_R') && qrData.substring(4, 6) === 'AT') {
    let qrList = qrData.split('_');
    if (qrList.length === 14) {
      ocrData['receipt_number'] = qrList[3];
      ocrData['receipt_date'] = qrList[4].split('T')[0];
      ocrData['company_name'] = qrList[2];
      ocrData['tax_details'] = [];

      if (qrList[5] !== '0,00') {
        let amount = parseFloat(qrList[5].replace(',', '.'));
        let netAmount = amount / (1 + 0.2);
        ocrData['tax_details'].push({
          tax_percentage: 20,
          net: netAmount,
          tax: amount - netAmount,
          sum: amount
        });
      }

      if (qrList[6] !== '0,00') {
        let amount = parseFloat(qrList[6].replace(',', '.'));
        let netAmount = amount / (1 + 0.1);
        ocrData['tax_details'].push({
          tax_percentage: 10,
          net: netAmount,
          tax: amount - netAmount,
          sum: amount
        });
      }

      if (qrList[7] !== '0,00') {
        let amount = parseFloat(qrList[7].replace(',', '.'));
        let netAmount = amount / (1 + 0.13);
        ocrData['tax_details'].push({
          tax_percentage: 13,
          net: netAmount,
          tax: amount - netAmount,
          sum: amount
        });
      }

      if (qrList[8] !== '0,00') {
        let amount = parseFloat(qrList[8].replace(',', '.'));
        let netAmount = amount / (1 + 0);
        ocrData['tax_details'].push({
          tax_percentage: 0,
          net: netAmount,
          tax: amount - netAmount,
          sum: amount
        });
      }

      if (qrList[9] !== '0,00') {
        let amount = parseFloat(qrList[9].replace(',', '.'));
        let netAmount = amount / (1 + 0.19);
        ocrData['tax_details'].push({
          tax_percentage: 19,
          net: netAmount,
          tax: amount - netAmount,
          sum: amount
        });
      }
    }
  }
}

receiptRouter.post('/receipt', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const { user_id, actual_user_id } = req.user;

    let formData = {};

    busboy.on('file', async (fieldName, file, filename, encoding, mime_type) => {
      try {
        if (!mime_type || !filename) {
          return res.status(400).send({ message: 'VAL_FAILED' });
        }

        let content = [],
          fileContent;

        file.on('data', data => {
          content.push(data);
        });

        file.on('end', async () => {
          try {
            fileContent = Buffer.concat(content);

            let fileData;

            let user = await User.findOne({
              where: {
                id: user_id,
                deleted: false
              }
            });

            await sequelize.transaction(async transaction => {
              const params = {
                name: filename,
                extension: encoding,
                file_size: 0,
                mime_type: mime_type,
                location: FileContainers.ATBR,
                storage_type: StorageType.AZURE,
                created_by: actual_user_id,
                modified_by: actual_user_id
              };

              fileData = await File.create(params, { transaction });
              const fileName = fileData.id + '_' + fileData.name;
              await azureStorage.uploadBlob(fileName, fileContent);

              let tax_sum = 0;
              let amounts = formData['amounts'];
              if (amounts) {
                amounts = JSON.parse(amounts);
                if (amounts.length) {
                  amounts.forEach(amount => {
                    tax_sum += amount.sum;
                  });
                }
              }

              const receiptParams = {
                user_id: user_id,
                org_id: user.org_id,
                company_name: formData['company_name'],
                tax_sum,
                receipt_file_id: fileData.id,
                invoice_date: formData['invoice_date'],
                receipt_number: formData['receipt_number'],
                company_payment: formData['company_payment'],
                note: formData['note'],
                category: formData['category'],
                lifelong_warranty: formData['lifelong_warranty'],
                warranty_unit: formData['warranty_unit'],
                warranty_value: formData['warranty_value'],
                unlimited_return: formData['unlimited_return'],
                return_unit: formData['return_unit'],
                return_value: formData['return_value'],
                paid_with: formData['paid_with'],
                modified_by: actual_user_id,
                created_by: actual_user_id
              };

              const receipt = await Receipt.create(receiptParams, { transaction });

              if (amounts && amounts.length) {
                let updatePromises = [];
                amounts.forEach(amount => {
                  tax_sum += amount.sum;

                  let amountParam = {
                    receipt_id: receipt.id,
                    tax_percentage: amount.tax_percentage,
                    net: amount.net,
                    tax: amount.tax,
                    sum: amount.sum,
                    created_by: actual_user_id,
                    modified_by: actual_user_id
                  };
                  updatePromises.push(ReceiptAmount.create(amountParam, { transaction }));
                });
                await Promise.all(updatePromises);
              }
              return res.send({ message: 'UPLOAD.SUCCESSFUL', data: receipt });
            });
          } catch (e) {
            if (e.message) {
              return res.status(405).send({
                message: e.message
              });
            }
            return next(e);
          }
        });
      } catch (e) {
        if (e.message) {
          return res.status(405).send({
            message: e.message
          });
        }
        return next(e);
      }
    });

    busboy.on('field', (fieldName, value) => {
      formData[fieldName] = value;
    });

    return req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

receiptRouter.post('/receipt/:receipt_id', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const { user_id, actual_user_id } = req.user;
    const { receipt_id } = req.params;

    let formData = {};

    const existingReceipt = await Receipt.findOne({
      where: {
        id: receipt_id
      }
    });

    if (!existingReceipt) {
      return res.status(400).send({
        message: 'RECEIPT.UPDATE.NO_EXIST'
      });
    }

    busboy.on('file', async (fieldName, file, filename, encoding, mime_type) => {
      try {
        if (!mime_type || !filename) {
          return res.status(400).send({ message: 'VAL_FAILED' });
        }

        let content = [],
          fileContent;

        file.on('data', data => {
          content.push(data);
        });

        file.on('end', async () => {
          try {
            fileContent = Buffer.concat(content);

            let fileData;

            let user = await User.findOne({
              where: {
                id: user_id,
                deleted: false
              }
            });

            await sequelize.transaction(async transaction => {
              await Receipt.update({ deleted: true }, { where: { id: receipt_id }, transaction });

              const params = {
                name: filename,
                extension: encoding,
                file_size: 0,
                mime_type: mime_type,
                location: FileContainers.ATBR,
                storage_type: StorageType.AZURE,
                created_by: actual_user_id,
                modified_by: actual_user_id
              };

              fileData = await File.create(params, { transaction });
              const fileName = fileData.id + '_' + fileData.name;
              await azureStorage.uploadBlob(fileName, fileContent);
              const receiptParams = {
                user_id: user_id,
                org_id: user.org_id,
                company_name: formData['company_name'],
                receipt_file_id: fileData.id,
                invoice_date: formData['invoice_date'],
                receipt_number: formData['receipt_number'],
                company_payment: formData['company_payment'],
                note: formData['note'],
                category: formData['category'],
                lifelong_warranty: formData['lifelong_warranty'],
                warranty_unit: formData['warranty_unit'],
                warranty_value: formData['warranty_value'],
                unlimited_return: formData['unlimited_return'],
                return_unit: formData['return_unit'],
                return_value: formData['return_value'],
                paid_with: formData['paid_with'],
                modified_by: actual_user_id,
                created_by: actual_user_id
              };

              const receipt = await Receipt.create(receiptParams, { transaction });

              let amounts = formData['amounts'];
              if (amounts) {
                amounts = JSON.parse(amounts);

                if (amounts.length) {
                  let updatePromises = [];
                  amounts.forEach(amount => {
                    let amountParam = {
                      receipt_id: receipt.id,
                      tax_percentage: amount.tax_percentage,
                      net: amount.net,
                      tax: amount.tax,
                      sum: amount.sum,
                      created_by: actual_user_id,
                      modified_by: actual_user_id
                    };
                    updatePromises.push(ReceiptAmount.create(amountParam, { transaction }));
                  });
                  await Promise.all(updatePromises);
                }
              }
              return res.send({ message: 'RECEIPT.UPDATE.SUCCESSFUL', data: receipt });
            });
          } catch (e) {
            if (e.message) {
              return res.status(405).send({
                message: e.message
              });
            }
            return next(e);
          }
        });
      } catch (e) {
        if (e.message) {
          return res.status(405).send({
            message: e.message
          });
        }
        return next(e);
      }
    });

    busboy.on('field', (fieldName, value) => {
      formData[fieldName] = value;
    });

    return req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

export default receiptRouter;
