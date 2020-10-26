const { database } = require('../../config');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'Organizations',
          schema: database.schema
        },
        ['org_type_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'OrgTypes',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_OrgTypes_Organizations', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'Organizations',
          schema: database.schema
        },
        ['company_logo_file_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'Files',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_Files_Organizations', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'Organizations',
          schema: database.schema
        },
        ['payment_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'Payments',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_Payments_Organizations', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'Users',
          schema: database.schema
        },
        ['org_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'Organizations',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_Organizations_Users', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'Users',
          schema: database.schema
        },
        ['profile_picture_file_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'Files',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_Files_Users', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'UserPasswords',
          schema: database.schema
        },
        ['user_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'Users',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_Users_UserPasswords', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'Payments',
          schema: database.schema
        },
        ['user_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'Users',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_Users_Payments', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'Payments',
          schema: database.schema
        },
        ['org_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'Organizations',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_Organizations_Payments', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'Payments',
          schema: database.schema
        },
        ['subscription_plan_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'SubscriptionPlans',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_SubscriptionPlans_Payments', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await queryInterface.addConstraint({
          // table name is pluralised name
          tableName: 'NotificationDevices',
          schema: database.schema
        },
        ['user_id'], {
          type: 'FOREIGN KEY',
          references: {
            table: {
              // table name is pluralised name
              tableName: 'Users',
              schema: database.schema
            },
            field: 'id'
          },
          // fk name convention: FK_<ParentTable>_<CurrentTable>
          name: 'FK_Users_NotificationDevices', // useful if using queryInterface.removeConstraint
          onDelete: 'no action',
          onUpdate: 'no action'
        }, { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint({
          tableName: 'Organizations',
          schema: database.schema
        },
        'FK_OrgTypes_Organizations', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'Organizations',
          schema: database.schema
        },
        'FK_Files_Organizations', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'Organizations',
          schema: database.schema
        },
        'FK_Payments_Organizations', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'Users',
          schema: database.schema
        },
        'FK_Organizations_Users', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'Users',
          schema: database.schema
        },
        'FK_Files_Users', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'UserPasswords',
          schema: database.schema
        },
        'FK_Users_UserPasswords', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'Payments',
          schema: database.schema
        },
        'FK_Users_Payments', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'Payments',
          schema: database.schema
        },
        'FK_Organizations_Payments', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'Payments',
          schema: database.schema
        },
        'FK_SubscriptionPlans_Payments', { transaction }
      );

      await queryInterface.removeConstraint({
          tableName: 'NotificationDevices',
          schema: database.schema
        },
        'FK_Users_NotificationDevices', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
