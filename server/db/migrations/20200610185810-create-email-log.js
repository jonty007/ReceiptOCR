'use strict';

const { database } = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'EmailLogs',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email_to: {
          type: Sequelize.STRING,
          allowNull: false
        },
        params: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        sent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        errors: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        modified_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        }
      },
      {
        schema: database.schema
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('EmailLogs');
  }
};
