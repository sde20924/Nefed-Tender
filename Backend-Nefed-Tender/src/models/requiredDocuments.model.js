const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RequiredDocuments = sequelize.define(
    "RequiredDocuments",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      doc_ext: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      max_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      optional: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      for_prev_journey: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "required_documents",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  RequiredDocuments.sync({ alter: false }).then().catch();
  return RequiredDocuments;
};
