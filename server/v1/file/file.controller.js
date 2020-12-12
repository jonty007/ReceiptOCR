import { Router } from 'express';
import { isAuthenticated } from '../../middlewares';
import { File, User, Organization, sequelize } from '../../db';
import Busboy from 'busboy';
import mime from 'mime-types';
import Streamer from 'stream';
import uuid from 'uuid';
import Promise from 'bluebird';
import { StorageType } from '../../common/Mappings';
import { decryptRead, encryptUpload } from '../../boundaries/s3';

const azureStorage = require('../../boundaries/azure_storage');

const fileRouter = Router();

const streamErrorHandler = res => err => {
  err.message = `ScaleStream : ${err.message}`;
  return res.status(500).send({ message: err.message });
};

/**
 *
 * @api {post} /file/s3/upload Upload a file to S3
 * @apiName Upload a file to S3
 * @apiGroup File
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (File) {File} file File
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "file_id": 1,
 *     "name": "ABC.png",
 *     "mime_type": "image/png"
 *     "location": "abcdef12345.png"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 *
 */
fileRouter.post('/file/s3/upload', isAuthenticated(), async (req, res, next) => {
  const { user_id } = req.user,
    { file_name } = req.query;

  try {
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, file, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED' });
      }

      const streams = [],
        fileStream = new Streamer.PassThrough();
      fileStream.on('error', streamErrorHandler(res));

      const extension = mime.extension(mime_type),
        dot_extension = file_name ? '.jpeg' : `.${extension}`,
        s3_file_uuid = file_name ? file_name : uuid.v4(),
        s3_main_file_name = `${s3_file_uuid}${dot_extension}`;
      let s3_main_file_data_length = 0;

      file.pipe(fileStream);
      file.on('data', data => {
        s3_main_file_data_length += data.length;
      });

      streams.push(encryptUpload(s3_main_file_name, fileStream, encoding, mime_type));

      return Promise.all(streams)
        .then(async results => {
          // TODO : add a file size limit to prevent large files
          let file_instance;
          await sequelize.transaction(async transaction => {
            file_instance = await File.create(
              {
                name: filename,
                created_by: user_id,
                modified_by: user_id,
                mime_type,
                extension,
                storage_type: StorageType.S3,
                location: results[0].data.Key || results[0].data.key,
                file_size: s3_main_file_data_length, //bytes
                metadata: JSON.stringify(results[0])
              },
              { transaction }
            );

            await file_instance.reload({ transaction });
          });

          return res.send({
            id: file_instance.id,
            name: file_instance.name,
            mime_type: file_instance.mime_type,
            location: file_instance.location
          });
        })
        .catch(err => res.status(400).send({ message: err.message }));
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

/**
 *
 * @api {get} /file/s3/get/:fileName Get file contents by file location from s3
 * @apiName Get a file from s3
 * @apiGroup File
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Params) {Integer} file_id File ID
 *
 * @apiSuccessExample {type} Success-Response:
 * {
 *    "id": 1,
 *    "name": "ABC.png",
 *    "extension": "png"
 *    "file_size": 12345,
 *    "mime_type": "image/png",
 *    "storage_type": "local",
 *    "content": { "type": "Buffer", "data": <Array> }
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 404) NotFoundError File not found!
 */
fileRouter.get('/file/s3/:fileName', isAuthenticated(), async (req, res, next) => {
  const { size } = req.query,
    { fileName } = req.params;

  // non-mp3 files.
  if (fileName.indexOf('.mp3') == -1) {
    try {
      const file = await File.findOne({ where: { location: fileName, deleted: false } });
      if (file && file.name) {
        res.set('Content-Disposition', 'inline; filename="' + file.name + '"');
      }
      const contentType = mime.lookup(fileName);
      if (contentType) {
        res.set('Content-Type', contentType);
      }
      return await decryptRead({ location: fileName, metadata: file.metadata, size, res });
    } catch (error) {
      return next(error);
    }
  }

  // mp3 file
  // let fileObject;
  // try {
  //   fileObject = await getFileObject(fileName);
  // } catch (error) {
  //   return next(error);
  // }

  // let partialstart = 0,
  //   partialend = 1,
  //   start = parseInt(partialstart, 10),
  //   end = partialend,
  //   chunksize = end - start + 1,
  //   fileChunk = fileObject.Body.slice(start, chunksize);

  // if (req.headers.range) {
  //   let { range } = req.headers,
  //     [part1, part2] = range.replace(/bytes=/, '').split('-');
  //   partialstart = part1;

  //   // for audio (and especially mp3), safari will make a preflight call with
  //   // range header as "range 0-1". For others take full length.
  //   partialend = part2 || fileObject.ContentLength;

  //   // chrome does not pass end range, so make start as 0.
  //   start = !part2 ? 0 : parseInt(partialstart, 10);

  //   end = partialend ? parseInt(partialend, 10) : fileObject.ContentLength - 1;
  //   chunksize = end - start + 1;
  //   fileChunk = fileObject.Body.slice(start, chunksize);
  // }

  // // make sure we overwrite the `Transfer-Encoding: chunked` header(which does not
  // // allow to seek in front end) by adding the following headers.
  // res.set('Content-Range', `bytes ${start}-${end}/ ${fileObject.ContentLength}`);
  // res.set('Accept-Ranges', 'bytes');
  // res.set('Content-Length', chunksize);
  // res.set('Content-Type', fileObject.ContentType);
  // res.set('Content-Encoding', fileObject.ContentEncoding);
  // res.set('Cache-Control', 'max-31557600');
  // res.set('Content-Disposition', 'inline; filename="' + fileName + '"');

  // res.removeHeader('Connection');
  // res.status(200).send(fileChunk);
});

/**
 *
 * @api {post} /file/upload Upload a file to local
 * @apiName Upload a file to local
 * @apiGroup File
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (File) {File} file File
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "file_id": 1,
 *     "name": "ABC.png"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 *
 */
fileRouter.post('/file/upload', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user;
    let fileObj = {};
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, fileData, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED!' });
      }

      const extension = mime.extension(mime_type);
      let main_file_data_length = 0,
        content = '';
      fileData.on('data', data => {
        main_file_data_length += data.length;
        content += data;
      });

      fileData.on('end', async data => {
        let file_instance = {
          name: filename,
          created_by: user_id,
          modified_by: user_id,
          mime_type,
          extension,
          content: content,
          storage_type: StorageType.LOCAL,
          file_size: main_file_data_length, //bytes
          metadata: JSON.stringify({ encoding: encoding })
        };

        let { id: file_id, name } = await File.create(file_instance);
        fileObj = {
          file_id,
          name
        };
        res.send(fileObj);
      });
    });

    req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

