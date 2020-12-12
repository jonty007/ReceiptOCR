'use strict';

const { database } = require('../../config');
module.exports = (sequelize, DataTypes) => {
  const { models: _models } = sequelize,
    Receipt = sequelize.define(
      'Receipt',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        user_id: {
          type: DataTypes.INTEGER
        },
        org_id: {
          type: DataTypes.INTEGER
        },
        company_name: {
          type: DataTypes.STRING
        },
        receipt_file_id: {
          type: DataTypes.INTEGER
        },
        invoice_date: {
          type: DataTypes.DATE
        },
        receipt_number: {
          type: DataTypes.STRING
        },
        company_payment: {
          type: DataTypes.BOOLEAN
        },
        note: {
          type: DataTypes.TEXT
        },
        category: {
          type: DataTypes.STRING,
          allowNull: false
        },
        lifelong_warranty: {
          type: DataTypes.BOOLEAN
        },
        warranty_unit: {
          type: DataTypes.STRING
        },
        warranty_value: {
          type: DataTypes.INTEGER
        },
        unlimited_return: {
          type: DataTypes.BOOLEAN
        },
        return_unit: {
          type: DataTypes.STRING
        },
        return_value: {
          type: DataTypes.INTEGER
        },
        paid_with: {
          type: DataTypes.STRING
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
      required: false,
      association: _models.Receipt.ReceiptCategory
    },
    {
      required: false,
      association: _models.Receipt.PaymentType
    },
    {
      required: false,
      association: _models.Receipt.Warranty
    },
    {
      required: false,
      association: _models.Receipt.Return
    },
    {
      where: { deleted: false },
      required: false,
      association: _models.Receipt.ReceiptAmounts
    },
    {
      where: { deleted: false },
      required: false,
      association: _models.Receipt.ReceiptFile
    }
  ];

  Receipt.associate = function(models) {
    Receipt.ReceiptCategory = Receipt.belongsTo(models.ReceiptCategory, {
      as: 'receipt_category',
      targetKey: 'value',
      foreignKey: { name: 'category', allowNull: false }
    });

    Receipt.PaymentType = Receipt.belongsTo(models.PaymentType, {
      as: 'payment_type',
      targetKey: 'value',
      foreignKey: { name: 'paid_with', allowNull: false }
    });

    Receipt.Warranty = Receipt.belongsTo(models.DurationUnit, {
      as: 'warranty',
      targetKey: 'value',
      foreignKey: { name: 'warranty_unit', allowNull: false }
    });

    Receipt.Return = Receipt.belongsTo(models.DurationUnit, {
      as: 'return',
      targetKey: 'value',
      foreignKey: { name: 'return_unit', allowNull: false }
    });

    Receipt.ReceiptFile = Receipt.belongsTo(models.File, {
      as: 'receipt_file',
      targetKey: 'id',
      foreignKey: { name: 'receipt_file_id', allowNull: true }
    });

    Receipt.ReceiptAmounts = Receipt.hasMany(models.ReceiptAmount, {
      sourceKey: 'id',
      as: 'receipt_amounts',
      foreignKey: 'receipt_id'
    });
  };
  return Receipt;
};
