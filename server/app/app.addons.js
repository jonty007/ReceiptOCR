const emailService = require('../common/services/email/email_service'),
  stripeService = require('../boundaries/stripe'),
  s3Boundary = require('../boundaries/s3'),
  azureStorage = require('../boundaries/azure_storage'),
  firebaseBoundary = require('../boundaries/firebase'),
  azureOCR = require('../boundaries/azure_ocr');
// socketBoundary = require('../boundaries/socket');

/**
 * addons configuration file
 */
module.exports = function(http_server, config) {
  const { mail_type, aws, smtp, mailOptions, stripe, azure, firebase } = config;

  // Configure email
  emailService.init({ mail_type, aws, smtp, mailOptions });

  // initialize s3
  s3Boundary.init(aws);

  // initialize stripe
  stripeService.init(stripe);

  // initialize Azure Storage
  azureStorage.init(azure);

  firebaseBoundary.init(firebase);

  azureOCR.init(azure)

  // init socketBoundary
  // socketBoundary.init(http_server);
  // require('../common/services/socket');
};
