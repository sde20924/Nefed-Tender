import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const RequirementDocuments = sequelize.define(
    "RequirementDocuments",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      requirement_id: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      doc_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      doc_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: Sequelize.literal("UNIX_TIMESTAMP()"),
      },
      updated_at: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: Sequelize.literal("UNIX_TIMESTAMP()"),
      },
    },
    {
      tableName: "requirement_documents",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  RequirementDocuments.sync({ alter: false }).then().catch();
  return RequirementDocuments;
};
