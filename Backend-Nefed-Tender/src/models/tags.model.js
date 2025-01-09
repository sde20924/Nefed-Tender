const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Tags = sequelize.define(
    "Tags",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      for_table: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: "tags",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  Tags.sync({ alter: false }).then().catch();

  return Tags;
};
