export default (sequelize, DataTypes) => {
  const ManageTender = sequelize.define(
    "ManageTender",
    {
      tender_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      tender_slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      tender_desc: {
        type: DataTypes.STRING(800),
        allowNull: false,
        defaultValue: "",
        validate: {
          notEmpty: true,
        },
      },
      tender_cat: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      tender_opt: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      emd_amt: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      emt_lvl_amt: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      start_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      qty: {
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
      measurement_unit: {
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
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      custom_form: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      no_of_aut_auct_ext_happened: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "manage_tender",
      timestamps: false,
    }
  );

  // Define Associations
  // ManageTender.associate = (models) => {
  //   // Assuming there is a User model and a Bid model, you can define associations like this:
  //   ManageTender.hasMany(models.Bid, { foreignKey: 'tender_id' });
  //   ManageTender.belongsTo(models.User, { foreignKey: 'user_id' });
  // };

  return ManageTender;
};
