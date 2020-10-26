'use strict';

const crypto = require('crypto'),
  { database } = require('../../config');

module.exports = (sequelize, DataTypes) => {
  const UserPassword = sequelize.define(
      'UserPassword',
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
        password: {
          type: DataTypes.TEXT,
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
    ),
    //////////////////////////////////////////////
    //                  HOOKS                   //
    //////////////////////////////////////////////

    /**
     * addPasswordHash
     *
     * Adds password hash if password exists
     * Empty passwords are allowed during invitation
     */
    calculatePasswordHash = async (userPassword /* options */) => {
      if (!userPassword.password) {
        return;
      }

      const hash = await crypto
        .createHash('RSA-SHA256')
        .update(userPassword.password)
        .digest('hex');

      userPassword.password = hash;
    };

  UserPassword.addHook('beforeCreate', 'addPasswordHash', calculatePasswordHash);
  UserPassword.addHook('beforeUpdate', 'addPasswordHash', calculatePasswordHash);

  //////////////////////////////////////////////
  //             INSTANCE METHODS             //
  //////////////////////////////////////////////

  /**
   * comparePassword
   *
   * Compares given password with password for the agent account
   */
  UserPassword.prototype.comparePassword = async function(password) {
    if (!this.password) {
      return false;
    }

    const hash = await crypto
      .createHash('RSA-SHA256')
      .update(password)
      .digest('hex');

    const isMatch = hash === this.password;
    return isMatch;
  };

  UserPassword.associate = function(models) {
    UserPassword.User = UserPassword.belongsTo(models.User, {
      as: 'user',
      targetKey: 'id',
      foreignKey: { name: 'user_id', allowNull: false }
    });
  };
  return UserPassword;
};
