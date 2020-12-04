'use strict';
const { database } = require('../../config');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'Receipts',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          user_id: {
            type: Sequelize.INTEGER
          },
          org_id: {
            type: Sequelize.INTEGER
          },
          company_name: {
            type: Sequelize.STRING
          },
          receipt_file_id: {
            type: Sequelize.INTEGER
          },
          invoice_date: {
            type: Sequelize.DATE
          },
          receipt_number: {
            type: Sequelize.STRING
          },
          company_payment: {
            type: Sequelize.BOOLEAN
          },
          note: {
            type: Sequelize.TEXT
          },
          category: {
            type: Sequelize.STRING
          },
          lifelong_warranty: {
            type: Sequelize.BOOLEAN
          },
          warranty_unit: {
            type: Sequelize.STRING
          },
          warranty_value: {
            type: Sequelize.INTEGER
          },
          unlimited_return: {
            type: Sequelize.BOOLEAN
          },
          return_unit: {
            type: Sequelize.STRING
          },
          return_value: {
            type: Sequelize.INTEGER
          },
          paid_with: {
            type: Sequelize.STRING
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
        `${database.schema}.Receipts`,
        ['company_name'],
        {
          unique: false
        },
        { transaction }
      );

      await queryInterface.addIndex(
        `${database.schema}.Receipts`,
        ['receipt_number'],
        {
          unique: false
        },
        { transaction }
      );

      await queryInterface.addIndex(
        `${database.schema}.Receipts`,
        ['company_payment'],
        {
          unique: false
        },
        { transaction }
      );

      await queryInterface.addIndex(
        `${database.schema}.Receipts`,
        ['user_id'],
        {
          unique: false
        },
        { transaction }
      );

      await queryInterface.addIndex(
        `${database.schema}.Receipts`,
        ['org_id'],
        {
          unique: false
        },
        { transaction }
      );

      await queryInterface.addIndex(
        `${database.schema}.Receipts`,
        ['category'],
        {
          unique: false
        },
        { transaction }
      );

      await queryInterface.addIndex(
        `${database.schema}.Receipts`,
        ['paid_with'],
        {
          unique: false
        },
        { transaction }
      );

      await queryInterface.addIndex(
        `${database.schema}.Receipts`,
        ['warranty_unit'],
        {
          unique: false
        },
        { transaction }
      );

      await queryInterface.addIndex(
        `${database.schema}.Receipts`,
        ['return_unit'],
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
    return queryInterface.dropTable('Receipts');
  }
};