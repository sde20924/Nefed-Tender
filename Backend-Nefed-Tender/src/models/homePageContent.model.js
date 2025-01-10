import { Sequelize, DataTypes } from "sequelize";
export default (sequelize) => {
  const HomepageContent = sequelize.define(
    "HomepageContent",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subheading: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
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
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "homepage_content",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  HomepageContent.sync({ alter: false }).then().catch();
  return HomepageContent;
};
