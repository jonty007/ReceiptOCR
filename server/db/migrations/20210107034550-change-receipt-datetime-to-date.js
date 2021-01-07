'use strict';
const { database } = require('../../config');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn({
          tableName: 'Receipts',
          schema: database.schema
        },
        'invoice_date', {
          type: Sequelize.DATEONLY,
          allowNull: false
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
      await queryInterface.changeColumn({
          tableName: 'Receipts',
          schema: database.schema
        },
        'invoice_date', {
          type: Sequelize.DATE,
          allowNull: DATE
        }, { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
