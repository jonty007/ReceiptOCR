'use strict';
const { database } = require('../../config');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn({
          // table name is pluralised name
          tableName: 'SubscriptionPlans',
          schema: database.schema
        },
        'stripe_subscription_id', {
          type: Sequelize.TEXT,
          allowNull: true
        }, { transaction }
      );

      await queryInterface.addColumn({
          // table name is pluralised name
          tableName: 'SubscriptionPlans',
          schema: database.schema
        },
        'stripe_subscription_price', {
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
          tableName: 'SubscriptionPlans',
          schema: database.schema
        },
        'stripe_subscription_id', { transaction }
      );

      await queryInterface.removeColumn({
          // table name is pluralised name
          tableName: 'SubscriptionPlans',
          schema: database.schema
        },
        'stripe_subscription_price', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
