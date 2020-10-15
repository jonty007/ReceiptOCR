'use strict';

const { database } = require('../../config');

module.exports = (sequelize, DataTypes) => {
  const { models: _models } = sequelize,
    Organization = sequelize.define(
      'Organization',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        org_code: {
          type: DataTypes.STRING,
          unique: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT
        },
        org_type_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        company_logo_file_id: {
          type: DataTypes.INTEGER
        },
        email: {
          type: DataTypes.STRING
        },
        phone: {
          type: DataTypes.STRING
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        is_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        payment_id: {
          type: DataTypes.INTEGER
        },
        subscription_id: {
          type: DataTypes.TEXT
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        created_at: {
          type: DataTypes.DATE(6),
          defaultValue: DataTypes.NOW,
          allowNull: false
        },
        modified_by: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        modified_at: {
          type: DataTypes.DATE(6),
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
          type: DataTypes.DATE(6),
          allowNull: true
        }
      },
      {
        underscored: true,
        schema: database.schema
      }
    );

  Organization.getStandardInclude = ({ condition } = {}) => [
    {
      where: { deleted: false },
      required: true,
      association: _models.Organization.OrgType,
      attributes: ['name', 'is_active']
    },
    {
      where: { deleted: false },
      required: false,
      association: _models.Organization.CompanyLogo
    },
    {
      where: { deleted: false },
      required: false,
      association: _models.Organization.Payment
    }
  ];

  Organization.getUsersListInclude = ({ condition } = {}) => [
    {
      where: { deleted: false },
      required: true,
      association: _models.Organization.Users
    }
  ];

  Organization.getMinimalInclude = ({ condition } = {}) => [
    {
      where: { deleted: false },
      required: true,
      association: _models.Organization.OrgType,
      attributes: ['name', 'is_active']
    }
  ];

  Organization.associate = function(models) {
    Organization.OrgType = Organization.belongsTo(models.OrgType, {
      as: 'orgType',
      targetKey: 'id',
      foreignKey: { name: 'org_type_id', allowNull: false }
    });

    Organization.CompanyLogo = Organization.belongsTo(models.File, {
      as: 'companyLogo',
      targetKey: 'id',
      foreignKey: { name: 'company_logo_file_id', allowNull: true }
    });

    Organization.Payment = Organization.belongsTo(models.Payment, {
      as: 'payment',
      targetKey: 'id',
      foreignKey: { name: 'payment_id', allowNull: true }
    });

    Organization.Users = Organization.hasMany(models.User, {
      foreignKey: 'org_id',
      sourceKey: 'id',
      as: 'users'
    });
  };
  return Organization;
};
