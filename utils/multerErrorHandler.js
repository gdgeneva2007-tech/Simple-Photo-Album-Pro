// utils/multerErrorHandler.js
// TEMPLATE: handles multer errors in routes
// Copy as-is, change the render target per project

const multer = require("multer");

// ─────────────────────────────────────────────────────
// Use this in any route that handles file uploads
//
// Usage in routes:
//   const handleUpload = require("../utils/multerErrorHandler");
//   const upload = require("../middleware/upload");
//
//   router.post("/upload",
//     ensureLoggedIn,
//     handleUpload(upload.single("file"), "viewName", { title: "..." }),
//     yourController
//   );
// ─────────────────────────────────────────────────────
const handleUpload = (uploadMiddleware, errorView, viewData = {}) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer built-in errors (file too large etc.)
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.render(errorView, {
            ...viewData,
            error: "File is too large."
          });
        }
        return res.render(errorView, {
          ...viewData,
          error: err.message
        });
      } else if (err) {
        // Our custom fileFilter error
        return res.render(errorView, {
          ...viewData,
          error: err.message
        });
      }
      // No error - move to controller
      next();
    });
  };
};

module.exports = handleUpload;