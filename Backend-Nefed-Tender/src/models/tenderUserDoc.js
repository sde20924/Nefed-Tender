import { Sequelize, DataTypes } from "sequelize";
export default (sequelize) => {
  const TenderUserDoc = sequelize.define(
    "TenderUserDoc",
    {
      tender_user_doc_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tender_application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tender_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tender_doc_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      doc_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "tender_user_doc",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  TenderUserDoc.sync({ alter: false }).then().catch();

  return TenderUserDoc;
};
