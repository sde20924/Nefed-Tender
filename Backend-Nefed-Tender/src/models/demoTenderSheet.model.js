const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DemoTenderSheet = sequelize.define(
    "DemoTenderSheet",
    {
      demo_tender_sheet_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tender_table_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "demo_tender_sheet",
      timestamps: false, // No createdAt or updatedAt fields
    }
  );
  DemoTenderSheet.sync({ alter: false }).then().catch();
  return DemoTenderSheet;
};
