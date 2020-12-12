'use strict';

const { database } = require('../../config');
module.exports = (sequelize, DataTypes) => {
  const PaymentType = sequelize.define(
    'PaymentType',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      label: {
        type: DataTypes.STRING
      },
      value: {
        type: DataTypes.STRING
      },
      sequence: {
        type: DataTypes.INTEGER
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

  PaymentType.associate = function(models) {};
  return PaymentType;
};
