// src/services/tenderService.js

import httpStatus from "http-status";
import db from "../models/index.js";

/**
 * Creates a new Tender entry in the database.
 *
 * @param {Object} data - The tender data to be created.
 * @returns {Promise<Object>} - Returns the created tender or an error object.
 */
export const CreateTender = async (data) => {
  try {
    const tender = await db.Tender.create(data);
    return tender;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Retrieves all ManageTender entries from the database.
 *
 * @returns {Promise<Array|Object>} - Returns an array of tenders or an error object.
 */
export const ViewTender = async () => {
  try {
    const tenders = await db.ManageTender.findAll();
    return tenders;
  } catch (error) {
    return { success: false, message: error.message };
  }
};
