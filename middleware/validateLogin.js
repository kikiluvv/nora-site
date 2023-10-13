// middleware/validation.js

const { body, validationResult } = require('express-validator');

// Middleware to validate and sanitize input
const validateLogin = [
    body('username')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Username required')
        .matches(/^[a-zA-Z0-9_\-\. ]*$/)
        .withMessage('Only letters, numbers, _, -, ., and white space are allowed'),

    body('password')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Password required')
        .matches(/^[a-zA-Z0-9_\-\. ]*$/)
        .withMessage('Only letters, numbers, _, -, ., and white space are allowed'),
];

module.exports = {
    validateLogin, validationResult
};
