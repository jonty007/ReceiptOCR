'use strict';

const { database } = require('../../config');

module.exports = (sequelize, DataTypes) => {
  const EmailBaseTemplate = sequelize.define(
    'EmailBaseTemplate',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      name: {
        type: DataTypes.STRING
      },
      format: {
        type: DataTypes.STRING
      },
      content: {
        type: DataTypes.TEXT
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
  EmailBaseTemplate.associate = function(models) {
    // associations can be defined here
  };
  return EmailBaseTemplate;
};
