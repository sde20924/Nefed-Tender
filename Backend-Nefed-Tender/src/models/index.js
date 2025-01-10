import { Sequelize } from "sequelize";
import config from "../config/config.js";
import logger from "../config/logger.js";
import Admin from "./admin.model.js";
import Buyer from "./buyer.model.js";
import BuyerHeaderRowData from "./buyerHeaderRow.js";
import DemoTenderHeader from "./demoTenderHeader.model.js";
import DemoTenderSheet from "./demoTenderSheet.model.js";
import HomepageContent from "./homePageContent.model.js";
import Manager from "./manager.model.js";
import ManageTender from "./manageTender.model.js";
import RequiredDocuments from "./requiredDocuments.model.js";
import RequirementDocuments from "./requirementDocument.model.js";
import Seller from "./seller.model.js";
import SellerBuyer from "./sellerBuyer.model.js";
import SellerHeaderRowData from "./sellerHeaderRowData.model.js";
import Subtender from "./subTender.model.js";
import Tags from "./tags.model.js";
import TenderAccess from "./tenderAccess.model.js";
import TenderApplication from "./tenderApplication.model.js";
import TenderAuctItems from "./tenderAuctionItem.model.js";
import TenderBidRoom from "./tenderBidRoom.js";
import TenderHeader from "./tenderHeader.model.js";
import TenderRequiredDoc from "./tenderRequiredDoc.model.js";
import TenderUserDoc from "./tenderUserDoc.js";
import UserDocuments from "./userDocuments.js";
import UserManagerAssignments from "./userManagerAssignments.model.js";

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
      idle: 1000, // Corrected from "Idle" to "idle"
    },
  }
);

const db = {};

// Authenticate the database connection
sequelizeInstance
  .authenticate()
  .then(() => logger.info("DB connected"))
  .catch((err) => {
    logger.error("Unable to connect to the database:", err);
  });

// Initialize models
db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize;

db.Admin = Admin(sequelizeInstance, Sequelize);
db.Buyer = Buyer(sequelizeInstance, Sequelize);
db.BuyerHeaderRowData = BuyerHeaderRowData(sequelizeInstance, Sequelize);
db.DemoTenderHeader = DemoTenderHeader(sequelizeInstance, Sequelize);
db.DemoTenderSheet = DemoTenderSheet(sequelizeInstance, Sequelize);
db.HomepageContent = HomepageContent(sequelizeInstance, Sequelize);
db.Manager = Manager(sequelizeInstance, Sequelize);
db.ManageTender = ManageTender(sequelizeInstance, Sequelize);
db.RequiredDocuments = RequiredDocuments(sequelizeInstance, Sequelize);
db.RequirementDocuments = RequirementDocuments(sequelizeInstance, Sequelize);
db.Seller = Seller(sequelizeInstance, Sequelize);
db.SellerBuyer = SellerBuyer(sequelizeInstance, Sequelize);
db.SellerHeaderRowData = SellerHeaderRowData(sequelizeInstance, Sequelize);
db.Subtender = Subtender(sequelizeInstance, Sequelize);
db.Tags = Tags(sequelizeInstance, Sequelize);
db.TenderAccess = TenderAccess(sequelizeInstance, Sequelize);
db.TenderApplication = TenderApplication(sequelizeInstance, Sequelize);
db.TenderAuctItems = TenderAuctItems(sequelizeInstance, Sequelize);
db.TenderBidRoom = TenderBidRoom(sequelizeInstance, Sequelize);
db.TenderHeader = TenderHeader(sequelizeInstance, Sequelize);
db.TenderRequiredDoc = TenderRequiredDoc(sequelizeInstance, Sequelize);
db.TenderUserDoc = TenderUserDoc(sequelizeInstance, Sequelize);
db.UserDocuments = UserDocuments(sequelizeInstance, Sequelize);
db.UserManagerAssignments = UserManagerAssignments(
  sequelizeInstance,
  Sequelize
);

// Associate models if the associate method exists
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
