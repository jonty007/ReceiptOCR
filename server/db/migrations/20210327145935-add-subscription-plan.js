'use strict';
const { database } = require('../../config');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn({
          // table name is pluralised name
          tableName: 'Users',
          schema: database.schema
        },
        'subscription_plan', {
          type: Sequelize.INTEGER,
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
          tableName: 'Users',
          schema: database.schema
        },
        'subscription_plan', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
