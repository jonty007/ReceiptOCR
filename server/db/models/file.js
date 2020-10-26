'use strict';

const { database } = require('../../config');

module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define(
    'File',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      extension: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      image_sizes: {
        type: DataTypes.TEXT
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      metadata: {
        type: DataTypes.TEXT
      },
      mime_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      location: {
        type: DataTypes.TEXT
      },
      storage_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.BLOB('long')
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
  File.associate = function(models) {
    // associations can be defined here
  };
  return File;
};
