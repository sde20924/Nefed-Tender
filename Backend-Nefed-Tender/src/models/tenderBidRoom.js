import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const TenderBidRoom = sequelize.define(
    "TenderBidRoom",
    {
      bid_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      bid_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "active",
      },
    },
    {
      tableName: "tender_bid_room",
      timestamps: false, // Disable Sequelize's automatic timestamps
    }
  );
  TenderBidRoom.sync({ alter: false }).then().catch();
  return TenderBidRoom;
};
