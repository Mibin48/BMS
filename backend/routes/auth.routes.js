/**
 * HEM∆ — Auth Routes (with validators)
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { validateRegisterDonor, validateLogin, validateRegisterHospital, validateRegisterBloodBank, validateForgotPassword, validateResetPassword } = require('../middleware/validators/auth.validators');
const ac = require('../controllers/auth.controller');

// Registration (with validation)
router.post('/register/donor', validateRegisterDonor, validate, ac.registerDonor);
router.post('/register/hospital', validateRegisterHospital, validate, ac.registerHospital);
router.post('/register/bloodbank', validateRegisterBloodBank, validate, ac.registerBloodBank);

// Authentication
router.post('/login', validateLogin, validate, ac.login);
router.post('/send-otp', ac.sendOTP);
router.post('/verify-otp', ac.verifyOTP);
router.post('/otp-login', ac.otpLogin);
router.post('/forgot-password', validateForgotPassword, validate, ac.forgotPassword);
router.post('/reset-password', validateResetPassword, validate, ac.resetPassword);
router.post('/refresh-token', ac.refreshToken);
router.post('/logout', protect, ac.logout);
router.post('/reapply', ac.reapply);

// Current user
router.get('/me', protect, ac.getMe);

module.exports = router;
