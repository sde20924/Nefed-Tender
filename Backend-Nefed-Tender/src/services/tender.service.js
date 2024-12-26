import httpStatus from 'http-status';
import db from '../models/index.js';

export const CreateTender = async (data) => {
  try {
    const tender = await db.Tender.create(data);
    return tender;
  } catch (error) {
    return { success: false, message: error.message };
  }
  };

  export const ViewTender = async () => {
    try {
      const tender = await db.ManageTender.findAll();
      return tender;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };