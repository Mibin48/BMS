/**
 * HEM∆ — Auth Validators
 */
const { body } = require('express-validator');
const BG = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const validateRegisterDonor = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
    body('age').isInt({ min: 18, max: 65 }).withMessage('Age must be between 18 and 65'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('blood_group').isIn(BG).withMessage('Invalid blood group'),
    body('phone').trim().notEmpty().withMessage('Phone is required').isLength({ min: 10, max: 15 }).withMessage('Invalid phone number'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars').matches(/\d/).withMessage('Password must contain a number'),
];

const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['donor', 'hospital', 'bloodbank', 'admin']).withMessage('Invalid role'),
];

const validateRegisterHospital = [
    body('hospital_name').trim().notEmpty().withMessage('Hospital name is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('contact_number').trim().notEmpty().withMessage('Contact number is required'),
    body('beds').isInt({ min: 1 }).withMessage('Beds must be a positive number'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
];

const validateRegisterBloodBank = [
    body('bank_name').trim().notEmpty().withMessage('Bank name is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('contact_number').trim().notEmpty().withMessage('Contact number is required'),
    body('naco_number').trim().notEmpty().withMessage('NACO number is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
];

const validateForgotPassword = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
];

const validateResetPassword = [
    body('email').isEmail().withMessage('Invalid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
];

module.exports = { validateRegisterDonor, validateLogin, validateRegisterHospital, validateRegisterBloodBank, validateForgotPassword, validateResetPassword };
