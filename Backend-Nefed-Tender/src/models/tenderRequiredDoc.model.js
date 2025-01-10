import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const TenderRequiredDoc = sequelize.define(
    "TenderRequiredDoc",
    {
      tender_doc_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tender_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      doc_key: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      doc_label: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      doc_ext: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      doc_size: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "tender_required_doc",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  TenderRequiredDoc.sync({ alter: false }).then().catch();
  return TenderRequiredDoc;
};
