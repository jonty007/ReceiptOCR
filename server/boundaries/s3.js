import Promise from 'bluebird';
import fs from 'fs';
import crypto from 'crypto';
import { logger } from '../app/app.logger';
import { awsEncryption } from '../config';

let config, AWS;

const init = function(conf) {
    if (conf != null) {
      config = conf;
      process.env.AWS_ACCESS_KEY_ID = config.AWS_ACCESS_KEY_ID;
      process.env.AWS_SECRET_ACCESS_KEY = config.AWS_SECRET_ACCESS_KEY;
      AWS = require('aws-sdk');
      AWS.config.region = config.region;
    } else {
      logger.error('Could not initialize S3');
    }
  },
  upload = function(filename, file, encoding, mimetype) {
    if (config.s3 == null) {
      throw new Error('Missing configuration for AWS s3');
    }
    return new Promise(function(resolve, reject) {
      const s3obj = new AWS.S3({ params: { Bucket: config.s3.bucket, Key: filename } });

      s3obj
        .upload({ Body: file, ContentType: mimetype, ContentEncoding: encoding })
        .send(function(err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
    });
  },
  encryptUpload = function(filename, file, encoding, mimetype) {
    if (config.s3 == null) {
      throw new Error('Missing configuration for AWS s3');
    }
    return new Promise(function(resolve, reject) {
      const s3obj = new AWS.S3({ params: { Bucket: config.s3.bucket, Key: filename } });
      const encrypt = crypto.createCipheriv(
        awsEncryption.algorithm,
        awsEncryption.secret_key,
        awsEncryption.nonce,
        {
          authTagLength: 16
        }
      );

      s3obj
        .upload({ Body: file.pipe(encrypt), ContentType: mimetype, ContentEncoding: encoding })
        .send(function(err, data) {
          if (err) {
            return reject(err);
          }
          resolve({ data, authTag: JSON.stringify(encrypt.getAuthTag().toJSON()) });
        });
    });
  },
  getReadStream = function(filename) {
    if (config.s3 == null) {
      throw new Error('Missing configuration for AWS s3');
    }
    const s3 = new AWS.S3(),
      params = { Bucket: config.s3.bucket, Key: filename };
    return s3.getObject(params).createReadStream();
  },
  getFileObject = function(filename) {
    if (config.s3 == null) {
      throw new Error('Missing configuration for AWS s3');
    }
    const s3 = new AWS.S3(),
      params = { Bucket: config.s3.bucket, Key: filename };
    return s3.getObject(params).promise();
  },
  read = function({ location, size, res }) {
    let filename = location;
    if (size != null) {
      const index = filename.lastIndexOf('.');
      filename = `${filename.slice(0, index)}_${size}${filename.slice(index)}`;
    }

    console.warn(filename);
    return new Promise((resolve, reject) => {
      exports
        .getReadStream(filename)
        .on('error', err => reject(err))
        .pipe(res)
        .on('error', err => reject(err))
        .on('finish', () => resolve());
    });
  },
  decryptRead = function({ location, size, metadata, res }) {
    let filename = location,
      { authTag } = JSON.parse(metadata);
    authTag = JSON.parse(authTag);
    if (size != null) {
      const index = filename.lastIndexOf('.');
      filename = `${filename.slice(0, index)}_${size}${filename.slice(index)}`;
    }
    const decrypt = crypto.createDecipheriv(
      awsEncryption.algorithm,
      awsEncryption.secret_key,
      awsEncryption.nonce
    );
    decrypt.setAuthTag(Buffer.from(authTag));

    console.warn(filename);
    return new Promise((resolve, reject) => {
      const file = exports.getReadStream(filename);
      file
        .pipe(decrypt)
        .on('error', err => reject(err))
        .pipe(res)
        .on('error', err => reject(err))
        .on('finish', () => resolve());
    });
  },
  /**
   * copy - copy one file object to another file object with a different name
   * @param {String} originFilename
   * @param {String} targetFilename
   */
  copy = function(originFilename, targetFilename) {
    return new Promise(function(resolve, reject) {
      const s3 = new AWS.S3(),
        params = {
          Bucket: config.s3.bucket,
          Key: targetFilename,
          CopySource: `${config.s3.bucket}/${originFilename}`
        };
      s3.copyObject(params, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  },
  /**
   * remove - remove a file by the file name
   * @param {String} filename
   */

  remove = function(filename) {
    if (config.s3 == null) {
      throw new Error('Missing configuration for AWS s3');
    }
    return new Promise(function(resolve, reject) {
      const s3 = new AWS.S3(),
        params = { Bucket: config.s3.bucket, Key: filename };
      s3.deleteObject(params, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  },
  removeFromUrl = function(url) {
    const filename = url.slice(url.lastIndexOf('/') + 1);
    return remove(filename);
  },
  readAndCreateFileLocally = function(url, copyFilePath) {
    return new Promise(function(resolve, reject) {
      let fileName = url;
      const index = fileName.lastIndexOf('/');
      fileName = fileName.slice(index + 1);
      const file = fs.createWriteStream(copyFilePath + fileName);
      file.on('close', function() {
        resolve();
      });
      getReadStream(fileName).pipe(file);
    });
  },
  getSignedUrl = function(filename) {
    if (config.s3 == null) {
      throw new Error('Missing configuration for AWS s3');
    }
    const s3 = new AWS.S3(),
      params = { Bucket: config.s3.bucket, Key: filename };
    return s3.getSignedUrl('getObject', params);
  };

export {
  init,
  upload,
  getReadStream,
  read,
  copy,
  remove,
  removeFromUrl,
  readAndCreateFileLocally,
  getFileObject,
  getSignedUrl,
  encryptUpload,
  decryptRead
};
