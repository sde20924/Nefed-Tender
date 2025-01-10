import { Sequelize, DataTypes } from "sequelize";

export default (sequelize) => {
  const ManageTender = sequelize.define(
    "ManageTender",
    {
      tender_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tender_slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tender_desc: {
        type: DataTypes.STRING(800),
        allowNull: false,
      },
      tender_cat: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tender_opt: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      start_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dest_port: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      bag_size: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      bag_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      app_start_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      app_end_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      auct_start_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      auct_end_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      time_frame_ext: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      extended_at: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null,
      },
      amt_of_ext: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      aut_auct_ext_bfr_end_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      min_decr_bid_val: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timer_ext_val: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      qty_split_criteria: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      counter_offr_accept_timer: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      img_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      auction_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tender_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      audi_key: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      attachments: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: null,
      },
      custom_form: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: null,
      },
      no_of_aut_auct_ext_happened: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      user_access: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "public",
      },
      access_position: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "yes",
      },
      save_as: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: "draft",
      },
      cal_formula: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      show_items: {
        type: DataTypes.ENUM("yes", "no"),
        allowNull: false,
        defaultValue: "yes",
      },
      category: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "manage_tender",
      timestamps: false, // Disable Sequelize's automatic timestamps
      // indexes: [
      //   {
      //     name: "tender_id", // Unique index
      //     unique: true,
      //     fields: ["tender_id"],
      //     using: "BTREE",
      //   },
      // ],
    }
  );
  ManageTender.sync({ alter: false }).then().catch();
  return ManageTender;
};
