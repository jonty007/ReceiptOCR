'use strict';

const { database } = require('../../config');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert({
        // table name is pluralised name
        tableName: 'OrgTypes',
        schema: database.schema
      },
      [{
        name: 'Company',
        is_active: true,
        created_by: 0,
        modified_by: 0
      }], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete({
      // table name is pluralised name
      tableName: 'OrgTypes',
      schema: database.schema
    }, [{
      name: 'Company'
    }], {});
  }
};
