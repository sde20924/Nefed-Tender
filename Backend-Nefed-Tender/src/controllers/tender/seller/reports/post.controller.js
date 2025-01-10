import { v4 as uuidv4 } from "uuid";
import db from "../../../../models/index.js";
import asyncErrorHandler from "../../../../utils/asyncErrorHandler.js";

const generateTenderId = () => uuidv4();

export const cloneTenderController = asyncErrorHandler(async (req, res) => {
  const { id } = req.params; // Tender ID to be cloned
  const sellerId = req.user.user_id; // User ID from authenticated middleware

  // Query to find the tender to be cloned
  const tenderQuery = `
    SELECT * 
    FROM manage_tender 
    WHERE tender_id = :tenderId 
      AND user_id = :sellerId
  `;
  const [tenderToClone] = await db.sequelize.query(tenderQuery, {
    replacements: { tenderId: id, sellerId },
  });

  if (tenderToClone.length === 0) {
    return res
      .status(404)
      .json({ success: false, msg: "Tender not found or not authorized" });
  }

  const tender = tenderToClone[0];
  console.log(tender);
  const newTenderId = generateTenderId(); // Generate a new tender ID
  const newTitle = `${tender.tender_title.trim()} - Clone`;

  // Clone the tender and insert it into the manage_tender table
  const cloneQuery = `
    INSERT INTO manage_tender (
      tender_id, user_id, tender_title, tender_slug, tender_desc, tender_cat, tender_opt, emd_amt, emt_lvl_amt,
      currency, start_price, qty, dest_port, bag_size, bag_type, measurement_unit, app_start_time, app_end_time,
      auct_start_time, auct_end_time, time_frame_ext, extended_at, amt_of_ext, aut_auct_ext_bfr_end_time, 
      min_decr_bid_val, timer_ext_val, qty_split_criteria, counter_offr_accept_timer, img_url, auction_type, audi_key
    ) VALUES (
      :newTenderId, :sellerId, :newTitle, :tenderSlug, :tenderDesc, :tenderCat, :tenderOpt, :emdAmt, :emtLvlAmt,
      :currency, :startPrice, :qty, :destPort, :bagSize, :bagType, :measurementUnit, :appStartTime, :appEndTime,
      :auctStartTime, :auctEndTime, :timeFrameExt, :extendedAt, :amtOfExt, :autAuctExtBfrEndTime, 
      :minDecrBidVal, :timerExtVal, :qtySplitCriteria, :counterOffrAcceptTimer, :imgUrl, :auctionType, :audiKey
    )
  `;

  // Set values for the new tender
  const replacements = {
    newTenderId,
    sellerId,
    newTitle,
    tenderSlug: tender.tender_slug,
    tenderDesc: tender.tender_desc,
    tenderCat: tender.tender_cat,
    tenderOpt: tender.tender_opt,
    emdAmt: tender.emd_amt,
    emtLvlAmt: tender.emt_lvl_amt,
    currency: tender.currency,
    startPrice: tender.start_price,
    qty: tender.qty,
    destPort: tender.dest_port,
    bagSize: tender.bag_size,
    bagType: tender.bag_type,
    measurementUnit: tender.measurement_unit,
    appStartTime: tender.app_start_time,
    appEndTime: tender.app_end_time,
    auctStartTime: tender.auct_start_time,
    auctEndTime: tender.auct_end_time,
    timeFrameExt: tender.time_frame_ext,
    extendedAt: tender.extended_at,
    amtOfExt: tender.amt_of_ext,
    autAuctExtBfrEndTime: tender.aut_auct_ext_bfr_end_time,
    minDecrBidVal: tender.min_decr_bid_val,
    timerExtVal: tender.timer_ext_val,
    qtySplitCriteria: tender.qty_split_criteria,
    counterOffrAcceptTimer: tender.counter_offr_accept_timer,
    imgUrl: tender.img_url,
    auctionType: tender.auction_type,
    audiKey: tender.audi_key,
  };

  // Execute the insert query
  const [result] = await db.sequelize.query(cloneQuery, { replacements });

  if (result.affectedRows === 0) {
    throw new Error("Failed to clone tender");
  }

  // Return success response with the new tender ID
  return res.status(201).json({
    success: true,
    msg: "Tender cloned successfully",
    clonedId: newTenderId,
  });
});
