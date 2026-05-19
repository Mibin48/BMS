/**
 * HEM∆ — Public Blood Bank Routes (Phase B3)
 *
 * No authentication required — public access
 *
 * GET  /api/blood-banks               — List active blood banks
 * GET  /api/blood-banks/:bank_id/stock — Get stock for a bank
 */

const express = require('express');
const router = express.Router();
const publicController = require('../controllers/bloodbank.public.controller');

// Public — no auth needed
router.get('/', publicController.getPublicBloodBanks);
router.get('/:bank_id/stock', publicController.getPublicBankStock);

module.exports = router;
