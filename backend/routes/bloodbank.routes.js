/**
 * HEM∆ — Blood Bank Routes (with validators)
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { validateCreateHealthCheck, validateCreateDonation, validateCreateIssue, validateUpdateStock } = require('../middleware/validators/bloodbank.validators');
const bc = require('../controllers/bloodbank.controller');

router.use(protect);
router.use(authorize('bloodbank'));

// Profile
router.get('/profile', bc.getProfile);
router.put('/profile', bc.updateProfile);

// Inventory
router.get('/inventory', bc.getInventory);
router.put('/inventory/:stock_id', validateUpdateStock, validate, bc.updateStock);

// Donors
router.post('/donors/recall', bc.recallDonors);
router.get('/donors/search-global', bc.searchGlobalDonors);
router.post('/donors/register-existing', bc.registerExistingDonor);
router.get('/donors', bc.getDonors);
router.get('/donors/:donor_id', bc.getDonorById);
router.post('/donors', bc.createDonor);
router.put('/donors/:donor_id', bc.updateDonor);

// Health Checks
router.get('/health-checks', bc.getHealthChecks);
router.get('/health-checks/:check_id', bc.getHealthCheckById);
router.post('/health-checks', validateCreateHealthCheck, validate, bc.createHealthCheck);

// Donations
router.get('/donations', bc.getDonations);
router.get('/donations/:donation_id', bc.getDonationById);
router.post('/donations', validateCreateDonation, validate, bc.createDonation);

// Requests
router.get('/requests', bc.getRequests);
router.get('/requests/:request_id', bc.getRequestById);
router.put('/requests/:request_id/approve', bc.approveRequest);
router.put('/requests/:request_id/reject', bc.rejectRequest);

// Issues
router.get('/issues', bc.getIssues);
router.get('/issues/:issue_id', bc.getIssueById);
router.post('/issues', validateCreateIssue, validate, bc.createIssue);

// Payments
router.get('/payments', bc.getPayments);
router.put('/payments/:payment_id/paid', bc.updatePayment);

// Stats + Dashboard
router.get('/stats', bc.getStats);
router.get('/dashboard', bc.getDashboard);

// Appointments
router.get('/appointments', bc.getAppointments);
router.put('/appointments/:appointment_id/status', bc.updateAppointmentStatus);
// Camps
router.get('/camps', bc.getCamps);
router.post('/camps', bc.createCamp);
router.put('/camps/:camp_id', bc.updateCamp);
router.delete('/camps/:camp_id', bc.deleteCamp);
router.get('/camps/:camp_id/rsvps', bc.getCampRSVPs);


module.exports = router;
