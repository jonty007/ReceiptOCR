import { logger } from '../app/app.logger';

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

let config, containerName, blobServiceClient;

const init = async function(azure) {
    if (
      azure &&
      azure.storage &&
      azure.storage.accountName &&
      azure.storage.key &&
      azure.storage.baseURL &&
      azure.storage.containerName
    ) {
      config = azure.storage;

      if (!config) {
        logger.error('Could not initialize Azure Storage');
        return;
      }

      const sharedKeyCredential = new StorageSharedKeyCredential(config.accountName, config.key);
      blobServiceClient = new BlobServiceClient(config.baseURL, sharedKeyCredential);

      await exports.changeContainer(config.containerName);
    } else {
      logger.error('Could not initialize Azure Storage');
    }
  },
  changeContainer = async function(name) {
    try {
      containerName = name;
      const createContainerResponse = await exports.createContainer();
      return { status: 200, data: createContainerResponse };
    } catch (error) {
      return { status: 400, message: error };
    }
  },
  createContainer = async function() {
    try {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const createContainerResponse = await containerClient.createIfNotExists();
      return { status: 200, data: createContainerResponse };
    } catch (error) {
      return { status: 400, message: error };
    }
  },
  getContainersList = async function() {
    try {
      const containers = [];
      for await (const container of blobServiceClient.listContainers()) {
        containers.push(container);
      }
      return { status: 200, data: containers };
    } catch (error) {
      return { status: 400, message: error };
    }
  },
  uploadBlob = async function(name, content) {
    try {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const containerExists = await containerClient.exists();
      if (!containerExists) {
        return { status: 400, message: 'Container doesnot exists' };
      }
      const blockBlobClient = containerClient.getBlockBlobClient(name);
      const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
      return { status: 200, data: uploadBlobResponse };
    } catch (error) {
      return { status: 400, message: error };
    }
  },
  getBlobsList = async function() {
    try {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobs = [];
      for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push(blob);
      }
      return { status: 200, data: blobs };
    } catch (error) {
      return { status: 400, message: error };
    }
  },
  downloadBlob = async function(name) {
    try {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const containerExists = await containerClient.exists();
      if (!containerExists) {
        return { status: 400, message: 'Container doesnot exists' };
      }
      const blobClient = containerClient.getBlobClient(name);
      const blobExists = await blobClient.exists();
      if (!blobExists) {
        return { status: 400, message: 'Blob doesnot exists' };
      }
      const downloadBlockBlobResponse = await blobClient.download();

      const downloaded = await exports.streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
      return { status: 200, data: downloaded };
    } catch (error) {
      return { status: 400, message: error };
    }
  },
  downloadAsFile = async function(name, filePath) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
      const containerExists = await containerClient.exists();
      if (!containerExists) {
        return { status: 400, message: 'Container doesnot exists' };
      }
      const blobClient = containerClient.getBlobClient(name);
      const blobExists = await blobClient.exists();
      if (!blobExists) {
        return { status: 400, message: 'Blob doesnot exists' };
      }
      await blobClient.downloadToFile(filePath);
  },
  streamToBuffer = async function(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', data => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  };

export {
  init,
  changeContainer,
  createContainer,
  getContainersList,
  uploadBlob,
  getBlobsList,
  downloadBlob,
  streamToBuffer,
  downloadAsFile
};
