import { logger } from '../app/app.logger';
const axios = require('axios');


let config, api, link;

const init = async function(firebase) {
    if (
      firebase &&
      firebase.config
    ) {
      config = firebase.config;

      if (!config) {
        logger.error('Could not initialize Firebase');
        return;
      }
      api = firebase.api;
      link  = firebase.link;
    } else {
      logger.error('Could not initialize Azure Storage');
    }
  },
  createLink = async function(action, code) {
    config.dynamicLinkInfo.link = `${link}/${action}/${code}`;
    let response =  await axios.post(api, config);
    return response.data;
  };

export {
  init,
  createLink
};
