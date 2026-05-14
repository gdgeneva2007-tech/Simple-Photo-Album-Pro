// Example Controller:
// controllers/fileController.js
// This is project-specific code you write fresh each time
// but it always follows this same pattern

const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUpload");
const db = require("../db/queries");

const uploadFile = async (req, res, next) => {
  try {
    // req.file is available because multer already ran in the route
    if (!req.file) {
      return res.render("upload", { error: "Please select a file." });
    }

    // TEMPLATE pattern - same every project:
    const result = await uploadToCloudinary(
      req.file.buffer,
      "your-project-name"  // ← only this changes
    );

    // PROJECT SPECIFIC - depends on your schema:
    await db.createFile({
      name: req.file.originalname,
      size: req.file.size,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      userId: req.user.id
    });

    res.redirect("/files");
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    // TEMPLATE pattern - same every project:
    const file = await db.getFileById(Number(req.params.id));
    if (!file) return res.status(404).render("error", { title: "Not Found", message: "File not found." });

    await deleteFromCloudinary(file.cloudinaryId);

    // PROJECT SPECIFIC:
    await db.deleteFile(file.id);

    res.redirect("/files");
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFile, deleteFile };


// Example Route:
// routes/files.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const handleUpload = require("../utils/multerErrorHandler");
const { ensureLoggedIn } = require("../middleware/auth");
const fileController = require("../controllers/fileController");

router.post(
  "/upload",
  ensureLoggedIn,
  // handleUpload wraps multer and catches its errors
  // args: multer middleware, view to render on error, data for that view
  handleUpload(upload.single("file"), "upload", { title: "Upload File" }),
  fileController.uploadFile
);

router.post("/:id/delete", ensureLoggedIn, fileController.deleteFile);

module.exports = router;