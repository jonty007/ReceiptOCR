import { logger } from '../app/app.logger';

const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { ApiKeyCredentials } = require('@azure/ms-rest-js');
const sleep = require('util').promisify(setTimeout);

let config, client;
const init = function(azure) {
    if (azure && azure.vision && azure.vision.endpoint && azure.vision.key) {
      config = azure.vision;
      if (!config) {
        logger.error('Could not initialize Azure OCR');
        return;
      }
      client = new ComputerVisionClient(
        new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': config.key } }),
        config.endpoint
      );
    } else {
      logger.error('Could not initialize Azure OCR');
    }
  },
  extractReceipt = async function(receiptStream) {
    try {
      let result = await client.readInStream(receiptStream);
      let operation = result.operationLocation.split('/').slice(-1)[0];

      let count = 0;

      while (result.status !== 'succeeded') {
        if (result.status === 'failed' || count >= 10) {
          break;
        }

        await sleep(1000);
        result = await client.getReadResult(operation);
        count++;
      }

      return result;
    } catch (err) {
      logger.error(err);
      return {};
    }
  };

export { init, extractReceipt };
