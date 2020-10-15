'use strict';

const { database } = require('../../config');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert(
        {
          tableName: 'EmailBaseTemplates',
          schema: database.schema
        },
        [
          {
            name: 'default',
            format: 'dot',
            content: `
          <!DOCTYPE html>
          <html lang="en">
          
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="Content-Type"
                  content="text/html; charset=UTF-8" />
            <meta http-equiv="X-UA-Compatible"
                  content="ie=edge,chrome=1" />
            <meta name="format-detection"
                  content="telephone=no" />
            <!-- disable auto telephone linking in iOS -->
            <title>Email</title>
            <style type="text/css">
              @font-face {
                font-family: 'Open Sans';
                font-weight: 400;
                src: local('Open Sans'), local('OpenSans'),
                  url(http://themes.googleusercontent.com/static/fonts/opensans/v6/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
              }
          
              * {
                box-sizing: border-box !important;
                font-family: 'Open Sans', Gill Sans, Arial, Helvetica, sans-serif;
              }
          
              html,
              body {
                width: 100% !important;
                min-width: 100% !important;
                /* Force iOS Mail to render the email at full width. */
                margin: 0;
                padding: 0;
                text-align: center;
                background-color: #f9fafc;
              }
          
              .main-container {
                width: 100% !important;
                min-width: 100% !important;
                /* Force iOS Mail to render the email at full width. */
                margin: 0;
                padding: 0;
                text-align: center;
                background-color: #f9fafc;
              }
          
              .main-wrapper {
                position: relative;
                display: inline-block;
                max-width: 100% !important;
                margin: 50px 30px;
                padding: 35px;
                text-align: left;
                color: #878787;
                font-family: 'Open Sans', Gill Sans, Arial, Helvetica, sans-serif;
                font-size: 15px;
                text-align: center;
              }
          
              .content-wrapper {
                position: relative;
                display: inline-block;
                width: 80%;
                max-width: 500px;
                margin: 50px 30px;
                margin-bottom: 70px;
                padding: 35px;
                text-align: left;
                background-color: white;
                color: #878787;
                font-family: 'Open Sans', Gill Sans, Arial, Helvetica, sans-serif;
                font-size: 15px;
              }
          
              .bg {
                position: absolute;
                top: 0px;
                left: 0;
                right: 0;
                font-size: 11px;
                text-align: center;
                width: 100%;
                height: 50%;
                display: flex;
                background-image: url('http://www.florida-palm-trees.com/wp-content/uploads/2010/02/palm-trees1.jpg');
                background-size: cover;
                background-repeat: no-repeat;
                background-color: #eeeeee;
              }
          
              .footer {
                position: absolute;
                bottom: 5px;
                left: 0;
                right: 0;
                font-size: 11px;
                text-align: center;
                width: 100%;
                display: block;
              }
          
              .line {
                padding: 2px 0px;
              }
          
              .bolder-text {
                font-weight: 600;
                font-family: 'Open Sans', Gill Sans, Arial, Helvetica, sans-serif;
              }
          
              .italic-text {
                font-style: italic;
              }
          
            </style>
          </head>
          
          <body>
            <div class="main-container">
              <div class="main-wrapper">
                <div class="bg"></div>
                <div class="content-wrapper">
                  {{= it.content}}
                  <p>
                    Cheers,
                    <br />
                    Team App
                  </p>
                </div>
          
                <div class="footer">
                  <div class="line">View Privacy Policy | Unsubscribe</div>
                  <div class="line">PSR Prime Tower</div>
                  <div class="line">Hyderabad, Telangana 500084</div>
                </div>
              </div>
            </div>
          </body>

          </html>          
          `,
            created_by: 0,
            modified_by: 0
          }
        ],
        {
          transaction
        }
      );

      await queryInterface.bulkInsert(
        {
          tableName: 'EmailContentTemplates',
          schema: database.schema
        },
        [
          {
            name_id: 'verifyNewUserEmail',
            base_template_id: 1,
            subject_template: `Verify your email`,
            content_template: `
            <p>Hi {{= it.name }},</p>
          
            <p>
              Complete your registration <a href="{{= it.config.host}}/verifyAccount/{{= it.invitation_token}}" target="_blank">here</a>
            </p>
    
            <p>
              For more help reach out to <a href = "mailto:{{= it.config.emailDetails.supportEmail}}">{{= it.config.emailDetails.supportEmail}}</a>
            </p>
            `,
            created_by: 0,
            modified_by: 0
          },
          {
            name_id: 'inviteNewUserEmail',
            base_template_id: 1,
            subject_template: `{{= it.invited_by_user_name }} invited you to {{= it.config.emailDetails.appName}}`,
            content_template: `
            <p>Hi {{= it.name }},</p>
          
            <p>
              You have been invited by {{= it.invited_by_user_name }} to join {{= it.config.emailDetails.appName}}.
            </p>
            
            <p>
              Complete your registration <a href="{{= it.config.host}}/createPassword/{{= it.invitation_token}}" target="_blank">here</a>
            </p>

            <p>
              For more help reach out to <a href = "mailto:{{= it.config.emailDetails.supportEmail}}">{{= it.config.emailDetails.supportEmail}}</a>
            </p>
            `,
            created_by: 0,
            modified_by: 0
          },
          {
            name_id: 'welcomeEmail',
            base_template_id: 1,
            subject_template: `Welcome to {{= it.config.emailDetails.appName}}`,
            content_template: `
            <p>Hi {{= it.name }},</p>

            <p>Welcome to {{= it.config.emailDetails.appName}}!</p>

            <p>
              You have successfully completed your registration. Get started by logging in to <a href="{{= it.config.host}}/signin" target="_blank">{{= it.config.emailDetails.appName}}</a>.
            </p>
            `,
            created_by: 0,
            modified_by: 0
          },
          {
            name_id: 'forgotEmail',
            base_template_id: 1,
            subject_template: `{{= it.config.emailDetails.appName}} Password Reset Request`,
            content_template: `
            <p>Hi {{= it.name }},</p>

            <p>We recently received a request to reset your account password.</p>

            <p>
              You can reset it by
              <a href="{{= it.config.host}}/resetPassword/{{= it.reset_code }}">clicking&nbsp;here</a>.
            </p>

            <p>
              If you didn’t request this, please ignore this email or contact us if you believe someone
              is trying to access your account.
            </p>
            `,
            created_by: 0,
            modified_by: 0
          }
        ],
        {
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete(
        {
          tableName: 'EmailBaseTemplates',
          schema: database.schema
        },
        [
          {
            name: 'default'
          }
        ],
        {
          transaction
        }
      );

      await queryInterface.bulkDelete(
        {
          tableName: 'EmailContentTemplates',
          schema: database.schema
        },
        [
          {
            name_id: 'verifyNewUserEmail'
          },
          {
            name_id: 'inviteNewUserEmail'
          },
          {
            name_id: 'welcomeEmail'
          },
          {
            name_id: 'forgotEmail'
          }
        ],
        {
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
