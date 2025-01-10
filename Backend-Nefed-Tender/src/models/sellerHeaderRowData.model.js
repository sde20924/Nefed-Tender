import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const SellerHeaderRowData = sequelize.define(
    "SellerHeaderRowData",
    {
      row_data_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      header_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      row_data: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subtender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("view", "edit"),
        allowNull: false,
        defaultValue: "view",
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      row_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "seller_header_row_data",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  SellerHeaderRowData.sync({ alter: false }).then().catch();
  return SellerHeaderRowData;
};
