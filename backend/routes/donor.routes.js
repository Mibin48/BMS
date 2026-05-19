/**
 * HEM∆ — Donor Routes (Phase B3)
 *
 * All routes protected: JWT + donor role
 *
 * GET  /api/donor/profile                  — Get donor profile
 * PUT  /api/donor/profile                  — Update donor profile
 * GET  /api/donor/health-checks            — List health checks
 * GET  /api/donor/health-checks/:check_id  — Get single health check
 * GET  /api/donor/donations                — List donations
 * GET  /api/donor/donations/:donation_id   — Get single donation
 * GET  /api/donor/eligibility              — Check donation eligibility
 * GET  /api/donor/stats                    — Donor statistics + charts
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const donorController = require('../controllers/donor.controller');

// All donor routes: must be logged in + donor role
router.use(protect);
router.use(authorize('donor'));

router.get('/profile', donorController.getProfile);
router.put('/profile', donorController.updateProfile);
router.get('/health-checks', donorController.getHealthChecks);
router.get('/health-checks/:check_id', donorController.getHealthCheckById);
router.get('/donations', donorController.getDonations);
router.get('/donations/:donation_id', donorController.getDonationById);
router.get('/eligibility', donorController.getEligibility);
router.get('/stats', donorController.getStats);

// Appointments
router.get('/appointments', donorController.getAppointments);
router.post('/appointments', donorController.createAppointment);
router.put('/appointments/:id/cancel', donorController.cancelAppointment);

// Camps
router.get('/camps', donorController.getAvailableCamps);
router.get('/my-rsvps', donorController.getMyRSVPs);
router.post('/camps/:camp_id/rsvp', donorController.rsvpToCamp);


module.exports = router;
