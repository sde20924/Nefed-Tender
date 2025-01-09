const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DemoTenderHeader = sequelize.define(
    "DemoTenderHeader",
    {
      demo_tender_header_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      demo_tender_sheet_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      header_display_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "view",
        validate: {
          isIn: [["view", "edit"]], // Constraint to match the check constraint in the database
        },
      },
    },
    {
      tableName: "demo_tender_header",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  DemoTenderHeader.sync({ alter: false }).then().catch();

  return DemoTenderHeader;
};
