const httpStatus = require("http-status");
const db = require("../models/index");

const CreateTender = async (data) => {
  try {
    const tender = await db.Tender.create(data);
    return tender;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const ViewTender = async () => {
  try {
    const tender = await db.ManageTender.findAll();
    return tender;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  CreateTender,
  ViewTender,
};
