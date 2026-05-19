/**
 * ═══════════════════════════════════════════
 * HEM∆ — Donor Controller (Phase B3)
 * Profile, Health Checks, Donations,
 * Eligibility, Statistics
 * ═══════════════════════════════════════════
 */

const pool = require('../config/db');
const { success, error, notFound } = require('../utils/response');
const { addDays, daysBetween, formatDate, buildMonthlyChart } = require('../utils/dateHelpers');
const { generateRSVPId } = require('../utils/generateId');
const { createNotification } = require('../utils/notify');
const { calcEligibility } = require('../utils/eligibility');


// ═══════════════════════════════════════════
// 1. GET PROFILE
// GET /api/donor/profile
// ═══════════════════════════════════════════

async function getProfile(req, res, next) {
    try {
        const donor_id = req.user.entity_id;

        const [rows] = await pool.execute(
            `SELECT
         d.*,
         u.email,
         u.last_login,
         u.created_at AS member_since,

         (SELECT COUNT(*)
          FROM Donation_Record dr
          WHERE dr.donor_id = d.donor_id
         ) AS total_donations,

         (SELECT COALESCE(SUM(quantity_ml), 0)
          FROM Donation_Record dr
          WHERE dr.donor_id = d.donor_id
         ) AS total_ml,

         (SELECT hc.eligibility_status
          FROM Health_Check hc
          WHERE hc.donor_id = d.donor_id
          ORDER BY hc.check_date DESC
          LIMIT 1
         ) AS current_eligibility

       FROM Donor d
       JOIN Users u ON u.entity_id = d.donor_id
       WHERE d.donor_id = ?`,
            [donor_id]
        );

        if (rows.length === 0) return notFound(res, 'Donor profile not found');

        const profile = rows[0];

        // Computed fields
        profile.lives_saved = profile.total_donations * 3;
        
        // Latest health check values for calculation
        const [lastCheck] = await pool.execute(
            'SELECT hemoglobin, weight, eligibility_status FROM Health_Check WHERE donor_id = ? ORDER BY check_date DESC LIMIT 1',
            [donor_id]
        );
        
        const hb = lastCheck.length ? parseFloat(lastCheck[0].hemoglobin) : 13;
        const wt = lastCheck.length ? parseFloat(lastCheck[0].weight) : 60;
        const lastCheckStatus = lastCheck.length ? lastCheck[0].eligibility_status : 'Eligible';
        
        // Final dynamic status
        profile.current_eligibility = lastCheckStatus === 'Deferred' ? 'Deferred' : calcEligibility(hb, wt, profile.last_donation_date);
        
        const coolingDays = parseInt(process.env.COOLING_PERIOD_DAYS) || 90;
        profile.next_eligible = profile.last_donation_date
            ? addDays(profile.last_donation_date, coolingDays)
            : null;
        
        profile.days_remaining = (profile.current_eligibility === 'Cooling')
            ? Math.max(0, coolingDays - daysBetween(profile.last_donation_date, new Date()))
            : 0;

        return success(res, profile);

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 2. UPDATE PROFILE
// PUT /api/donor/profile
// ═══════════════════════════════════════════

async function updateProfile(req, res, next) {
    let conn;
    try {
        const donor_id = req.user.entity_id;

        // Get current donor
        const [current] = await pool.execute(
            'SELECT * FROM Donor WHERE donor_id = ?',
            [donor_id]
        );

        if (current.length === 0) return notFound(res, 'Donor not found');

        const donor = current[0];
        const body = req.body || {};

        // Merge — only update provided fields
        const updated = {
            name: body.name || donor.name,
            age: body.age || donor.age,
            gender: body.gender || donor.gender,
            blood_group: body.blood_group || donor.blood_group,
            phone: body.phone || donor.phone,
            city: body.city || donor.city,
        };

        // Validations
        if (body.age && (body.age < 18 || body.age > 65)) {
            return error(res, 'Age must be between 18 and 65', 400);
        }
        if (body.gender && !['Male', 'Female', 'Other'].includes(body.gender)) {
            return error(res, 'Invalid gender', 400);
        }
        if (body.blood_group && !['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].includes(body.blood_group)) {
            return error(res, 'Invalid blood group', 400);
        }

        // If phone changed, check uniqueness
        const phoneChanged = body.phone && body.phone !== donor.phone;
        if (phoneChanged) {
            const [dup] = await pool.execute(
                'SELECT donor_id FROM Donor WHERE phone = ? AND donor_id != ?',
                [body.phone, donor_id]
            );
            if (dup.length > 0) return error(res, 'Phone already in use', 409);
        }

        // Transaction
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // UPDATE Donor
        await conn.execute(
            `UPDATE Donor
       SET name = ?, age = ?, gender = ?, blood_group = ?, phone = ?, city = ?, updated_at = NOW()
       WHERE donor_id = ?`,
            [updated.name, updated.age, updated.gender, updated.blood_group, updated.phone, updated.city, donor_id]
        );

        // If phone changed, also update Users table
        if (phoneChanged) {
            await conn.execute(
                'UPDATE Users SET phone = ? WHERE entity_id = ?',
                [updated.phone, donor_id]
            );
        }

        await conn.commit();
        conn.release();

        return success(res, { donor_id, ...updated }, 'Profile updated');

    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 3. GET HEALTH CHECKS
// GET /api/donor/health-checks
// ═══════════════════════════════════════════

async function getHealthChecks(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        // Count total
        const [countRows] = await pool.execute(
            'SELECT COUNT(*) AS total FROM Health_Check WHERE donor_id = ?',
            [donor_id]
        );
        const total = countRows[0].total;

        // Fetch paginated with linked donation
        const [healthChecks] = await pool.execute(
            `SELECT
         hc.*,
         dr.donation_id,
         dr.quantity_ml,
         dr.donation_date,
         dr.bank_id,
         b.bank_name
       FROM Health_Check hc
       LEFT JOIN Donation_Record dr ON dr.check_id = hc.check_id
       LEFT JOIN Blood_Bank b ON b.bank_id = dr.bank_id
       WHERE hc.donor_id = ?
       ORDER BY hc.check_date DESC
       LIMIT ${limit} OFFSET ${offset}`,
            [donor_id]
        );

        return success(res, {
            health_checks: healthChecks,
            total,
            limit,
            offset,
        });

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 4. GET HEALTH CHECK BY ID
// GET /api/donor/health-checks/:check_id
// ═══════════════════════════════════════════

async function getHealthCheckById(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const check_id = req.params.check_id;

        const [rows] = await pool.execute(
            `SELECT
         hc.*,
         dr.donation_id,
         dr.quantity_ml,
         dr.donation_date,
         b.bank_name,
         b.city AS bank_city
       FROM Health_Check hc
       LEFT JOIN Donation_Record dr ON dr.check_id = hc.check_id
       LEFT JOIN Blood_Bank b ON b.bank_id = dr.bank_id
       WHERE hc.check_id = ? AND hc.donor_id = ?`,
            [check_id, donor_id]
        );

        if (rows.length === 0) return notFound(res, 'Health check not found');

        return success(res, rows[0]);

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 5. GET DONATIONS
// GET /api/donor/donations
// ═══════════════════════════════════════════

async function getDonations(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const year = req.query.year ? parseInt(req.query.year) : null;

        // Build WHERE clause
        let whereClause = 'dr.donor_id = ?';
        const params = [donor_id];

        if (year) {
            whereClause += ' AND YEAR(dr.donation_date) = ?';
            params.push(year);
        }

        // Count total (with filters)
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) AS total, COALESCE(SUM(quantity_ml), 0) AS total_ml
       FROM Donation_Record dr WHERE ${whereClause}`,
            params
        );
        const total = countRows[0].total;
        const total_ml = countRows[0].total_ml;

        // Fetch paginated
        const [donations] = await pool.execute(
            `SELECT
         dr.*,
         b.bank_name,
         b.city AS bank_city,
         b.contact_number AS bank_phone,
         hc.weight,
         hc.hemoglobin,
         hc.eligibility_status
       FROM Donation_Record dr
       JOIN Blood_Bank b ON b.bank_id = dr.bank_id
       JOIN Health_Check hc ON hc.check_id = dr.check_id
       WHERE ${whereClause}
       ORDER BY dr.donation_date DESC
       LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        return success(res, {
            donations,
            summary: {
                total_donations: total,
                total_ml,
                average_ml: total > 0 ? Math.round(total_ml / total) : 0,
            },
            total,
            limit,
            offset,
        });

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 6. GET DONATION BY ID
// GET /api/donor/donations/:donation_id
// ═══════════════════════════════════════════

async function getDonationById(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const donation_id = req.params.donation_id;

        const [rows] = await pool.execute(
            `SELECT
         dr.*,
         b.bank_name,
         b.city,
         b.contact_number,
         hc.check_date,
         hc.weight,
         hc.hemoglobin,
         hc.blood_pressure,
         hc.eligibility_status
       FROM Donation_Record dr
       JOIN Blood_Bank b ON b.bank_id = dr.bank_id
       JOIN Health_Check hc ON hc.check_id = dr.check_id
       WHERE dr.donation_id = ? AND dr.donor_id = ?`,
            [donation_id, donor_id]
        );

        if (rows.length === 0) return notFound(res, 'Donation not found');

        return success(res, rows[0]);

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 7. GET ELIGIBILITY
// GET /api/donor/eligibility
// ═══════════════════════════════════════════

async function getEligibility(req, res, next) {
    try {
        const donor_id = req.user.entity_id;

        // Get donor
        const [donorRows] = await pool.execute(
            'SELECT donor_id, name, blood_group, last_donation_date FROM Donor WHERE donor_id = ?',
            [donor_id]
        );

        if (donorRows.length === 0) return notFound(res, 'Donor not found');
        const donor = donorRows[0];

        // Get latest health check
        const [hcRows] = await pool.execute(
            `SELECT check_id, check_date, eligibility_status, hemoglobin, weight
       FROM Health_Check
       WHERE donor_id = ?
       ORDER BY check_date DESC
       LIMIT 1`,
            [donor_id]
        );

        const lastCheck = hcRows.length > 0 ? hcRows[0] : null;

        const hb = lastCheck ? parseFloat(lastCheck.hemoglobin) : 13;
        const wt = lastCheck ? parseFloat(lastCheck.weight) : 60;
        const lastCheckStatus = lastCheck ? lastCheck.eligibility_status : 'Eligible';

        // Use shared utility
        const status = lastCheckStatus === 'Deferred' ? 'Deferred' : calcEligibility(hb, wt, donor.last_donation_date);
        const coolingDays = parseInt(process.env.COOLING_PERIOD_DAYS) || 90;
        
        let next_eligible_date = null;
        let days_remaining = 0;

        if (status === 'Eligible') {
            next_eligible_date = formatDate(new Date());
            days_remaining = 0;
        } else if (status === 'Cooling' && donor.last_donation_date) {
            const diff = daysBetween(donor.last_donation_date, new Date());
            days_remaining = Math.max(0, coolingDays - diff);
            next_eligible_date = addDays(donor.last_donation_date, coolingDays);
        }

        return success(res, {
            status,
            next_eligible_date,
            days_remaining,
            last_donation: {
                donation_date: donor.last_donation_date ? formatDate(donor.last_donation_date) : null,
            },
            last_check: lastCheck
                ? {
                    check_id: lastCheck.check_id,
                    check_date: formatDate(lastCheck.check_date),
                    eligibility_status: lastCheck.eligibility_status,
                    hemoglobin: lastCheck.hemoglobin,
                    weight: lastCheck.weight,
                }
                : null,
        });

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 8. GET STATS
// GET /api/donor/stats
// ═══════════════════════════════════════════

async function getStats(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const targetYear = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        // Run all queries in parallel
        const [
            [donationCounts],
            [byYear],
            [byMonth],
            [checkCount],
        ] = await Promise.all([
            // Query A — donation counts (lifetime)
            pool.execute(
                `SELECT
           COUNT(*) AS total_donations,
           COALESCE(SUM(quantity_ml), 0) AS total_ml,
           COUNT(DISTINCT bank_id) AS banks_visited
         FROM Donation_Record
         WHERE donor_id = ?`,
                [donor_id]
            ),

            // Query B — by year breakdown
            pool.execute(
                `SELECT
           YEAR(donation_date) AS year,
           COUNT(*) AS count,
           SUM(quantity_ml) AS ml
         FROM Donation_Record
         WHERE donor_id = ?
         GROUP BY YEAR(donation_date)
         ORDER BY year DESC`,
                [donor_id]
            ),

            // Query C — by month (dynamic year)
            pool.execute(
                `SELECT
           MONTH(donation_date) AS month,
           SUM(quantity_ml) AS ml
         FROM Donation_Record
         WHERE donor_id = ?
           AND YEAR(donation_date) = ?
         GROUP BY MONTH(donation_date)`,
                [donor_id, targetYear]
            ),

            // Query D — health check count
            pool.execute(
                'SELECT COUNT(*) AS total_checks FROM Health_Check WHERE donor_id = ?',
                [donor_id]
            ),
        ]);

        const stats = donationCounts[0];
        const totalChecks = checkCount[0].total_checks;

        // Build 12-month chart
        const monthly_chart = buildMonthlyChart(byMonth);

        // Gamification Badges
        const badges = [];
        const dons = stats.total_donations;
        const lives = dons * 3;

        if (dons >= 1) badges.push({ id: 'bronze', name: 'Bronze Donor', icon: 'Award', color: 'text-orange-400', desc: "You've officially started your journey as a life saver. Your first donation has provided critical support to patients in need." });
        if (dons >= 5) badges.push({ id: 'silver', name: 'Silver Donor', icon: 'Shield', color: 'text-slate-300', desc: "With 5+ donations, you've become a reliable pillar for the blood bank. Your consistency ensures a steady supply for medical emergencies." });
        if (dons >= 10) badges.push({ id: 'gold', name: 'Gold Donor', icon: 'Star', color: 'text-yellow-400', desc: "10+ donations. You are among the elite donors who have dedicated significant time and health to the community. A true veteran of the cause." });
        if (dons >= 25) badges.push({ id: 'platinum', name: 'Platinum Donor', icon: 'Zap', color: 'text-cyan-300', desc: "Legendary status with 25+ donations. Your lifelong commitment to giving has likely supported dozens of life-saving surgeries and treatments." });

        if (lives >= 10) badges.push({ id: 'saver', name: 'Life Saver', icon: 'Heart', color: 'text-rose-400', desc: `You have directly contributed to saving over ${lives} lives. Each unit of your blood is processed to help multiple patients simultaneously.` });
        if (lives >= 50) badges.push({ id: 'guardian', name: 'Guardian', icon: 'Feather', color: 'text-emerald-400', desc: `50+ lives saved. Your impact is equivalent to protecting an entire community. You are a guardian of health and a beacon of hope.` });
        if (lives >= 100) badges.push({ id: 'hero', name: 'Blood Hero', icon: 'Flame', color: 'text-purple-400', desc: "100+ lives saved. You are a true local hero. Your consistent contributions have built a legacy of hope, survival, and selfless giving." });

        const yearlySummary = byYear.find(y => y.year === parseInt(targetYear)) || { count: 0, ml: 0 };

        return success(res, {
            total_donations: stats.total_donations,
            total_ml: stats.total_ml,
            lives_saved: lives,
            banks_visited: stats.banks_visited,
            total_checks: totalChecks,
            average_ml: stats.total_donations > 0
                ? Math.round(stats.total_ml / stats.total_donations)
                : 0,
            by_year: byYear,
            monthly_chart,
            target_year: targetYear,
            yearly_summary: {
                total_donations: yearlySummary.count,
                total_ml: yearlySummary.ml,
                average_ml: yearlySummary.count > 0 ? Math.round(yearlySummary.ml / yearlySummary.count) : 0
            },
            badges
        });

    } catch (err) {
        next(err);
    }
}


const {
    generateAppointmentId
} = require('../utils/generateId');

// ... existing code ...

// ═══════════════════════════════════════════
// 9. GET APPOINTMENTS
// GET /api/donor/appointments
// ═══════════════════════════════════════════

async function getAppointments(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const [rows] = await pool.execute(
            `SELECT a.*, b.bank_name, b.city, b.contact_number
       FROM Appointment a
       JOIN Blood_Bank b ON b.bank_id = a.bank_id
       WHERE a.donor_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
            [donor_id]
        );

        return success(res, {
            appointments: rows
        });
    } catch (err) {
        next(err);
    }
}

// ═══════════════════════════════════════════
// 10. CREATE APPOINTMENT
// POST /api/donor/appointments
// ═══════════════════════════════════════════

async function createAppointment(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const {
            bank_id,
            date,
            time,
            notes
        } = req.body;

        if (!bank_id || !date || !time) {
            return error(res, 'Bank, date, and time are required', 400);
        }

        // Check if donor already has an active appointment on this date
        const [existing] = await pool.execute(
            'SELECT * FROM Appointment WHERE donor_id = ? AND appointment_date = ? AND status = \'Scheduled\'',
            [donor_id, date]
        );

        if (existing.length > 0) {
            return error(res, 'You already have a scheduled appointment on this date.', 400);
        }

        const appt_id = generateAppointmentId();

        await pool.execute(
            `INSERT INTO Appointment (appointment_id, donor_id, bank_id, appointment_date, appointment_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [appt_id, donor_id, bank_id, date, time, notes || null]
        );

        // Notify Blood Bank
        const [u] = await pool.execute("SELECT user_id FROM Users WHERE entity_id=? AND role='bloodbank'", [bank_id]);
        if (u.length) {
            await createNotification({
                user_id: u[0].user_id,
                role: 'bloodbank',
                type: 'appointment_booked',
                title: 'New Appointment',
                message: `A donor has scheduled a new appointment for ${date} at ${time}.`,
                link: '/bloodbank/appointments',
                priority: 'normal'
            });
        }

        return success(res, {
            appointment_id: appt_id,
            status: 'Scheduled'
        }, 'Appointment booked successfully');
    } catch (err) {
        next(err);
    }
}

// ═══════════════════════════════════════════
// 11. CANCEL APPOINTMENT
// PUT /api/donor/appointments/:id/cancel
// ═══════════════════════════════════════════

async function cancelAppointment(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const appt_id = req.params.id;

        const [appt] = await pool.execute(
            'SELECT * FROM Appointment WHERE appointment_id = ? AND donor_id = ?',
            [appt_id, donor_id]
        );

        if (appt.length === 0) return notFound(res, 'Appointment not found');
        if (appt[0].status !== 'Scheduled') {
            return error(res, `Cannot cancel appointment in '${appt[0].status}' status`, 400);
        }

        await pool.execute(
            'UPDATE Appointment SET status = \'Cancelled\', updated_at = NOW() WHERE appointment_id = ?',
            [appt_id]
        );

        // Notify Blood Bank
        const [u] = await pool.execute("SELECT user_id FROM Users WHERE entity_id=? AND role='bloodbank'", [appt[0].bank_id]);
        if (u.length) {
            await createNotification({
                user_id: u[0].user_id,
                role: 'bloodbank',
                type: 'appointment_cancelled',
                title: 'Appointment Cancelled',
                message: `The appointment for ${appt[0].appointment_date} has been cancelled by the donor.`,
                link: '/bloodbank/appointments',
                priority: 'normal'
            });
        }

        return success(res, null, 'Appointment cancelled');
    } catch (err) {
        next(err);
    }
}

// ═══════════════════════════════════════════
// 12. GET AVAILABLE CAMPS
// ═══════════════════════════════════════════
async function getAvailableCamps(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const { city } = req.query;
        let where = 'c.camp_date >= CURRENT_DATE AND c.status = "Scheduled"';
        const params = [];
        if (city) { where += ' AND c.city = ?'; params.push(city); }

        const [camps] = await pool.execute(
            `SELECT c.*, b.bank_name, b.contact_number AS bank_phone,
             (SELECT status FROM Camp_RSVP WHERE camp_id=c.camp_id AND donor_id=?) AS my_rsvp
             FROM Blood_Camp c JOIN Blood_Bank b ON b.bank_id=c.bank_id
             WHERE ${where} ORDER BY c.camp_date ASC`, [donor_id, ...params]);
        return success(res, camps);
    } catch (err) { next(err); }
}

// ═══════════════════════════════════════════
// 13. RSVP TO CAMP
// ═══════════════════════════════════════════
async function rsvpToCamp(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const camp_id = req.params.camp_id;
        const { status = 'Going' } = req.body;

        const [camp] = await pool.execute('SELECT * FROM Blood_Camp WHERE camp_id=?', [camp_id]);
        if (!camp.length) return notFound(res, 'Camp not found');

        const rsvp_id = generateRSVPId();
        await pool.execute(
            `INSERT INTO Camp_RSVP (rsvp_id, camp_id, donor_id, status)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()`,
            [rsvp_id, camp_id, donor_id, status, status]);

        if (status === 'Going') {
            await createNotification({
                user_id: req.user.user_id, role: 'donor', type: 'camp_rsvp',
                title: 'RSVP Confirmed',
                message: `You've joined ${camp[0].camp_name} on ${camp[0].camp_date}. See you there!`,
                link: '/donor/camps', priority: 'normal'
            });
        }

        return success(res, { rsvp_id, status }, 'RSVP status updated');
    } catch (err) { next(err); }
}

// ═══════════════════════════════════════════
// 14. GET MY RSVPS
// ═══════════════════════════════════════════
async function getMyRSVPs(req, res, next) {
    try {
        const donor_id = req.user.entity_id;
        const [rows] = await pool.execute(
            `SELECT r.*, c.camp_name, c.camp_date, c.location, c.city, b.bank_name
             FROM Camp_RSVP r JOIN Blood_Camp c ON c.camp_id=r.camp_id
             JOIN Blood_Bank b ON b.bank_id=c.bank_id
             WHERE r.donor_id=? ORDER BY c.camp_date DESC`, [donor_id]);
        return success(res, rows);
    } catch (err) { next(err); }
}


module.exports = {
    getProfile,
    updateProfile,
    getHealthChecks,
    getHealthCheckById,
    getDonations,
    getDonationById,
    getEligibility,
    getStats,
    getAppointments,
    createAppointment,
    cancelAppointment,
    getAvailableCamps,
    rsvpToCamp,
    getMyRSVPs
};
