'use strict';

const { database } = require('../../config');
module.exports = (sequelize, DataTypes) => {
  const ReceiptAmount = sequelize.define(
    'ReceiptAmount',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      receipt_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tax_percentage: {
        type: DataTypes.FLOAT
      },
      net: {
        type: DataTypes.FLOAT
      },
      tax: {
        type: DataTypes.FLOAT
      },
      sum: {
        type: DataTypes.FLOAT
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

  ReceiptAmount.associate = function(models) {};
  return ReceiptAmount;
};
