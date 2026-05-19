/**
 * ═══════════════════════════════════════════
 * HEM∆ — Public Blood Bank Controller (Phase B3)
 * No authentication required.
 * Used by donors + hospitals to find banks
 * and check blood availability.
 * ═══════════════════════════════════════════
 */

const pool = require('../config/db');
const { success, notFound } = require('../utils/response');


// ═══════════════════════════════════════════
// 1. GET PUBLIC BLOOD BANKS
// GET /api/blood-banks
// Query: ?city=Ernakulam&blood_group=O+
// ═══════════════════════════════════════════

async function getPublicBloodBanks(req, res, next) {
    try {
        const { city, blood_group } = req.query;

        // Build WHERE clause
        let whereClause = "b.status = 'Active'";
        const params = [];

        if (city) {
            whereClause += ' AND b.city = ?';
            params.push(city);
        }

        if (blood_group) {
            whereClause += ` AND EXISTS (
        SELECT 1 FROM Blood_Stock bs
        WHERE bs.bank_id = b.bank_id
          AND bs.blood_group = ?
          AND bs.available_units > 0
      )`;
            params.push(blood_group);
        }

        // Fetch banks
        const [banks] = await pool.execute(
            `SELECT
         b.bank_id,
         b.bank_name,
         b.city,
         b.contact_number,
         b.operating_hours,
         b.storage_capacity,
         (SELECT COALESCE(SUM(available_units), 0)
          FROM Blood_Stock bs
          WHERE bs.bank_id = b.bank_id
         ) AS total_units
       FROM Blood_Bank b
       WHERE ${whereClause}
       ORDER BY b.bank_name`,
            params
        );

        // For each bank, attach stock summary
        const banksWithStock = await Promise.all(
            banks.map(async (bank) => {
                const [stockRows] = await pool.execute(
                    `SELECT blood_group, available_units, capacity
           FROM Blood_Stock
           WHERE bank_id = ?
           ORDER BY blood_group`,
                    [bank.bank_id]
                );

                // Build stock map: { 'O+': 200, 'A+': 120, ... }
                const stock = {};
                stockRows.forEach((row) => {
                    stock[row.blood_group] = row.available_units;
                });

                return {
                    ...bank,
                    open: true, // Mock — always open for now
                    stock,
                };
            })
        );

        return success(res, {
            banks: banksWithStock,
            total: banksWithStock.length,
        });

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 2. GET PUBLIC BANK STOCK
// GET /api/blood-banks/:bank_id/stock
// ═══════════════════════════════════════════

async function getPublicBankStock(req, res, next) {
    try {
        const bank_id = req.params.bank_id;

        // Check bank exists + active
        const [bankRows] = await pool.execute(
            `SELECT bank_id, bank_name, city, contact_number, status
       FROM Blood_Bank
       WHERE bank_id = ? AND status = 'Active'`,
            [bank_id]
        );

        if (bankRows.length === 0) return notFound(res, 'Blood bank not found or not active');

        const bank = bankRows[0];

        // Fetch all stock with computed fields
        const [stockRows] = await pool.execute(
            `SELECT
         stock_id,
         blood_group,
         available_units,
         capacity,
         last_updated,
         ROUND(available_units / capacity * 100, 1) AS percentage,
         CASE
           WHEN available_units / capacity > 0.6 THEN 'Healthy'
           WHEN available_units / capacity > 0.3 THEN 'Low'
           ELSE 'Critical'
         END AS stock_status
       FROM Blood_Stock
       WHERE bank_id = ?
       ORDER BY blood_group`,
            [bank_id]
        );

        // Calculate totals
        const total_units = stockRows.reduce((sum, r) => sum + r.available_units, 0);
        const last_updated = stockRows.length > 0
            ? stockRows.reduce((latest, r) => (new Date(r.last_updated) > new Date(latest) ? r.last_updated : latest), stockRows[0].last_updated)
            : null;

        return success(res, {
            bank: {
                bank_id: bank.bank_id,
                bank_name: bank.bank_name,
                city: bank.city,
                contact_number: bank.contact_number,
            },
            stock: stockRows,
            total_units,
            last_updated,
        });

    } catch (err) {
        next(err);
    }
}


module.exports = {
    getPublicBloodBanks,
    getPublicBankStock,
};
