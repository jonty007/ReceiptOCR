'use strict';

const { database } = require('../../config');
module.exports = (sequelize, DataTypes) => {
  const Receipt = sequelize.define(
    'Receipt',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      company_name: { 
        type: DataTypes.STRING,
        allowNull: false
      },
      receipt_file_id: { 
        type: DataTypes.INTEGER
      },
      invoice_date: { 
        type: DataTypes.DATE,
        allowNull: false
      },
      receipt_number: { 
        type: DataTypes.STRING
      },
      company_payment: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      note: { 
        type: DataTypes.TEXT
      },
      category_id: { 
        type: DataTypes.INTEGER,
        allowNull: false
      },
      lifelong_warranty: { 
        type: DataTypes.BOOLEAN
      },
      warranty_unit_id: { 
        type: DataTypes.INTEGER
      },
      warranty_value: { 
        type: DataTypes.INTEGER
      },
      unlimited_return: { 
        type: DataTypes.BOOLEAN
      },
      return_unit_id: { 
        type: DataTypes.INTEGER
      },
      return_value: { 
        type: DataTypes.INTEGER
      },
      paid_with_id: { 
        type: DataTypes.INTEGER,
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

  Receipt.getStandardInclude = ({ condition } = {}) => [
    {
      where: { deleted: false },
      required: true,
      association: _models.Receipt.Client
    },
    {
      where: { deleted: false },
      required: true,
      association: _models.Receipt.AccountOwners
    },
    {
      where: { deleted: false },
      required: true,
      association: _models.Receipt.AccountBalance
    },
    {
      where: { deleted: false },
      required: false,
      association: _models.ClientAccount.ClientProperty
    },
    {
      where: { deleted: false },
      required: false,
      association: _models.ClientAccount.ConnectedFinancialAccount,
      include: [..._models.ClientPlaidFinancialAccount.getMinimalInclude()]
    }
  ];

  Receipt.associate = function(models) {
    Receipt.ReceiptCategory = Receipt.belongsTo(models.ReceiptCategory, {
      as: 'receipt_category',
      targetKey: 'id',
      foreignKey: { name: 'category_id', allowNull: false }
    });

    Receipt.PaymentType = Receipt.belongsTo(models.PaymentType, {
      as: 'payment_type',
      targetKey: 'id',
      foreignKey: { name: 'paid_with_id', allowNull: false }
    });

    Receipt.ReceiptAmounts = Receipt.hasMany(models.ReceiptAmount, {
      sourceKey: 'id',
      as: 'receipt_amounts',
      foreignKey: 'receipt_id'
    });
  };
  return Receipt;
};