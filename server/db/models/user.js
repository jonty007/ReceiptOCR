'use strict';

import { createJWT } from '../../common/auth.utils';

const { database } = require('../../config');
module.exports = (sequelize, DataTypes) => {
  const { models: _models } = sequelize,
    User = sequelize.define(
      'User',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        last_name: {
          type: DataTypes.STRING
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false
        },
        profile_picture_file_id: {
          type: DataTypes.INTEGER
        },
        user_type: {
          type: DataTypes.STRING,
          allowNull: false
        },
        org_id: {
          type: DataTypes.INTEGER
        },
        title: {
          type: DataTypes.STRING
        },
        phone: {
          type: DataTypes.STRING
        },
        last_login_date: {
          type: DataTypes.DATE
        },
        login_attempts: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        stripe_customer_id: {
          type: DataTypes.STRING
        },
        stripe_card_id: {
          type: DataTypes.STRING
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false
        },
        is_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
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

  //////////////////////////////////////////////
  //             INSTANCE METHODS             //
  //////////////////////////////////////////////

  /**
   * createTokenResponse
   *
   * Create a user token response
   * {
   *   "token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjp7ImlkIjoiOTUyZDI4NjctNGU0ZC00Yzg4LTg1OTUtZGQ1Y2UxZTkwM2MxIn0sImlhdCI6MTU0OTY3NTQyMDQ5MywiZXhwIjoxNTUwODg1MDIwNDkzfQ.cgpLuaWjzpsh1pq13mEAwWXu5yCtF9P2DYvl4UcZJdjTfqezahTmI1h2EFH1LgrzsInS-ttd8khM4D8G4ozcSg",
   *   "user" : {
   *     "id": 1,
   *     "actual_user_id": 1 // Always use this for metrics logging(created_by/modified_by)
   *   }
   */
  User.prototype.createTokenResponse = async function({ exp, actual_user_id } = {}) {
    const token_user = {
        id: this.id,
        actual_user_id,
        first_name: this.first_name,
        last_name: this.last_name,
        user_type: this.user_type,
        org_id: this.org_id
      },
      token = createJWT({ data: { user: token_user }, exp });

    return { token, user: { id: token_user.id } };
  };

  User.getStandardInclude = ({ condition } = {}) => [
    {
      where: { deleted: false },
      required: false,
      association: _models.User.Organization,
      attributes: [
        'id',
        'name',
        'org_type_id',
        'email',
        'org_code',
        'description',
        'phone',
        'street',
        'zip',
        'city',
        'country',
        'vat_number',
        'contact_person_name',
        'contact_person_phone'
      ],
      include: [..._models.Organization.getStandardInclude()]
    },
    {
      where: { deleted: false },
      required: false,
      association: _models.User.ProfilePicture
    }
  ];

  User.getMinimalInclude = ({ condition } = {}) => [
    {
      where: { deleted: false },
      required: false,
      association: _models.User.Organization,
      attributes: ['id', 'name', 'org_type_id', 'email', 'org_code']
    },
    {
      where: { deleted: false },
      required: false,
      association: _models.User.ProfilePicture
    }
  ];

  User.getPasswordInclude = ({ condition } = {}) => [
    {
      where: { deleted: false },
      required: false,
      association: _models.User.Password
    }
  ];

  //////////////////////////////////////////////
  //               ASSOCIATIONS               //
  //////////////////////////////////////////////

  User.associate = function(models) {
    User.Organization = User.belongsTo(models.Organization, {
      as: 'org',
      targetKey: 'id',
      foreignKey: { name: 'org_id', allowNull: true }
    });

    User.ProfilePicture = User.belongsTo(models.File, {
      as: 'profilePicture',
      targetKey: 'id',
      foreignKey: { name: 'profile_picture_file_id', allowNull: true }
    });

    User.Password = User.hasOne(models.UserPassword, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      as: 'password'
    });
  };
  return User;
};
