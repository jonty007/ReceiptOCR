// const config = require('../../../config'),
const { EmailTemplate } = require('./email_creator');
// prettier-ignore
const MAX_ATTACHMENTS_SIZE_MB = 15,
  MAX_ATTACHMENTS_SIZE_BYTES = MAX_ATTACHMENTS_SIZE_MB * 1024 * 1024, // bytes

  /**
   * inviteNewUser.send
   *
   * @param to
   * @param content_params.name
   * @param content_params.invitation_code
   */
  verifyNewUser = new EmailTemplate({
    name_id: 'verifyNewUserEmail'
  }),
  /**
   * inviteNewUser.send
   *
   * @param to
   * @param subject_params.invited_by_user_name
   * @param content_params.name
   * @param content_params.invitation_code
   */
  inviteNewUser = new EmailTemplate({
    name_id: 'inviteNewUserEmail'
  }),

  /**
   * welcomeEmail.send
   *
   * @param to
   * @param content_params.name
   */
  welcomeEmail = new EmailTemplate({
    name_id: 'welcomeEmail'
  }),

  /**
   * forgotEmail.send
   *
   * @param to
   * @param content_params.name
   * @param content_params.reset_code
   */
  forgotEmail = new EmailTemplate({
    name_id: 'forgotEmail'
  });

module.exports = {
  MAX_ATTACHMENTS_SIZE_MB,
  MAX_ATTACHMENTS_SIZE_BYTES,
  verifyNewUser,
  inviteNewUser,
  welcomeEmail,
  forgotEmail
};
