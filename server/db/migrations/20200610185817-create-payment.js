'use strict';

const { database } = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Payments',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        org_id: {
          type: Sequelize.INTEGER
        },
        stripe_customer_id: {
          type: Sequelize.INTEGER
        },
        source_id: {
          type: Sequelize.INTEGER
        },
        stripe_card_id: {
          type: Sequelize.STRING
        },
        subscription_plan_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        payment_type: {
          type: Sequelize.STRING,
          allowNull: false
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
    return queryInterface.dropTable('Payments');
  }
};
