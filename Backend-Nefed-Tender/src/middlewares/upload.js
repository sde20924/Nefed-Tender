const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadSingle = upload.single("file");
const uploadMulti = upload.array("files", 20);

module.exports = {
  uploadSingle,
  uploadMulti,
};
