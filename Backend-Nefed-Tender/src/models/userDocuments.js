import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const UserDocuments = sequelize.define(
    "UserDocuments",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tag_id: {
        type: DataTypes.INTEGER,
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
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      req_doc_id_for_tag: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      operator_journey_doc_sequence: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "user_documents",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  UserDocuments.sync({ alter: false }).then().catch();
  return UserDocuments;
};
