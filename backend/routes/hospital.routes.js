/**
 * HEM∆ — Hospital Routes (with validators)
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { validateCreatePatient, validateCreateRequest } = require('../middleware/validators/hospital.validators');
const hc = require('../controllers/hospital.controller');

router.use(protect);
router.use(authorize('hospital'));

// Profile
router.get('/profile', hc.getProfile);
router.put('/profile', hc.updateProfile);

// Patients
router.get('/patients', hc.getPatients);
router.get('/patients/:patient_id', hc.getPatientById);
router.post('/patients', validateCreatePatient, validate, hc.createPatient);
router.put('/patients/:patient_id', hc.updatePatient);
router.delete('/patients/:patient_id', hc.deletePatient);

// Blood Requests
router.get('/requests', hc.getRequests);
router.get('/requests/:request_id', hc.getRequestById);
router.post('/requests', validateCreateRequest, validate, hc.createRequest);
router.put('/requests/:request_id/cancel', hc.cancelRequest);

// Issues
router.get('/issues', hc.getIssues);
router.get('/issues/:issue_id', hc.getIssueById);

// Payments
router.get('/payments', hc.getPayments);
router.get('/payments/:payment_id', hc.getPaymentById);
router.post('/payments/:payment_id/pay', hc.payNow);

// Blood Banks
router.get('/blood-banks', hc.getBloodBanks);
router.get('/blood-banks/:bank_id/stock', hc.getBankStock);

// Stats + Dashboard
router.get('/stats', hc.getStats);
router.get('/dashboard', hc.getDashboard);

module.exports = router;
