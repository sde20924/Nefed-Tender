import { Sequelize } from 'sequelize';
import config from '../config/config.js';  // Ensure the path is correct
import logger from '../config/logger.js';
import ManageTender from './manage_tender.model.js';



// Extract the correct configuration for the current environment (e.g., development)
const sequelizeConfig = config.sequelize.development;

// Initialize Sequelize using the extracted config
const sequelizeInstance = new Sequelize(
  sequelizeConfig.database,
  sequelizeConfig.username,
  sequelizeConfig.password,
  {
    host: sequelizeConfig.host,
    dialect: sequelizeConfig.dialect,
    dialectOptions: sequelizeConfig.dialectOptions,
    pool: {
      min: 0,
      max: 100,
      acquire: 5000,
      idle: 1000,  // corrected from "Idle" to "idle"
    },
  }
);

const db = {};

// Authenticate the database connection
sequelizeInstance
  .authenticate()
  .then(() => logger.info('DB connected'))
  .catch((err) => {
    logger.error('Unable to connect to the database:', err);
  });

// Initialize models
db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize;

//db.ManageTender = ManageTender(sequelizeInstance, Sequelize);

//= ==============================
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});


export default db;