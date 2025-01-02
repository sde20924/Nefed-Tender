import db from '../../config/config2.js'; // Adjusted path to database configuration
import asyncErrorHandler from '../../utils/asyncErrorHandler.js'; // Adjusted path to async error handler middleware
import { v4 as uuidv4 } from 'uuid'; // UUID for generating a unique tender ID

/**
 * Generates a unique Tender ID.
 * @returns {string} A universally unique identifier (UUID).
 */
const generateTenderId = () => uuidv4();

/**
 * Controller to clone a tender for the specific seller.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const cloneTenderController = asyncErrorHandler(async (req, res) => {
  const { id } = req.params; // Tender ID to be cloned
  const sellerId = req.user.user_id; // User ID from authenticated middleware

  // Query to find the tender to be cloned
  const tenderQuery = `SELECT * FROM manage_tender WHERE tender_id = ? AND user_id = ?`;
  const [tenderToClone] = await db.query(tenderQuery, [id, sellerId]);

  if (tenderToClone.length === 0) {
    return res.status(404).json({ success: false, msg: "Tender not found or not authorized" });
  }

  const tender = tenderToClone[0];
  const newTenderId = generateTenderId(); // Generate a new tender ID
  const newTitle = `${tender.tender_title.trim()} - Clone`;

  // Clone the tender and insert it into the manage_tender table
  const cloneQuery = `
    INSERT INTO manage_tender (
      tender_id, user_id, tender_title, tender_slug, tender_desc, tender_cat, tender_opt, emd_amt, emt_lvl_amt,
      currency, start_price, qty, dest_port, bag_size, bag_type, measurement_unit, app_start_time, app_end_time,
      auct_start_time, auct_end_time, time_frame_ext, extended_at, amt_of_ext, aut_auct_ext_bfr_end_time, 
      min_decr_bid_val, timer_ext_val, qty_split_criteria, counter_offr_accept_timer, img_url, auction_type, audi_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Set values for the new tender, maintaining data integrity
  const values = [
    newTenderId, sellerId, newTitle, tender.tender_slug, tender.tender_desc, tender.tender_cat, tender.tender_opt,
    tender.emd_amt, tender.emt_lvl_amt, tender.currency, tender.start_price, tender.qty, tender.dest_port, tender.bag_size,
    tender.bag_type, tender.measurement_unit, tender.app_start_time, tender.app_end_time, tender.auct_start_time,
    tender.auct_end_time, tender.time_frame_ext, tender.extended_at, tender.amt_of_ext, tender.aut_auct_ext_bfr_end_time,
    tender.min_decr_bid_val, tender.timer_ext_val, tender.qty_split_criteria, tender.counter_offr_accept_timer,
    tender.img_url, tender.auction_type, tender.audi_key
  ];

  // Execute the insert query
  const [result] = await db.query(cloneQuery, values);

  if (result.affectedRows === 0) {
    throw new Error('Failed to clone tender');
  }

  // Return success response with the new tender ID
  return res.status(201).json({ success: true, msg: 'Tender cloned successfully', clonedId: newTenderId });
});
