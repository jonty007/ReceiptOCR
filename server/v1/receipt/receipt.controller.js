import { Router } from 'express';
import { DurationUnit, PaymentType, ReceiptCategory, File, sequelize } from '../../db';
import Busboy from 'busboy';
import { isAuthenticated } from '../../middlewares';
import { StorageType, FileContainers} from '../../common/Mappings'
const azureStorage = require('../../boundaries/azure_storage');

const receipt = Router();


receipt.post('/receipt', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const { actual_user_id } = req.user;
    
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
            console.log('form data: ',  formData);
            return res.send({'message':  'successfully uploaded'});
          });
        });

    });

    busboy.on('field', (fieldName, value) => {
        console.log('here');
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

export default receipt;
 