'use strict';

const { database } = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'OrgTypes',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
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
    return queryInterface.dropTable('OrgTypes');
  }
};
