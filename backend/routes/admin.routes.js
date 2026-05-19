/**
 * HEM∆ — Admin Routes (Phase B6)
 * All routes: protect + authorize('admin')
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const ac = require('../controllers/admin.controller');

router.use(protect);
router.use(authorize('admin'));

// System
router.get('/stats', ac.getStats);
router.get('/stats/districts', ac.getDistrictStats);
router.get('/stats/trends', ac.getStatsTrends);
router.get('/dashboard', ac.getDashboard);

// Approvals
router.get('/approvals', ac.getApprovals);
router.get('/approvals/:id', ac.getApprovalById);
router.put('/approvals/:id/approve', ac.approveEntity);
router.put('/approvals/:id/reject', ac.rejectEntity);

// Donors
router.get('/donors', ac.getAllDonors);
router.get('/donors/:donor_id', ac.getDonorById);
router.put('/donors/:donor_id', ac.updateDonor);
router.delete('/donors/:donor_id', ac.deleteDonor);
router.post('/donors/:donor_id/remind', ac.sendDonorReminder);

// Hospitals
router.get('/hospitals', ac.getAllHospitals);
router.get('/hospitals/:hospital_id', ac.getHospitalById);
router.put('/hospitals/:hospital_id', ac.updateHospital);
router.delete('/hospitals/:hospital_id', ac.deleteHospital);

// Blood Banks
router.get('/blood-banks', ac.getAllBloodBanks);
router.get('/blood-banks/:bank_id', ac.getBloodBankById);
router.put('/blood-banks/:bank_id', ac.updateBloodBank);
router.delete('/blood-banks/:bank_id', ac.deleteBloodBank);

// All Operations (update + read)
router.get('/inventory', ac.getAllInventory);
router.put('/inventory/:bank_id/stock/:stock_id', ac.updateInventoryStock);
router.get('/requests', ac.getAllRequests);
router.get('/requests/:request_id', ac.getRequestById);
router.get('/donations', ac.getAllDonations);
router.get('/donations/:donation_id', ac.getDonationById);
router.get('/health-checks', ac.getAllHealthChecks);
router.get('/health-checks/:check_id', ac.getHealthCheckById);
router.get('/issues', ac.getAllIssues);
router.get('/issues/:issue_id', ac.getIssueById);
router.put('/issues/:issue_id/status', ac.updateIssueStatus);
router.get('/payments', ac.getAllPayments);
router.get('/payments/:payment_id', ac.getPaymentById);
router.put('/payments/:payment_id/status', ac.updatePaymentStatus);

// Users
router.get('/users', ac.getUsers);
router.get('/users/:user_id', ac.getUserById);
router.post('/users/create-admin', ac.createAdmin);
router.post('/users/invite', ac.inviteUser);
router.put('/users/:user_id/suspend', ac.suspendUser);
router.put('/users/:user_id/activate', ac.activateUser);
router.delete('/users/:user_id', ac.deleteUser);

// Audit
router.get('/audit', ac.getAuditLogs);
router.get('/audit/:log_id', ac.getAuditLogById);

// Reports
router.post('/reports/generate', ac.generateReport);
router.get('/reports/history', ac.getReportHistory);

// Settings
router.get('/settings', ac.getSettings);
router.put('/settings', ac.updateSettings);

module.exports = router;
