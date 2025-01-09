const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TenderApplication = sequelize.define(
    "TenderApplication",
    {
      tender_application_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tender_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
      },
      rejected_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "tender_application",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  TenderApplication.sync({ alter: false }).then().catch();

  return TenderApplication;
};
