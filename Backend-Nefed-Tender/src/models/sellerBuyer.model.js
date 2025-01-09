const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SellerBuyer = sequelize.define(
    "SellerBuyer",
    {
      seller_buyer_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      demo_tender_sheet_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "seller_buyer",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );
  SellerBuyer.sync({ alter: false }).then().catch();
  return SellerBuyer;
};
