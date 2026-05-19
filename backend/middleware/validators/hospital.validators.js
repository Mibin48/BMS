/**
 * HEM∆ — Hospital Validators
 */
const { body } = require('express-validator');
const BG = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const validateCreatePatient = [
    body('name').trim().notEmpty().withMessage('Patient name required'),
    body('age').isInt({ min: 1, max: 120 }).withMessage('Invalid age'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('blood_group').isIn(BG).withMessage('Invalid blood group'),
];

const validateCreateRequest = [
    body('patient_id').notEmpty().withMessage('Patient ID required'),
    body('bank_id').notEmpty().withMessage('Bank ID required'),
    body('blood_group').isIn(BG).withMessage('Invalid blood group'),
    body('units_required').isInt({ min: 1, max: 20 }).withMessage('Units must be between 1 and 20'),
    body('priority').optional().isIn(['Emergency', 'Urgent', 'Routine']).withMessage('Invalid priority'),
];

module.exports = { validateCreatePatient, validateCreateRequest };
