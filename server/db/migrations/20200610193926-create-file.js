'use strict';

const { database } = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Files',
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
        extension: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        image_sizes: {
          type: Sequelize.TEXT
        },
        file_size: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        metadata: {
          type: Sequelize.TEXT
        },
        mime_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        location: {
          type: Sequelize.TEXT
        },
        storage_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        content: {
          type: Sequelize.BLOB('long')
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
    return queryInterface.dropTable('Files');
  }
};
