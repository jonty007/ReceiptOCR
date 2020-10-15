'use strict';
const { database } = require('../../config');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert({
      // table name is pluralised name
      tableName: 'SubscriptionPlans',
      schema: database.schema
    },
      [{
        plan_type: 'MONTHLY',
        plan_name: "Free Plan",
        duration: 1,
        duration_unit: "month",
        amount: 0.00,
        sequence: 1,
        stripe_subscription_id: "prod_IB5odmnRPmbPWn",
        stripe_subscription_price: "plan_IB5o6yXmXKIfGQ",
        created_by: 0,
        modified_by: 0
      },
      {
        plan_type: 'MONTHLY',
        plan_name: "Individual",
        duration: 1,
        duration_unit: "month",
        amount: 20,
        sequence: 2,
        stripe_subscription_id: "prod_IB4rVAsXcuRSyl",
        stripe_subscription_price: "plan_IB4r4i1fJd02lF",
        created_by: 0,
        modified_by: 0
      },
      {
        plan_type: 'MONTHLY',
        plan_name: "Organization",
        duration: 1,
        duration_unit: "month",
        amount: 200,
        sequence: 3,
        stripe_subscription_id: "prod_IB4s700Y1wxVQR",
        stripe_subscription_price: "plan_IB4xudA9uZfpiz",
        created_by: 0,
        modified_by: 0
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete({
      // table name is pluralised name
      tableName: 'SubscriptionPlans',
      schema: database.schema
    }, [{
      plan_name: "Organization",
    },
    {
      plan_name: "Individual",
    },
    {
      plan_name: "Free Plan",
    }
  ], {});
  }
};
