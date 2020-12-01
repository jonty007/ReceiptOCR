'use strict';

const { database } = require('../../config');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Receipts',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        company_name: {
          type: Sequelize.STRING
        },
        receipt_file_id: {
          type: Sequelize.INTEGER
        },
        invoice_date: {
          type: Sequelize.DATE
        },
        receipt_number: {
          type: Sequelize.STRING
        },
        company_payment: {
          type: Sequelize.BOOLEAN
        },
        note: {
          type: Sequelize.TEXT
        },
        category_id: {
          type: Sequelize.INTEGER
        },
        lifelong_warranty: {
          type: Sequelize.BOOLEAN
        },
        warranty_unit_id: {
          type: Sequelize.INTEGER
        },
        warranty_value: {
          type: Sequelize.INTEGER
        },
        unlimited_return: {
          type: Sequelize.BOOLEAN
        },
        return_unit_id: {
          type: Sequelize.INTEGER
        },
        return_value: {
          type: Sequelize.INTEGER
        },
        paid_with_id: {
          type: Sequelize.INTEGER
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        },
        modified_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        modified_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        },
        deleted: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      },
      {
        schema: database.schema
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Receipts');
  }
};




'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Receipts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_name: {
        type: Sequelize.STRING
      },
      receipt_file_id: {
        type: Sequelize.INTEGER
      },
      invoice_date: {
        type: Sequelize.DATE
      },
      receipt_number: {
        type: Sequelize.STRING
      },
      company_payment: {
        type: Sequelize.BOOLEAN
      },
      note: {
        type: Sequelize.TEXT
      },
      category_id: {
        type: Sequelize.INTEGER
      },
      lifelong_warranty: {
        type: Sequelize.BOOLEAN
      },
      warranty_unit_id: {
        type: Sequelize.INTEGER
      },
      warranty_value: {
        type: Sequelize.INTEGER
      },
      unlimited_return: {
        type: Sequelize.BOOLEAN
      },
      return_unit_id: {
        type: Sequelize.INTEGER
      },
      return_value: {
        type: Sequelize.INTEGER
      },
      paid_with_id: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Receipts');
  }
};