const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TenderAccess = sequelize.define(
    "TenderAccess",
    {
      access_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tender_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "tender_access",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  TenderAccess.sync({ alter: false }).then().catch();
  return TenderAccess;
};
