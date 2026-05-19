/**
 * HEM∆ — Blood Bank Validators
 */
const { body } = require('express-validator');

const validateCreateHealthCheck = [
    body('donor_id').notEmpty().withMessage('Donor ID required'),
    body('weight').isFloat({ min: 20, max: 300 }).withMessage('Weight must be between 20–300 kg'),
    body('hemoglobin').isFloat({ min: 5, max: 25 }).withMessage('Hemoglobin must be between 5–25'),
    body('blood_pressure').notEmpty().withMessage('Blood pressure required').matches(/^\d{2,3}\/\d{2,3}$/).withMessage('BP format must be like 120/80'),
];

const validateCreateDonation = [
    body('donor_id').notEmpty().withMessage('Donor ID required'),
    body('check_id').notEmpty().withMessage('Health check ID required'),
    body('quantity_ml').isInt({ min: 100, max: 450 }).withMessage('Quantity must be 100–450 ml'),
];

const validateCreateIssue = [
    body('request_id').notEmpty().withMessage('Request ID required'),
    body('units_issued').isInt({ min: 1 }).withMessage('Units issued must be at least 1'),
];

const validateUpdateStock = [
    body('action').isIn(['add', 'remove']).withMessage('Action must be add or remove'),
    body('units').isInt({ min: 1 }).withMessage('Units must be at least 1'),
];

module.exports = { validateCreateHealthCheck, validateCreateDonation, validateCreateIssue, validateUpdateStock };
