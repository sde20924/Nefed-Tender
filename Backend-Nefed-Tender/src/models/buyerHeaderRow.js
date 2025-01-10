import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const BuyerHeaderRowData = sequelize.define(
    "BuyerHeaderRowData",
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
      buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: "buyer_header_row_data",
      timestamps: false,
    }
  );
  BuyerHeaderRowData.sync({ alter: false }).then().catch();

  return BuyerHeaderRowData;
};
