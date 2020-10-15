const { database } = require('../../config');
module.exports = (sequelize, DataTypes) => {
  const EmailLog = sequelize.define(
    'EmailLog',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      created_at: {
        type: DataTypes.DATE(6),
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      modified_at: {
        type: DataTypes.DATE(6),
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email_to: {
        type: DataTypes.STRING,
        allowNull: false
      },
      params: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      errors: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      underscored: true,
      schema: database.schema
    }
  );
  EmailLog.associate = function(models) {
    // associations can be defined here
  };
  return EmailLog;
};