/**
 *
 * @api {get} /file/:file_id Get file contents by file id from local
 * @apiName Get a file from local
 * @apiGroup File
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Params) {Integer} file_id File ID
 *
 * @apiSuccessExample {type} Success-Response:
 * {
 *    "id": 1,
 *    "name": "ABC.png",
 *    "extension": "png"
 *    "file_size": 12345,
 *    "mime_type": "image/png",
 *    "storage_type": "local",
 *    "content": { "type": "Buffer", "data": <Array> }
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 404) NotFoundError File not found!
 */
fileRouter.get('/file/:file_id', isAuthenticated(), async (req, res, next) => {
  try {
    let { file_id } = req.params;
    if (!file_id) {
      return res.status(400).send({ message: 'VAL_FAILED!' });
    }

    let fileRes = await File.findOne({
      where: {
        id: file_id,
        deleted: false
      }
    });

    if (!fileRes) {
      return res.status(404).send({ message: 'FILE_404!' });
    }

    res.send(fileRes);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

/**
 *
 * @api {post} /file/azure/upload Upload a file to azure
 * @apiName Upload a file to azure
 * @apiGroup File
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (File) {File} file File
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *      "status": 200,
 *      "data": {
 *          "etag": "\"0x8D86129D83E7E99\"",
 *          "lastModified": "2020-09-25T08:06:02.000Z",
 *          "contentMD5": {
 *              "type": "Buffer",
 *              "data": [
 *                  187,
 *                  124,
 *                  194,
 *                  75,
 *                  183,
 *                  252,
 *                  185,
 *                  74,
 *                  4,
 *                  40,
 *                  60,
 *                  50,
 *                  73,
 *                  118,
 *                  217,
 *                  148
 *              ]
 *          },
 *          "clientRequestId": "66bc1e06-c561-4ff9-9352-5de17a218813",
 *          "requestId": "471de4b2-b01e-004b-1e12-935e5c000000",
 *          "version": "2019-12-12",
 *          "date": "2020-09-25T08:06:01.000Z",
 *          "isServerEncrypted": true,
 *          "content-length": "0",
 *          "server": "Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0",
 *          "x-ms-content-crc64": "ac4aVBJuZNU="
 *      }
 *  }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 *
 */
fileRouter.post('/file/azure/upload', isAuthenticated(), async (req, res, next) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, fileData, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED!' });
      }

      let content = [],
        filecontent;

      fileData.on('data', data => {
        content.push(data);
      });

      fileData.on('end', async () => {
        filecontent = Buffer.concat(content);
        const response = await azureStorage.uploadBlob(filename, filecontent);

        if (response && response.status === 400) {
          return res.status(400).send({ message: response.message });
        }

        res.send({ response });
      });
    });

    req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

/**
 *
 * @api {get} /file/azure/:file_name Get file contents by file name from azure
 * @apiName Get a file from azure
 * @apiGroup File
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Params) {Integer} file_id File ID
 *
 * @apiSuccessExample {type} Success-Response:
 * {
 *      "status": 200,
 *      "data": {
 *          "type": "Buffer",
 *          "data": [
 *                187,
 *                124,
 *                194,
 *                75,
 *                183,
 *                252,
 *                185,
 *                74,
 *                4,
 *                40,
 *                60,
 *                50,
 *                73,
 *                118,
 *                217,
 *                148,
 *                ...
 *            ]
 *      }
 *  }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 404) NotFoundError File not found!
 */
fileRouter.get('/file/azure/:file_name', async (req, res, next) => {
  try {
    let { file_name } = req.params;
    if (!file_name) {
      return res.status(400).send({ message: 'VAL_FAILED!' });
    }

    const response = await azureStorage.downloadBlob(file_name);

    if (response && response.status === 400) {
      return res.status(400).send({ message: response.message });
    }

    res.send({ response });
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

/**
 *
 * @api {post} /file/profile-picture/update Upload a file to local
 * @apiName Update user profile
 * @apiGroup File
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (File) {File} file File
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "file_id": 1,
 *     "name": "ABC.png"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 *
 */
fileRouter.post('/file/profile-picture/update', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user;
    let fileObj = {};
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, fileData, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED!' });
      }

      const extension = mime.extension(mime_type);
      let main_file_data_length = 0,
        content = '';
      fileData.on('data', data => {
        main_file_data_length += data.length;
        content += data;
      });

      fileData.on('end', async data => {
        let user = await User.findOne({
          where: {
            id: user_id
          }
        });

        let file_instance = {
          name: filename,
          created_by: user_id,
          modified_by: user_id,
          mime_type,
          extension,
          content: content,
          storage_type: StorageType.LOCAL,
          file_size: main_file_data_length, //bytes
          metadata: JSON.stringify({ encoding: encoding })
        };

        if (user.profile_picture_file_id) {
          await File.update(file_instance, {
            where: {
              id: user.profile_picture_file_id
            }
          });
          fileObj = {
            file_id: user.profile_picture_file_id,
            name: filename
          };
          res.send(fileObj);
          return;
        } else {
          await sequelize.transaction(async transaction => {
            let { id: file_id, name } = await File.create(file_instance, { transaction });
            await User.update(
              {
                profile_picture_file_id: file_id
              },
              {
                where: {
                  id: user_id
                },
                transaction
              }
            );

            fileObj = {
              file_id,
              name
            };
          });
          res.send(fileObj);
          return;
        }
      });
    });

    req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

// get profile picture
fileRouter.get('/file/profile-picture/:file_id', isAuthenticated(), async (req, res, next) => {
  try {
    let { file_id } = req.params;
    if (!file_id) {
      return res.status(400).send({ message: 'VAL_FAILED!' });
    }

    let fileRes = await File.findOne({
      where: {
        id: file_id,
        deleted: false
      }
    });

    if (!fileRes) {
      return res.status(404).send({ message: 'FILE_404!' });
    }

    res.send(fileRes);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

// company logo

/**
 *
 * @api {post} /file/profile-picture/update Upload a file to local
 * @apiName Update user profile
 * @apiGroup File
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (File) {File} file File
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "file_id": 1,
 *     "name": "ABC.png"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 *
 */
fileRouter.post('/file/company-logo/update', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user;
    let fileObj = {};
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, fileData, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED!' });
      }

      const extension = mime.extension(mime_type);
      let main_file_data_length = 0,
        content = '';
      fileData.on('data', data => {
        main_file_data_length += data.length;
        content += data;
      });

      fileData.on('end', async data => {
        let user = await User.findOne({
          where: {
            id: user_id
          },
          include: [...User.getStandardInclude()]
        });

        let file_instance = {
          name: filename,
          created_by: user_id,
          modified_by: user_id,
          mime_type,
          extension,
          content: content,
          storage_type: StorageType.LOCAL,
          file_size: main_file_data_length, //bytes
          metadata: JSON.stringify({ encoding: encoding })
        };
        if (user.org && user.org.company_logo_file_id) {
          await File.update(file_instance, {
            where: {
              id: user.org.company_logo_file_id
            }
          });
          fileObj = {
            file_id: user.org.company_logo_file_id,
            name: filename
          };
          res.send(fileObj);
          return;
        } else if (user.org) {
          await sequelize.transaction(async transaction => {
            let { id: file_id, name } = await File.create(file_instance, { transaction });
            await Organization.update(
              {
                company_logo_file_id: file_id
              },
              {
                where: {
                  id: user.org.id
                },
                transaction
              }
            );

            fileObj = {
              file_id,
              name
            };
          });
          res.send(fileObj);
          return;
        } else {
          return res.status(405).send({
            message: 'No organization found'
          });
        }
      });
    });

    req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

// get profile picture
fileRouter.get('/file/company-logo/:file_id', isAuthenticated(), async (req, res, next) => {
  try {
    let { file_id } = req.params;
    if (!file_id) {
      return res.status(400).send({ message: 'VAL_FAILED!' });
    }

    let fileRes = await File.findOne({
      where: {
        id: file_id,
        deleted: false
      }
    });

    if (!fileRes) {
      return res.status(404).send({ message: 'FILE_404!' });
    }

    res.send(fileRes);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

export default fileRouter;
