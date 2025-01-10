import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const TenderAuctItems = sequelize.define(
    "TenderAuctItems",
    {
      tender_auct_item_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tender_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      auct_item: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      auct_qty: {
        type: DataTypes.DECIMAL(10, 0),
        allowNull: false,
      },
    },
    {
      tableName: "tender_auct_items",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  TenderAuctItems.sync({ alter: false }).then().catch();

  return TenderAuctItems;
};
