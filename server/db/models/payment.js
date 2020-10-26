'use strict';

const { database } = require('../../config');
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      org_id: {
        type: DataTypes.INTEGER
      },
      stripe_customer_id: {
        type: DataTypes.STRING
      },
      source_id: {
        type: DataTypes.STRING
      },
      stripe_card_id: {
        type: DataTypes.STRING
      },
      subscription_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      payment_type: {
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
  Payment.associate = function(models) {
    Payment.User = Payment.belongsTo(models.User, {
      as: 'user',
      targetKey: 'id',
      foreignKey: { name: 'user_id', allowNull: false }
    });

    Payment.Organization = Payment.belongsTo(models.Organization, {
      as: 'org',
      targetKey: 'id',
      foreignKey: { name: 'org_id', allowNull: true }
    });

    Payment.SubscriptionPlan = Payment.belongsTo(models.SubscriptionPlan, {
      as: 'subscriptionPlan',
      targetKey: 'id',
      foreignKey: { name: 'subscription_plan_id', allowNull: false }
    });
  };
  return Payment;
};
