import Promise from 'bluebird';
import nodemailer from 'nodemailer';
import ses from 'nodemailer-ses-transport';
import Queue from 'promise-queue';
// import { logger } from '../../../app/app.logger';

Queue.configure(Promise);
const maxPendingPromises = 2, // 2 concurrent emails sent at once
  maxQueuedPromises = Infinity,
  queue = new Queue(maxPendingPromises, maxQueuedPromises);

let transporter, email_config;

// NOTE: OFFICE 365 daily limit is 10000

const init = ({ mail_type, aws, smtp, mailOptions = {} } = {}) => {
    email_config = { mail_type, aws, smtp, mailOptions };

    if (email_config.mail_type === 'aws') {
      transporter = nodemailer.createTransport(
        ses({
          accessKeyId: email_config.aws.AWS_ACCESS_KEY_ID,
          secretAccessKey: email_config.aws.AWS_SECRET_ACCESS_KEY
        })
      );
    } else {
      // Assumes SMTP
      transporter = nodemailer.createTransport(email_config.smtp);
    }
  },
  send = ({ html = '', to, subject, attachments = [], use_alias = false } = {}) =>
    queue.add(
      () =>
        new Promise((resolve, reject) => {
          const receivers = Array === to.constructor ? to.join(', ') : to,
            mailOptions = Object.assign(
              {},
              email_config.mailOptions,
              {
                to: receivers,
                subject: subject || 'Info',
                text: html.replace(/<\/?[^>]+(>|$)/g, ''),
                html,
                attachments
              },
              use_alias ? { from: email_config.mailOptions.from } : {}
            );

          // logger.debug({ mailOptions });
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              return reject(err);
            }
            return resolve(info.response);
          });
        })
    );

module.exports = {
  init,
  send
};
