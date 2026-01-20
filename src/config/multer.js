const multer = require("multer")

const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    // Accept any field name for file uploads
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
