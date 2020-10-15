import { EmailContentTemplate } from '../../../db';

const dot = require('dot'),
  path = require('path'),
  emailService = require('./email_service'),
  { logger } = require('../../../app/app.logger'),
  { EmailLog } = require('../../../db'),
  config = require('../../../config');

dot.log = false; // remove logs
const baseTemplates = dot.process({
  path: path.join(__dirname, 'templates')
});

class EmailBaseTemplate {
  constructor({ subject_fn, content_fn } = {}) {
    this.subject_fn = subject_fn;
    this.content_fn = content_fn;
  }

  async send({ to, subject_params, content_params, attachments = [], use_alias = false }) {
    const subject = this.subject_fn(subject_params || {}),
      html = this.content_fn(content_params || {});

    await emailService.send({ to, subject, html, attachments, use_alias });
  }
}

class EmailTemplate extends EmailBaseTemplate {
  constructor({ name_id } = {}) {
    if (!name_id) {
      throw new Error('name_id is required for email template');
    }

    super({});

    this.name_id = name_id;
    this.initEmailTemplate();
  }

  async initEmailTemplate() {
    const contentTemplate = await EmailContentTemplate.findOne({
      where: {
        name_id: this.name_id
      }
    });

    if (
      !contentTemplate ||
      !contentTemplate.content_template ||
      !contentTemplate.subject_template
    ) {
      return;
    }

    const { content_template, subject_template } = contentTemplate;

    const compiled_html = baseTemplates['default']({
        content: content_template
      }),
      content_fn = dot.template(compiled_html),
      subject_fn = dot.template(subject_template);

    super.constructor({ subject_fn, content_fn });
  }

  async send({ to, subject_params, content_params, attachments, use_alias }) {
    if (subject_params) {
      subject_params.config = config;
    } else {
      // eslint-disable-next-line no-param-reassign
      subject_params = {
        config
      };
    }

    if (content_params) {
      content_params.config = config;
    } else {
      // eslint-disable-next-line no-param-reassign
      content_params = {
        config
      };
    }

    const email_log = await EmailLog.create({
      email_to: to,
      type: this.name_id,
      params: JSON.stringify({
        subject_params,
        content_params,
        attachments,
        use_alias
      })
    }).catch(logger.error);

    try {
      await super.send({
        to,
        subject_params,
        content_params,
        attachments,
        use_alias
      });
      email_log && email_log.update({ sent: true }).catch(logger.error);
    } catch (e) {
      email_log &&
        email_log
          .update({
            errors: JSON.stringify(e)
          })
          .catch(logger.error);
      throw e;
    }
  }
}

module.exports = {
  EmailBaseTemplate,
  EmailTemplate
};
