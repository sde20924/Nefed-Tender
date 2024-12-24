const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cloudinary = require('../config/cloudinaryConfig');
const db = require('../config/config');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

// Multer setup for file storage in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const validateAndUploadMiddleware = asyncErrorHandler(async (req, res, next) => {
  const { user_id, login_as } = req.user;
  
  // Fetch the required documents for the user's tag
  const tagQuery = `
    SELECT d.name, d.doc_ext, d.max_size
    FROM tags t
    JOIN required_documents d ON t.id = d.tag_id
    WHERE t.id = (
      SELECT tag_id FROM ${login_as} WHERE user_id = $1
    )
  `;
  const { rows: requiredDocuments } = await db.query(tagQuery, [user_id]);

  if (requiredDocuments.length === 0) {
    return res.status(400).json({ msg: 'No required documents found for this user', success: false });
  }

  const requiredDocs = requiredDocuments.map(doc => doc.name);
  const uploadFields = requiredDocs.map(doc => ({ name: doc, maxCount: 1 }));

  console.log("Required documents for upload:", requiredDocs);

  // Dynamically create the multer upload based on the required documents
  const uploadDocs = upload.fields(uploadFields);

  uploadDocs(req, res, async (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(400).json({ msg: 'Error uploading files.', success: false });
    }

    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ msg: 'No files uploaded.', success: false });
    }

    const errors = [];

    for (const doc of requiredDocuments) {
      const fileArray = files[doc.name];

      if (!fileArray || fileArray.length === 0) {
        errors.push(`Missing required document: ${doc.name}`);
        continue;
      }

      const file = fileArray[0];
      const fileExtension = file.mimetype.split('/')[1];

      // Check if the document type is 'image'
      if (doc.doc_ext === 'image') {
        // Allow only jpeg, jpg, png
        const allowedImageExtensions = ['jpeg', 'jpg', 'png'];
        if (!allowedImageExtensions.includes(fileExtension)) {
          errors.push(`Invalid file type for ${doc.name}. Only jpeg, jpg, png are allowed.`);
          continue;
        }
      } else {
        // For other document types, use the existing validation
        if (!doc.doc_ext.includes(fileExtension)) {
          errors.push(`Invalid file type for ${doc.name}`);
          continue;
        }
      }

      if (file.size > doc.max_size * 1024 * 1024) {
        errors.push(`${doc.name} exceeds maximum size of ${doc.max_size}MB`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ msg: 'Document validation failed', errors, success: false });
    }

    try {
      console.log(`Starting upload of files: ${Object.keys(files).join(', ')}.`);

      const uploadResults = {};

      for (const [key, fileArray] of Object.entries(files)) {
        const file = fileArray[0]; // Only one file per key as per maxCount: 1

        const uniqueFilename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        console.log(`Uploading file: ${uniqueFilename}`);

        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'user_docs',
              public_id: uniqueFilename,
              resource_type: 'auto'
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                uploadResults[key] = result.secure_url;
                console.log(`File ${key} uploaded successfully: ${result.secure_url}`);
                resolve(result.secure_url);
              }
            }
          );

          uploadStream.end(file.buffer);
        });

        await uploadPromise;
      }

      req.uploadedFiles = uploadResults;
      console.log('All files uploaded successfully.');
      next();
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ msg: 'Upload error', error: error.message, success: false });
    }
  });
});

module.exports = validateAndUploadMiddleware;
