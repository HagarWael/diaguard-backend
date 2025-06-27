const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for PDF files
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'diaguard-pdfs',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
    transformation: [{ quality: 'auto' }],
  },
});

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
});

module.exports = {
  cloudinary,
  upload,
}; 