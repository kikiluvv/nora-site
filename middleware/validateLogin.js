// middleware/validation.js

const { body, validationResult } = require('express-validator');

// Middleware to validate and sanitize input
const validateLogin = [
    body('username').trim().notEmpty().withMessage('Username required')
        .matches(/^[a-zA-Z ]*$/).withMessage('Only Characters with white space are allowed'),
    body('password').trim().notEmpty().withMessage('Password required')
        .matches(/^[a-zA-Z ]*$/).withMessage('Only Characters with white space are allowed'),
    // Optional: Add more validation rules here

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateLogin,
};
