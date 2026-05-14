// middleware/upload.js
// TEMPLATE structure - change ALLOWED_TYPES and MAX_SIZE per project

const multer = require("multer");

// ─────────────────────────────────────────────────────
// Memory storage: file goes to req.file.buffer
// Use this when uploading to Cloudinary
// because Cloudinary needs the buffer, not a disk path
// ─────────────────────────────────────────────────────
const storage = multer.memoryStorage();

// ─────────────────────────────────────────────────────
// CHANGE THESE PER PROJECT
// ─────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB - change as needed

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
  // add or remove types per project
];

// ─────────────────────────────────────────────────────
// TEMPLATE: this function structure never changes
// ─────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}`),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

module.exports = upload;