const multer = require('multer');
const path = require('path');

// Configure multer storage
const studiostorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'assets', 'studio'));
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const filename = Date.now() + extension; // Generate a unique filename
        cb(null, filename);
    },
});

// Create the multer upload middleware
const uploadStudio = multer({
    storage: studiostorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed.'));
        }
    },
    onError: (err, next) => {
        console.error(err);
        next(err); // Pass the error to the next middleware
    }
});

module.exports = uploadStudio;
