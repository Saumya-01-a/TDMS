const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const studyMaterialController = require('../controllers/studyMaterialController');

// Ensure destination upload directory exists
const uploadDir = path.join(__dirname, '../uploads/materials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  }
});

// File filter (PDF, images, and documents)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf|doc|docx|webp/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  }
  return cb(new Error('Invalid file type. Only PDF, Image (JPG/PNG/WEBP), and DOC files are permitted.'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Endpoints:
// POST /api/study-materials
router.post('/', upload.single('file'), studyMaterialController.uploadStudyMaterial);

// GET /api/study-materials?category={category}&search={query}
router.get('/', studyMaterialController.getStudyMaterials);

// DELETE /api/study-materials/:id
router.delete('/:id', studyMaterialController.deleteStudyMaterial);

module.exports = router;

