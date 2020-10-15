'use strict';

const { database } = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'EmailContentTemplates',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name_id: {
          type: Sequelize.STRING
        },
        base_template_id: {
          type: Sequelize.INTEGER
        },
        subject_template: {
          type: Sequelize.TEXT
        },
        content_template: {
          type: Sequelize.TEXT
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE(6),
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
          allowNull: false
        },
        modified_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        modified_at: {
          type: Sequelize.DATE(6),
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
          onUpdate: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
          allowNull: false
        },
        deleted: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        deleted_at: {
          type: Sequelize.DATE(6),
          allowNull: true
        }
      },
      {
        schema: database.schema
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('EmailContentTemplates');
  }
};
