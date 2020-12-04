'use strict';
const { database } = require('../../config');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'ReceiptAmounts',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          receipt_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          tax_percentage: {
            type: Sequelize.FLOAT
          },
          net: {
            type: Sequelize.FLOAT
          },
          tax: {
            type: Sequelize.FLOAT
          },
          sum: {
            type: Sequelize.FLOAT
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
        },
        {
          transaction
        }
      );

      await queryInterface.addIndex(
        `${database.schema}.ReceiptAmounts`,
        ['receipt_id'],
        {
          unique: false
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ReceiptAmounts');
  }
};