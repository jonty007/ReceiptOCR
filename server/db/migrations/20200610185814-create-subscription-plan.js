'use strict';

const { database } = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'SubscriptionPlans',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        plan_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        plan_name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        duration: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        duration_unit: {
          type: Sequelize.STRING,
          allowNull: false
        },
        amount: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        sequence: {
          type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('SubscriptionPlans');
  }
};
