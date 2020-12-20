import { Router } from 'express';
import { Receipt, User, File, ReceiptAmount, sequelize } from '../../db';
import Busboy from 'busboy';
import { isAuthenticated } from '../../middlewares';
import { StorageType, FileContainers } from '../../common/Mappings';
import { Op } from 'sequelize';
import Sequelize from 'sequelize';
const azureStorage = require('../../boundaries/azure_storage');
const azureOCR = require('../../boundaries/azure_ocr');

const receiptRouter = Router();

// company name
// date range (single function)
// receipt number
// company payment true  or false
// category
// warranty unit
// return unit
// paid with

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
      paid_with
    } = req.query;

    let receipts = await Receipt.findAll({
      where: {
        user_id: user_id,
        deleted: false
      },
      include: [...Receipt.getStandardInclude()]
    });

    if (company_name) {
      receipts = receipts.filter(receipt => {
        return receipt.company_name.toLowerCase().indexOf(company_name.toLocaleLowerCase()) > -1;
      });
    }
    if (invoice_date_start) {
      // implement
    }

    if (invoice_date_end) {
      // implement
    }

    if (receipt_number) {
      receipts = receipts.filter(receipt => {
        return receipt.receipt_number.toLowerCase().indexOf(receipt_number.toLocaleLowerCase()) > -1;
      });
    }
  
    if (typeof company_payment === "boolean") {
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

    return res.send({ message: 'UPLOAD.SUCCESSFUL', data: receipts });
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

    return res.send({ message: 'UPLOAD.SUCCESSFUL', data: receipts });
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

    return res.send({ message: 'UPLOAD.SUCCESSFUL', data: receipt });
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

receiptRouter.post('/receiptocr', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const { user_id } = req.user;

    busboy.on('file', async (fieldName, file, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED' });
      }

      console.log(`typeof file ${typeof file}`);

      await azureOCR.extractReceipt(file);
      res.send({ done: 'hello' });
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

receiptRouter.post('/receipt', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const { user_id, actual_user_id } = req.user;

    let formData = {};

    busboy.on('file', async (fieldName, file, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED' });
      }

      let content = [],
        fileContent;

      file.on('data', data => {
        content.push(data);
      });

      file.on('end', async () => {
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
          return res.send({ message: 'UPLOAD.SUCCESSFUL', data: receipt });
        });
      });
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
