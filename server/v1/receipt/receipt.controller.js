import { Router } from 'express';
import { Receipt, User, File, ReceiptAmount, sequelize } from '../../db';
import Busboy from 'busboy';
import { isAuthenticated } from '../../middlewares';
import { StorageType, FileContainers} from '../../common/Mappings'
const azureStorage = require('../../boundaries/azure_storage');

const receiptRouter = Router();

receiptRouter.get('/receipt/user', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const receipts = await Receipt.findAll({
      where: {
        user_id: user_id,
        deleted: false
      },
      include: [...Receipt.getStandardInclude()]
    });

    return res.send({'message':  'UPLOAD.SUCCESSFUL', data: receipts});
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
      where:  {
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

    return res.send({'message':  'UPLOAD.SUCCESSFUL', data: receipts});
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

    return res.send({'message':  'UPLOAD.SUCCESSFUL', data: receipt});
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

receiptRouter.get('/receipt/receipt_file/:receipt_file_id', isAuthenticated(), async (req, res, next) => {
  const { receipt_file_id } =  req.params;
});

receiptRouter.post('/receipt', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const { user_id, actual_user_id } = req.user;
    
    let formData = {};

    busboy.on('file', async (fieldName, file, filename, encoding, mime_type) => {
        console.log(`file details: ${fieldName} ${filename} ${encoding} ${mime_type}`);
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
                  updatePromises.push(ReceiptAmount.create(amountParam, {transaction}));
                });
                await Promise.all(updatePromises);
              }
            }
            return res.send({'message':  'UPLOAD.SUCCESSFUL', data: receipt});
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
 