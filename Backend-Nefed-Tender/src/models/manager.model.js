const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Manager = sequelize.define(
    "Manager",
    {
      manager_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      registration_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      gst_number: {
        type: DataTypes.STRING(15),
        allowNull: true,
        defaultValue: null,
      },
      aadhaar_number: {
        type: DataTypes.STRING(12),
        allowNull: true,
        defaultValue: null,
      },
      pan_number: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      aadhaar_front_doc: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      aadhaar_back_doc: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      pan_doc: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      profile_pic_doc: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      gst_doc: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      is_blocked: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      tag_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "not_verified",
      },
    },
    {
      tableName: "manager",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  Manager.sync({ alter: false }).then().catch();
  return Manager;
};
