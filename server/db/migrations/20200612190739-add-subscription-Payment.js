'use strict';
const { database } = require('../../config');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn({
          tableName: 'Payments',
          schema: database.schema
        },
        'stripe_customer_id', {
          type: Sequelize.STRING,
          allowNull: false
        }, { transaction }
      );

      await queryInterface.changeColumn({
          tableName: 'Payments',
          schema: database.schema
        },
        'source_id', {
          type: Sequelize.STRING,
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
          tableName: 'Payments',
          schema: database.schema
        },
        'stripe_customer_id', {
          type: Sequelize.INTEGER,
          allowNull: false
        }, { transaction }
      );

      await queryInterface.changeColumn({
          tableName: 'Payments',
          schema: database.schema
        },
        'source_id', {
          type: Sequelize.INTEGER,
          allowNull: false
        }, { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
