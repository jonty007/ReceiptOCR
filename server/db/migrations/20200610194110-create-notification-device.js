'use strict';

const { database } = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'NotificationDevices',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        registration_id: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        uuid: {
          type: Sequelize.STRING,
          allowNull: false
        },
        platform: {
          type: Sequelize.STRING,
          allowNull: false
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        },
        modified_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        modified_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        },
        deleted: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      },
      {
        schema: database.schema
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('NotificationDevices');
  }
};
