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
        stripe_subscription_id: "prod_IDLU7OJ4YOa9hg",
        stripe_subscription_price: "plan_IDLVGIlyg88SLV",
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
        stripe_subscription_id: "prod_IDLW085f4dL4Bx",
        stripe_subscription_price: "plan_IDLWF40LBbhzb7",
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
        stripe_subscription_id: "prod_IDLWj3p3SgcHAc",
        stripe_subscription_price: "plan_IDLXrzkBpeQmpY",
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
