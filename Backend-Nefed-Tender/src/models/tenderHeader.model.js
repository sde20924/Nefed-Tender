const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TenderHeader = sequelize.define(
    "TenderHeader",
    {
      header_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tender_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      table_head: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "view",
        validate: {
          isIn: [["view", "edit"]], // Enforces the CHECK constraint in Sequelize
        },
      },
      cal_col: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "tender_header",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  TenderHeader.sync({ alter: false }).then().catch();

  return TenderHeader;
};
