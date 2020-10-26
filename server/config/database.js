const {
  database: { username, password, name: database, host, port, dialect, migrationStorage, seederStorage, schema, migrationStorageTableSchema, dialectOptions }
} = require("./index");

const databaseConfig = {
  username,
  password,
  database,
  host,
  port,
  dialect,
  migrationStorage,
  seederStorage,
  schema,
  migrationStorageTableSchema,
  dialectOptions
};

/**
 * CHANGING THE PATH FROM server/config/database.js will an update in .sequelizerc
 * NOTE: This file will be used by defaul`t by sequelize to connect to db for migrations
 *
 * Always return databaseConfig regardless of the environment.
 * `config.production` and `config.development` will return the same result.
 * The actual configuration is handled from the required `index.js`.
 */
const config = new Proxy({}, { get: _ => databaseConfig });

module.exports = config;
