const { Sequelize } = require("sequelize");
const config = require("../config/config.js");
const logger = require("../config/logger.js");
const Admin = require("./admin.model.js");
const Buyer = require("./buyer.model.js");
const BuyerHeaderRowData = require("./buyerHeaderRow.js");
const DemoTenderHeader = require("./demoTenderHeader.model.js");
const DemoTenderSheet = require("./demoTenderSheet.model.js");
const HomepageContent = require("./homePageContent.model.js");
const Manager = require("./manager.model.js");
const ManageTender = require("./manageTender.model.js");
const RequiredDocuments = require("./requiredDocuments.model.js");
const RequirementDocuments = require("./requirementDocument.model.js");
const Seller = require("./seller.model.js");
const SellerBuyer = require("./sellerBuyer.model.js");
const SellerHeaderRowData = require("./sellerHeaderRowData.model.js");
const Subtender = require("./subTender.model.js");
const Tags = require("./tags.model.js");
const TenderAccess = require("./tenderAccess.model.js");
const TenderApplication = require("./tenderApplication.model.js");
const TenderAuctItems = require("./tenderAuctionItem.model.js");
const TenderBidRoom = require("./tenderBidRoom.js");
const TenderHeader = require("./tenderHeader.model.js");
const TenderRequiredDoc = require("./tenderRequiredDoc.model.js");
const TenderUserDoc = require("./tenderUserDoc.js");
const UserDocuments = require("./userDocuments.js");
const UserManagerAssignments = require("./userManagerAssignments.model.js");

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
      idle: 1000, // corrected from "Idle" to "idle"
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

//= ==============================
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
