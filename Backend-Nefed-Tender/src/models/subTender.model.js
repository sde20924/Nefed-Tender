import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const Subtender = sequelize.define(
    "Subtender",
    {
      subtender_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tender_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subtender_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "subtender",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  Subtender.sync({ alter: false }).then().catch();
  return Subtender;
};
