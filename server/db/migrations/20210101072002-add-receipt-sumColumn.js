'use strict';
const { database } = require('../../config');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn({
          // table name is pluralised name
          tableName: 'Receipts',
          schema: database.schema
        },
        'tax_sum', {
          type: Sequelize.TEXT,
          allowNull: true
        }, { transaction }
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
      await queryInterface.removeColumn({
          // table name is pluralised name
          tableName: 'Receipts',
          schema: database.schema
        },
        'tax_sum', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
