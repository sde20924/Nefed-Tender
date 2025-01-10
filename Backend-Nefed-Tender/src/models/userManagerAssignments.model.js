import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const UserManagerAssignments = sequelize.define(
    "UserManagerAssignments",
    {
      assignment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      assigned_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      manage_as: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "user_manager_assignments",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  UserManagerAssignments.sync({ alter: false }).then().catch();

  return UserManagerAssignments;
};
