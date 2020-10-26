'use strict';

const { database } = require('../../config');
module.exports = (sequelize, DataTypes) => {
  const SubscriptionPlan = sequelize.define(
    'SubscriptionPlan',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      plan_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      plan_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      duration_unit: {
        type: DataTypes.STRING,
        allowNull: false
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      stripe_subscription_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      stripe_subscription_price: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      modified_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      modified_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
        allowNull: false
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      underscored: true,
      schema: database.schema
    }
  );
  SubscriptionPlan.associate = function(models) {
    // associations can be defined here
  };
  return SubscriptionPlan;
};
