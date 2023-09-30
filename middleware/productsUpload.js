const multer = require('multer');
const path = require('path');

// Configure multer storage
const productsstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'assets', 'products'));
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const filename = Date.now() + extension; // Generate a unique filename
        cb(null, filename);
    },
});

// Create the multer upload middleware
const uploadProducts = multer({
    storage: productsstorage,
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

module.exports = uploadProducts;
