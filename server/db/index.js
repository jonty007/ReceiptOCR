import Sequelize from 'sequelize';
import { readdirSync } from 'fs';
import { join } from 'path';
import pluralize from 'pluralize';
// import { database } from '../config';
// const { schema } = database,
const models_path = join(__dirname, '..', 'db', 'models'),
  db = {};

function setupModels(sequelize) {
  readdirSync(models_path)
    .filter(file => file.indexOf('.') !== 0 && file.slice(-3) === '.js')
    .forEach(file => {
      const model = require(join(models_path, file))(sequelize, Sequelize.DataTypes);
      // Define Capital case table name & schema
      model.tableName = pluralize(model.name);

      // Make sure model is using Capital case
      // const capName = model.name[0].toUpperCase() + model.name.substring(1);
      db[model.name] = model;
    });

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
}

db.init = ({
  username,
  password,
  // eslint-disable-next-line no-shadow
  name: database,
  host,
  port,
  dialect,
  connectionLimit,
  pool,
  logging,
  operatorsAliases,
  dialectOptions,
  define
} = {}) => {
  if (db.sequelize) {
    return db.sequelize;
  }

  const sequelize_config = {
      host,
      port,
      dialect,
      connectionLimit,
      pool,
      logging,
      operatorsAliases,
      dialectOptions,
      define
    },
    sequelize = new Sequelize(database, username, password, sequelize_config);

  setupModels(sequelize);

  db.sequelize = sequelize;

  return db.sequelize;
};

db.checkConnection = () => {
  if (!db.sequelize) {
    throw new Error('No database initialized');
  }

  return db.sequelize.authenticate();
};

db.Sequelize = Sequelize;
module.exports = db;
