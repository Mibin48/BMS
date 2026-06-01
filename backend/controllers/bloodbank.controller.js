/**
 * ═══════════════════════════════════════════
 * HEM∆ — Blood Bank Controller (Phase B5)
 * 26 endpoints: Profile, Inventory, Donors,
 * Health Checks, Donations, Requests, Issues,
 * Payments, Recall, Stats, Dashboard
 * ═══════════════════════════════════════════
 */
const pool = require('../config/db');
const { generateDonorId, generateHealthCheckId, generateDonationId, generateIssueId, generateLogId, generateCampId } = require('../utils/generateId');
const { createNotification, notifyInventoryAlert } = require('../utils/notify');
const { success, error, notFound } = require('../utils/response');
const { addDays, daysBetween, buildMonthlyChart } = require('../utils/dateHelpers');

const auditLog = async (conn, { user_id, user_name = null, role, action, entity, entity_id = null, detail = null, ip, severity = 'Info' }) => {
    const log_id = generateLogId();
    await conn.execute('INSERT INTO Audit_Log VALUES (?,?,?,?,?,?,?,?,?,?,NOW())', [log_id, user_id, user_name, role, action, entity, entity_id, detail, ip, severity]);
};
const validate = (f) => { for (const [k, v] of Object.entries(f)) { if (v === undefined || v === null || v === '') return `${k} is required`; } return null; };
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const { calcEligibility } = require('../utils/eligibility');



// ═══ 1. GET PROFILE ═══
async function getProfile(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const [rows] = await pool.execute(
            `SELECT b.*, u.email, u.last_login, u.created_at AS member_since,
        (SELECT COALESCE(SUM(available_units),0) FROM Blood_Stock bs WHERE bs.bank_id=b.bank_id) AS total_units,
        (SELECT COUNT(*) FROM Donation_Record dr WHERE dr.bank_id=b.bank_id) AS total_donations,
        (SELECT COUNT(*) FROM Blood_Request br WHERE br.bank_id=b.bank_id) AS total_requests,
        (SELECT COUNT(*) FROM Blood_Request br WHERE br.bank_id=b.bank_id AND br.status='Fulfilled') AS fulfilled_requests,
        (SELECT COUNT(DISTINCT dr.donor_id) FROM Donation_Record dr WHERE dr.bank_id=b.bank_id) AS registered_donors
       FROM Blood_Bank b JOIN Users u ON u.entity_id=b.bank_id WHERE b.bank_id=?`, [bank_id]);
        if (!rows.length) return notFound(res, 'Blood bank not found');
        const p = rows[0];
        p.fulfillment_rate = p.total_requests > 0 ? Math.round((p.fulfilled_requests / p.total_requests) * 1000) / 10 : 0;
        return success(res, p);
    } catch (err) { next(err); }
}

// ═══ 2. UPDATE PROFILE ═══
async function updateProfile(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const [cur] = await pool.execute('SELECT * FROM Blood_Bank WHERE bank_id=?', [bank_id]);
        if (!cur.length) return notFound(res, 'Blood bank not found');
        const b = cur[0], body = req.body || {};
        const u = { bank_name: body.bank_name || b.bank_name, city: body.city || b.city, contact_number: body.contact_number || b.contact_number, storage_capacity: body.storage_capacity || b.storage_capacity, operating_hours: body.operating_hours !== undefined ? body.operating_hours : b.operating_hours };
        await pool.execute('UPDATE Blood_Bank SET bank_name=?,city=?,contact_number=?,storage_capacity=?,operating_hours=?,updated_at=NOW() WHERE bank_id=?', [u.bank_name, u.city, u.contact_number, u.storage_capacity, u.operating_hours, bank_id]);
        return success(res, { bank_id, ...u }, 'Profile updated');
    } catch (err) { next(err); }
}

// ═══ 3. GET INVENTORY ═══
async function getInventory(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const [stock] = await pool.execute(
            `SELECT bs.*, ROUND(bs.available_units/bs.capacity*100,1) AS percentage,
        CASE WHEN bs.available_units/bs.capacity>0.6 THEN 'Healthy' WHEN bs.available_units/bs.capacity>0.3 THEN 'Low' ELSE 'Critical' END AS stock_status
       FROM Blood_Stock bs WHERE bs.bank_id=?
       ORDER BY CASE bs.blood_group WHEN 'O+' THEN 1 WHEN 'O-' THEN 2 WHEN 'A+' THEN 3 WHEN 'A-' THEN 4 WHEN 'B+' THEN 5 WHEN 'B-' THEN 6 WHEN 'AB+' THEN 7 WHEN 'AB-' THEN 8 END`, [bank_id]);
        const total_units = stock.reduce((s, r) => s + r.available_units, 0);
        const critical = stock.filter(r => r.stock_status === 'Critical').length;
        const low = stock.filter(r => r.stock_status === 'Low').length;
        const healthy = stock.filter(r => r.stock_status === 'Healthy').length;
        const [cap] = await pool.execute('SELECT storage_capacity FROM Blood_Bank WHERE bank_id=?', [bank_id]);
        return success(res, { stock, summary: { total_units, critical, low, healthy, storage_capacity: cap[0]?.storage_capacity || 0 } });
    } catch (err) { next(err); }
}

// ═══ 4. UPDATE STOCK OR UPSERT BY BLOOD GROUP ═══
async function updateStock(req, res, next) {
    let conn;
    try {
        const bank_id = req.user.entity_id;
        let stock_id = req.params.stock_id;
        const { action: act, units, notes, blood_group: body_bg } = req.body || {};

        if (!act || !['add', 'remove'].includes(act)) return error(res, "action must be 'add' or 'remove'", 400);
        if (!units || units < 1) return error(res, 'units must be greater than 0', 400);

        const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        let targetGroup = body_bg;

        // If stock_id is a blood group, we are doing a group-based update (upsert)
        if (BLOOD_GROUPS.includes(stock_id)) {
            targetGroup = stock_id;
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        let stockRecord;
        if (targetGroup && !stock_id.startsWith('STK-')) {
            // Find by blood group
            const [rows] = await conn.execute('SELECT * FROM Blood_Stock WHERE bank_id=? AND blood_group=?', [bank_id, targetGroup]);
            if (rows.length) {
                stockRecord = rows[0];
                stock_id = stockRecord.stock_id;
            } else {
                if (act === 'remove') {
                    await conn.rollback(); conn.release();
                    return error(res, `No stock record found for ${targetGroup} to remove from.`, 404);
                }
                // Create new record
                stock_id = `STK-${Math.floor(Math.random() * 90000 + 10000)}`;
                await conn.execute('INSERT INTO Blood_Stock (stock_id, bank_id, blood_group, available_units, capacity, last_updated) VALUES (?,?,?,?,?,NOW())', [stock_id, bank_id, targetGroup, 0, 100]);
                stockRecord = { stock_id, bank_id, blood_group: targetGroup, available_units: 0, capacity: 100 };
            }
        } else {
            // Standard update by stock_id
            const [rows] = await conn.execute('SELECT * FROM Blood_Stock WHERE stock_id=? AND bank_id=?', [stock_id, bank_id]);
            if (!rows.length) { await conn.rollback(); conn.release(); return notFound(res, 'Stock record not found'); }
            stockRecord = rows[0];
        }

        const s = stockRecord;
        let newUnits;
        if (act === 'add') {
            newUnits = Math.min(s.available_units + units, s.capacity);
        } else {
            if (units > s.available_units) {
                await conn.rollback(); conn.release();
                return error(res, `Insufficient stock. Only ${s.available_units} units available.`, 400);
            }
            newUnits = s.available_units - units;
        }

        await conn.execute('UPDATE Blood_Stock SET available_units=?, last_updated=NOW() WHERE stock_id=?', [newUnits, stock_id]);
        await auditLog(conn, {
            user_id: req.user.user_id, role: 'bloodbank', action: 'UPDATED',
            entity: 'Blood_Stock', entity_id: stock_id,
            detail: `${act.toUpperCase()} ${units}U ${s.blood_group} (${s.available_units}→${newUnits}) ${notes || ''}`,
            ip: req.ip, severity: newUnits / s.capacity <= 0.15 ? 'Warning' : 'Info'
        });

        await conn.commit();
        conn.release();

        const ss = newUnits / s.capacity > 0.6 ? 'Healthy' : newUnits / s.capacity > 0.3 ? 'Low' : 'Critical';
        await notifyInventoryAlert(bank_id, s.blood_group, newUnits, s.capacity);

        return success(res, {
            stock_id, blood_group: s.blood_group, previous_units: s.available_units,
            new_units: newUnits, action: act, units, stock_status: ss
        }, 'Stock updated successfully');
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}

// ═══ 5. GET DONORS ═══
async function getDonors(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20, offset = parseInt(req.query.offset) || 0;
        const { blood_group, city, search, eligibility } = req.query;

        let where = 'bbd.bank_id = ?'; const params = [bank_id];
        if (blood_group) { where += ' AND d.blood_group=?'; params.push(blood_group); }
        if (city) { where += ' AND d.city=?'; params.push(city); }
        if (search) { where += ' AND d.name LIKE ?'; params.push(`%${search}%`); }

        const [rows] = await pool.execute(
            `SELECT DISTINCT d.*, u.email,
             (SELECT hc.eligibility_status FROM Health_Check hc WHERE hc.donor_id=d.donor_id ORDER BY hc.check_date DESC LIMIT 1) AS last_check_status,
             (SELECT hc.hemoglobin FROM Health_Check hc WHERE hc.donor_id=d.donor_id ORDER BY hc.check_date DESC LIMIT 1) AS last_hb,
             (SELECT hc.weight FROM Health_Check hc WHERE hc.donor_id=d.donor_id ORDER BY hc.check_date DESC LIMIT 1) AS last_weight,
             DATEDIFF(CURRENT_DATE, d.last_donation_date) AS days_since_donation,
             (SELECT COUNT(*) FROM Donation_Record dr2 WHERE dr2.donor_id=d.donor_id AND dr2.bank_id=?) AS donations_to_this_bank,
             (SELECT COUNT(*) FROM Donation_Record dr3 WHERE dr3.donor_id=d.donor_id) AS total_donations
            FROM Donor d 
            JOIN blood_bank_donor bbd ON bbd.donor_id=d.donor_id
            LEFT JOIN Users u ON u.entity_id = d.donor_id AND u.role = 'donor'
            WHERE ${where} GROUP BY d.donor_id, u.email
            ORDER BY d.last_donation_date DESC`,
            [bank_id, ...params]);

        // Process status dynamically
        const processed = rows.map(d => {
            let status = d.last_check_status || 'Eligible';
            if (status !== 'Deferred') {
                const hb = parseFloat(d.last_hb) || 13;
                const wt = parseFloat(d.last_weight) || 60;
                status = calcEligibility(hb, wt, d.last_donation_date);
            }
            return { ...d, current_eligibility: status };
        });

        // Apply eligibility filter if requested
        let filtered = processed;
        if (eligibility) {
            filtered = processed.filter(d => d.current_eligibility === eligibility);
        }

        const donors = filtered.slice(offset, offset + limit);
        const stats = {
            total: processed.length,
            eligible: processed.filter(d => d.current_eligibility === 'Eligible').length,
            cooling: processed.filter(d => d.current_eligibility === 'Cooling').length,
            deferred: processed.filter(d => d.current_eligibility === 'Deferred').length
        };

        return success(res, {
            donors,
            summary: stats,
            stats, // for compatibility
            total: filtered.length,
            limit,
            offset
        });
    } catch (err) { next(err); }
}

// ═══ 6. GET DONOR BY ID ═══
async function getDonorById(req, res, next) {
    try {
        const bank_id = req.user.entity_id, donor_id = req.params.donor_id;
        const [chk] = await pool.execute('SELECT COUNT(*) AS cnt FROM blood_bank_donor WHERE donor_id=? AND bank_id=?', [donor_id, bank_id]);
        if (chk[0].cnt === 0) return notFound(res, 'Donor not registered with this blood bank');
        const [dRows] = await pool.execute(
            `SELECT d.*, u.email 
             FROM Donor d 
             LEFT JOIN Users u ON u.entity_id = d.donor_id AND u.role = 'donor'
             WHERE d.donor_id = ?`,
            [donor_id]
        );
        if (!dRows.length) return notFound(res, 'Donor not found');
        const donor = dRows[0];
        const [hcs] = await pool.execute('SELECT * FROM Health_Check WHERE donor_id=? ORDER BY check_date DESC', [donor_id]);
        const [dons] = await pool.execute('SELECT dr.*, b.bank_name FROM Donation_Record dr JOIN Blood_Bank b ON b.bank_id=dr.bank_id WHERE dr.donor_id=? AND dr.bank_id=? ORDER BY donation_date DESC', [donor_id, bank_id]);
        const elig = hcs.length > 0 ? calcEligibility(parseFloat(hcs[0].hemoglobin), parseFloat(hcs[0].weight), donor.last_donation_date) : 'Eligible';
        const coolingDays = parseInt(process.env.COOLING_PERIOD_DAYS) || 90;
        donor.eligibility = elig;
        return success(res, { donor, health_checks: hcs, donations: dons, next_eligible_date: donor.last_donation_date ? addDays(donor.last_donation_date, coolingDays) : null, days_since_donation: donor.last_donation_date ? daysBetween(donor.last_donation_date, new Date()) : null });
    } catch (err) { next(err); }
}

// ═══ 7. CREATE DONOR ═══
async function createDonor(req, res, next) {
    let conn;
    try {
        const { name, age, gender, blood_group, phone, city } = req.body || {};
        const m = validate({ name, age, gender, blood_group, phone, city }); if (m) return error(res, m, 400);
        if (!BLOOD_GROUPS.includes(blood_group)) return error(res, 'Invalid blood group', 400);
        const [dup] = await pool.execute('SELECT donor_id FROM Donor WHERE phone=?', [phone]);
        if (dup.length) return error(res, 'Donor already registered with this phone number', 409);
        const donor_id = generateDonorId();
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('INSERT INTO Donor (donor_id,name,age,gender,blood_group,phone,city,last_donation_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,NULL,NOW(),NOW())', [donor_id, name, age, gender, blood_group, phone, city]);
        await conn.execute('INSERT INTO blood_bank_donor (bank_id, donor_id) VALUES (?, ?)', [req.user.entity_id, donor_id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'bloodbank', action: 'CREATED', entity: 'Donor', entity_id: donor_id, detail: `Donor registered by blood bank: ${name}, ${blood_group}`, ip: req.ip });
        await conn.commit(); conn.release();
        return success(res, { donor_id, name, blood_group, phone }, 'Donor registered', 201);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// ═══ 8. UPDATE DONOR ═══
async function updateDonor(req, res, next) {
    try {
        const bank_id = req.user.entity_id, donor_id = req.params.donor_id;
        const [chk] = await pool.execute('SELECT COUNT(*) AS cnt FROM Donation_Record WHERE donor_id=? AND bank_id=?', [donor_id, bank_id]);
        if (chk[0].cnt === 0) return notFound(res, 'Donor not registered with this blood bank');
        const [cur] = await pool.execute('SELECT * FROM Donor WHERE donor_id=?', [donor_id]);
        if (!cur.length) return notFound(res, 'Donor not found');
        const d = cur[0], body = req.body || {};
        const u = { name: body.name || d.name, age: body.age || d.age, gender: body.gender || d.gender, blood_group: body.blood_group || d.blood_group, phone: body.phone || d.phone, city: body.city || d.city };
        if (body.phone && body.phone !== d.phone) {
            const [dup] = await pool.execute('SELECT donor_id FROM Donor WHERE phone=? AND donor_id!=?', [body.phone, donor_id]);
            if (dup.length) return error(res, 'Phone already in use', 409);
        }
        await pool.execute('UPDATE Donor SET name=?,age=?,gender=?,blood_group=?,phone=?,city=?,updated_at=NOW() WHERE donor_id=?', [u.name, u.age, u.gender, u.blood_group, u.phone, u.city, donor_id]);
        return success(res, { donor_id, ...u }, 'Donor updated');
    } catch (err) { next(err); }
}

// ═══ 9. GET HEALTH CHECKS ═══
async function getHealthChecks(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20, offset = parseInt(req.query.offset) || 0;
        const { result, donor_id, date_from, date_to } = req.query;
        let where = 'hc.bank_id = ?';
        const params = [bank_id];
        if (result) { where += ' AND hc.eligibility_status=?'; params.push(result); }
        if (donor_id) { where += ' AND hc.donor_id=?'; params.push(donor_id); }
        if (date_from) { where += ' AND hc.check_date>=?'; params.push(date_from); }
        if (date_to) { where += ' AND hc.check_date<=?'; params.push(date_to); }
        const [countR] = await pool.execute(`SELECT COUNT(*) AS total FROM Health_Check hc WHERE ${where}`, params);
        const [hcs] = await pool.execute(
            `SELECT hc.*, d.name AS donor_name, d.blood_group AS donor_blood_group, d.phone AS donor_phone, d.city AS donor_city,
        dr.donation_id, dr.donation_date, dr.quantity_ml
       FROM Health_Check hc JOIN Donor d ON d.donor_id=hc.donor_id LEFT JOIN Donation_Record dr ON dr.check_id=hc.check_id
       WHERE ${where} ORDER BY hc.check_date DESC LIMIT ${limit} OFFSET ${offset}`, params);
        return success(res, { health_checks: hcs, total: countR[0].total, limit, offset });
    } catch (err) { next(err); }
}

// ═══ 10. GET HEALTH CHECK BY ID ═══
async function getHealthCheckById(req, res, next) {
    try {
        const bank_id = req.user.entity_id, check_id = req.params.check_id;
        const [rows] = await pool.execute(
            `SELECT hc.*, d.name AS donor_name, d.blood_group AS donor_blood_group, d.phone AS donor_phone,
        dr.donation_id, dr.donation_date, dr.quantity_ml
       FROM Health_Check hc JOIN Donor d ON d.donor_id=hc.donor_id LEFT JOIN Donation_Record dr ON dr.check_id=hc.check_id
       WHERE hc.check_id=? AND hc.bank_id=?`, [check_id, bank_id]);
        if (!rows.length) return notFound(res, 'Health check not found');
        return success(res, rows[0]);
    } catch (err) { next(err); }
}

// ═══ 11. CREATE HEALTH CHECK ═══
async function createHealthCheck(req, res, next) {
    let conn;
    try {
        const { donor_id, weight, hemoglobin, blood_pressure, check_date } = req.body || {};
        const m = validate({ donor_id, weight, hemoglobin, blood_pressure }); if (m) return error(res, m, 400);
        const [dRows] = await pool.execute('SELECT * FROM Donor WHERE donor_id=?', [donor_id]);
        if (!dRows.length) return notFound(res, 'Donor not found');
        const donor = dRows[0];
        const eligibility_status = calcEligibility(parseFloat(hemoglobin), parseFloat(weight), donor.last_donation_date);
        const check_id = generateHealthCheckId();
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('INSERT INTO Health_Check (check_id,donor_id,bank_id,check_date,weight,hemoglobin,blood_pressure,eligibility_status,created_at) VALUES (?,?,?,COALESCE(?,CURRENT_DATE),?,?,?,?,NOW())', [check_id, donor_id, req.user.entity_id, check_date || null, weight, hemoglobin, blood_pressure, eligibility_status]);
        await conn.execute('INSERT IGNORE INTO blood_bank_donor (bank_id, donor_id) VALUES (?, ?)', [req.user.entity_id, donor_id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'bloodbank', action: 'CREATED', entity: 'Health_Check', entity_id: check_id, detail: `Health check: ${donor.name} → ${eligibility_status} (Hb:${hemoglobin} W:${weight}kg)`, ip: req.ip });
        await conn.commit(); conn.release();
        const can_donate = eligibility_status === 'Eligible';
        const msg = can_donate ? 'Donor cleared to donate' : eligibility_status === 'Cooling' ? 'Donor in cooling period. Cannot donate yet.' : 'Donor deferred. Cannot donate.';
        return success(res, { check_id, donor_id, donor_name: donor.name, eligibility_status, can_donate, message: msg }, msg, 201);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// ═══ 12. GET DONATIONS ═══
async function getDonations(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20, offset = parseInt(req.query.offset) || 0;
        const { blood_group, donor_id, year, month } = req.query;
        let where = 'dr.bank_id=?'; const params = [bank_id];
        if (blood_group) { where += ' AND dr.blood_group=?'; params.push(blood_group); }
        if (donor_id) { where += ' AND dr.donor_id=?'; params.push(donor_id); }
        if (year) { where += ' AND YEAR(dr.donation_date)=?'; params.push(parseInt(year)); }
        if (month) { where += ' AND MONTH(dr.donation_date)=?'; params.push(parseInt(month)); }
        const [countR] = await pool.execute(`SELECT COUNT(*) AS total, COALESCE(SUM(quantity_ml),0) AS total_ml, COUNT(DISTINCT donor_id) AS unique_donors FROM Donation_Record dr WHERE ${where}`, params);
        const [donations] = await pool.execute(
            `SELECT dr.*, d.name AS donor_name, d.phone AS donor_phone, d.city AS donor_city,
        hc.weight, hc.hemoglobin, hc.blood_pressure, hc.eligibility_status
       FROM Donation_Record dr JOIN Donor d ON d.donor_id=dr.donor_id JOIN Health_Check hc ON hc.check_id=dr.check_id
       WHERE ${where} ORDER BY dr.donation_date DESC LIMIT ${limit} OFFSET ${offset}`, params);
        const s = countR[0];
        return success(res, { donations, summary: { total: s.total, total_ml: s.total_ml, unique_donors: s.unique_donors, average_ml: s.total > 0 ? Math.round(s.total_ml / s.total) : 0 }, total: s.total, limit, offset });
    } catch (err) { next(err); }
}

// ═══ 13. GET DONATION BY ID ═══
async function getDonationById(req, res, next) {
    try {
        const bank_id = req.user.entity_id, donation_id = req.params.donation_id;
        const [rows] = await pool.execute(
            `SELECT dr.*, d.name AS donor_name, d.phone AS donor_phone, d.city AS donor_city, d.blood_group AS donor_blood_group,
        hc.check_date, hc.weight, hc.hemoglobin, hc.blood_pressure, hc.eligibility_status
       FROM Donation_Record dr JOIN Donor d ON d.donor_id=dr.donor_id JOIN Health_Check hc ON hc.check_id=dr.check_id
       WHERE dr.donation_id=? AND dr.bank_id=?`, [donation_id, bank_id]);
        if (!rows.length) return notFound(res, 'Donation not found');
        return success(res, rows[0]);
    } catch (err) { next(err); }
}

// ═══ 14. CREATE DONATION ═══
async function createDonation(req, res, next) {
    let conn;
    try {
        const { donor_id, check_id, quantity_ml, donation_date } = req.body || {};
        const m = validate({ donor_id, check_id, quantity_ml }); if (m) return error(res, m, 400);
        if (quantity_ml < 100 || quantity_ml > 450) return error(res, 'Quantity must be between 100 and 450 ml', 400);
        const bank_id = req.user.entity_id;
        const [hcRows] = await pool.execute('SELECT hc.*, d.last_donation_date, d.blood_group, d.name FROM Health_Check hc JOIN Donor d ON d.donor_id=hc.donor_id WHERE hc.check_id=? AND hc.donor_id=?', [check_id, donor_id]);
        if (!hcRows.length) return notFound(res, 'Health check not found for this donor');
        const hc = hcRows[0];
        if (hc.eligibility_status === 'Deferred') return error(res, 'Donor is deferred. Cannot record donation.', 400);
        if (hc.eligibility_status === 'Cooling') return error(res, 'Donor is in cooling period. Cannot donate yet.', 400);
        const [dupChk] = await pool.execute('SELECT donation_id FROM Donation_Record WHERE check_id=?', [check_id]);
        if (dupChk.length) return error(res, 'Donation already recorded for this health check', 409);
        const donation_id = generateDonationId();
        const d_date = donation_date || new Date().toISOString().split('T')[0];
        conn = await pool.getConnection(); await conn.beginTransaction();

        // 1. Insert Donation
        await conn.execute('INSERT INTO Donation_Record (donation_id,donor_id,bank_id,check_id,donation_date,quantity_ml,blood_group,created_at) VALUES (?,?,?,?,COALESCE(?,CURRENT_DATE),?,?,NOW())', [donation_id, donor_id, bank_id, check_id, donation_date || null, quantity_ml, hc.blood_group]);

        // 2. Update Donor's last donation date
        await conn.execute('UPDATE Donor SET last_donation_date = ? WHERE donor_id = ?', [d_date, donor_id]);

        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'bloodbank', action: 'CREATED', entity: 'Donation_Record', entity_id: donation_id, detail: `Donation: ${hc.name} ${quantity_ml}ml ${hc.blood_group}.`, ip: req.ip });

        await conn.commit(); conn.release();

        const [stk] = await pool.execute('SELECT available_units, capacity FROM Blood_Stock WHERE bank_id=? AND blood_group=?', [bank_id, hc.blood_group]);
        if (stk.length) await notifyInventoryAlert(bank_id, hc.blood_group, stk[0].available_units, stk[0].capacity);
        return success(res, { donation_id, donor_id, donor_name: hc.name, blood_group: hc.blood_group, quantity_ml, donation_date: d_date, stock_updated: true, new_stock: { blood_group: hc.blood_group, available_units: stk[0]?.available_units || 0 } }, 'Donation recorded and inventory updated successfully.', 201);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// ═══ 15. GET REQUESTS ═══
async function getRequests(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20, offset = parseInt(req.query.offset) || 0;
        const { status, priority, blood_group } = req.query;
        let where = 'br.bank_id=?'; const params = [bank_id];
        if (status) { where += ' AND br.status=?'; params.push(status); }
        if (priority) { where += ' AND br.priority=?'; params.push(priority); }
        if (blood_group) { where += ' AND br.blood_group=?'; params.push(blood_group); }
        const [countR] = await pool.execute(`SELECT COUNT(*) AS total FROM Blood_Request br WHERE ${where}`, params);
        const [sumR] = await pool.execute(`SELECT COUNT(*) AS total, SUM(status='Pending') AS pending, SUM(status='Processing') AS processing, SUM(status='Fulfilled') AS fulfilled, SUM(status='Cancelled') AS cancelled FROM Blood_Request WHERE bank_id=?`, [bank_id]);
        const [requests] = await pool.execute(
            `SELECT br.*, h.hospital_name, h.city AS hospital_city, h.contact_number AS hospital_phone,
        p.name AS patient_name, p.age AS patient_age, p.blood_group AS patient_blood_group,
        bs.available_units AS stock_available, CASE WHEN bs.available_units>=br.units_required THEN 'Sufficient' ELSE 'Insufficient' END AS stock_check,
        bi.issue_id, bi.issue_date, bi.units_issued, pay.payment_id, pay.amount, pay.payment_status
       FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Patient p ON p.patient_id=br.patient_id
       LEFT JOIN Blood_Stock bs ON bs.bank_id=br.bank_id AND bs.blood_group=br.blood_group
       LEFT JOIN Blood_Issue bi ON bi.request_id=br.request_id LEFT JOIN Payment pay ON pay.request_id=br.request_id
       WHERE ${where}
       ORDER BY CASE br.priority WHEN 'Emergency' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, br.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`, params);
        const s = sumR[0];
        return success(res, { requests, summary: { total: s.total || 0, pending: s.pending || 0, processing: s.processing || 0, fulfilled: s.fulfilled || 0, cancelled: s.cancelled || 0 }, total: countR[0].total, limit, offset });
    } catch (err) { next(err); }
}

// ═══ 16. GET REQUEST BY ID ═══
async function getRequestById(req, res, next) {
    try {
        const bank_id = req.user.entity_id, request_id = req.params.request_id;
        const [rows] = await pool.execute(
            `SELECT br.*, h.hospital_name, h.city AS hospital_city, h.contact_number AS hospital_phone,
        p.name AS patient_name, p.age AS patient_age, p.blood_group AS patient_blood_group,
        bs.available_units AS stock_available, bi.issue_id, bi.issue_date, bi.units_issued, bi.notes AS issue_notes,
        pay.payment_id, pay.amount, pay.payment_status, pay.payment_date
       FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Patient p ON p.patient_id=br.patient_id
       LEFT JOIN Blood_Stock bs ON bs.bank_id=br.bank_id AND bs.blood_group=br.blood_group
       LEFT JOIN Blood_Issue bi ON bi.request_id=br.request_id LEFT JOIN Payment pay ON pay.request_id=br.request_id
       WHERE br.request_id=? AND br.bank_id=?`, [request_id, bank_id]);
        if (!rows.length) return notFound(res, 'Request not found');
        return success(res, rows[0]);
    } catch (err) { next(err); }
}

// ═══ 17. APPROVE REQUEST ═══
async function approveRequest(req, res, next) {
    let conn;
    try {
        const bank_id = req.user.entity_id, request_id = req.params.request_id;
        const [rows] = await pool.execute('SELECT * FROM Blood_Request WHERE request_id=? AND bank_id=?', [request_id, bank_id]);
        if (!rows.length) return notFound(res, 'Request not found');
        if (rows[0].status !== 'Pending') return error(res, `Only Pending requests can be approved. Status: ${rows[0].status}`, 400);
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute("UPDATE Blood_Request SET status='Processing',updated_at=NOW() WHERE request_id=?", [request_id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'bloodbank', action: 'APPROVED', entity: 'Blood_Request', entity_id: request_id, detail: `Request approved: ${rows[0].units_required}U ${rows[0].blood_group}`, ip: req.ip });

        const [uR] = await conn.execute('SELECT user_id FROM Users WHERE entity_id=?', [rows[0].hospital_id]);
        if (uR.length) {
            await createNotification({
                user_id: uR[0].user_id, role: 'hospital', type: 'request_approved',
                title: 'Request Approved', message: `Your request for ${rows[0].units_required}U ${rows[0].blood_group} has been approved by the blood bank.`,
                link: '/hospital/requests', priority: 'high'
            });
        }
        await conn.commit(); conn.release();
        return success(res, { request_id, status: 'Processing' }, 'Request approved. Proceed to issue blood.');
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// ═══ 18. REJECT REQUEST ═══
async function rejectRequest(req, res, next) {
    let conn;
    try {
        const bank_id = req.user.entity_id, request_id = req.params.request_id;
        const { reason } = req.body || {};
        const [rows] = await pool.execute('SELECT * FROM Blood_Request WHERE request_id=? AND bank_id=?', [request_id, bank_id]);
        if (!rows.length) return notFound(res, 'Request not found');
        if (rows[0].status !== 'Pending') return error(res, `Only Pending requests can be rejected. Status: ${rows[0].status}`, 400);
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute("UPDATE Blood_Request SET status='Cancelled',updated_at=NOW() WHERE request_id=?", [request_id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'bloodbank', action: 'REJECTED', entity: 'Blood_Request', entity_id: request_id, detail: `Request rejected: ${reason || 'No reason'}`, ip: req.ip, severity: 'Warning' });

        const [uR] = await conn.execute('SELECT user_id FROM Users WHERE entity_id=?', [rows[0].hospital_id]);
        if (uR.length) {
            await createNotification({
                user_id: uR[0].user_id, role: 'hospital', type: 'request_rejected',
                title: 'Request Rejected', message: `Your request for ${rows[0].units_required}U ${rows[0].blood_group} has been rejected. Reason: ${reason || 'N/A'}`,
                link: '/hospital/requests', priority: 'high'
            });
        }
        await conn.commit(); conn.release();
        return success(res, { request_id, status: 'Cancelled' }, 'Request rejected');
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// ═══ 19. GET ISSUES ═══
async function getIssues(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20, offset = parseInt(req.query.offset) || 0;
        const { blood_group, hospital_id } = req.query;
        let where = 'br.bank_id=?'; const params = [bank_id];
        if (blood_group) { where += ' AND br.blood_group=?'; params.push(blood_group); }
        if (hospital_id) { where += ' AND br.hospital_id=?'; params.push(hospital_id); }
        const [sumR] = await pool.execute(`SELECT COUNT(*) AS total, COALESCE(SUM(bi.units_issued),0) AS total_units_issued FROM Blood_Issue bi JOIN Blood_Request br ON br.request_id=bi.request_id WHERE ${where}`, params);
        const [issues] = await pool.execute(
            `SELECT bi.*, br.blood_group, br.units_required, br.priority, h.hospital_name, h.city AS hospital_city,
        p.name AS patient_name, pay.payment_id, pay.amount, pay.payment_status
       FROM Blood_Issue bi JOIN Blood_Request br ON br.request_id=bi.request_id
       JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Patient p ON p.patient_id=br.patient_id
       LEFT JOIN Payment pay ON pay.request_id=br.request_id
       WHERE ${where} ORDER BY bi.issue_date DESC LIMIT ${limit} OFFSET ${offset}`, params);
        return success(res, { issues, summary: { total: sumR[0].total, total_units_issued: sumR[0].total_units_issued }, total: sumR[0].total, limit, offset });
    } catch (err) { next(err); }
}

// ═══ 20. GET ISSUE BY ID ═══
async function getIssueById(req, res, next) {
    try {
        const bank_id = req.user.entity_id, issue_id = req.params.issue_id;
        const [rows] = await pool.execute(
            `SELECT bi.*, br.blood_group, br.units_required, br.priority, br.request_date,
        h.hospital_name, h.city AS hospital_city, h.contact_number AS hospital_phone,
        p.name AS patient_name, p.age AS patient_age, p.ward AS patient_ward,
        pay.payment_id, pay.amount, pay.payment_status
       FROM Blood_Issue bi JOIN Blood_Request br ON br.request_id=bi.request_id
       JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Patient p ON p.patient_id=br.patient_id
       LEFT JOIN Payment pay ON pay.request_id=br.request_id
       WHERE bi.issue_id=? AND br.bank_id=?`, [issue_id, bank_id]);
        if (!rows.length) return notFound(res, 'Issue not found');
        return success(res, rows[0]);
    } catch (err) { next(err); }
}

// ═══ 21. CREATE ISSUE ═══
async function createIssue(req, res, next) {
    let conn;
    try {
        const { request_id, units_issued, notes, issue_date } = req.body || {};
        const m = validate({ request_id, units_issued }); if (m) return error(res, m, 400);
        const bank_id = req.user.entity_id;
        const [rRows] = await pool.execute(
            `SELECT br.*, bs.available_units, h.hospital_name FROM Blood_Request br
       JOIN Blood_Stock bs ON bs.bank_id=br.bank_id AND bs.blood_group=br.blood_group
       LEFT JOIN Hospital h ON h.hospital_id=br.hospital_id
       WHERE br.request_id=? AND br.bank_id=?`, [request_id, bank_id]);
        if (!rRows.length) return notFound(res, 'Request not found');
        const r = rRows[0];
        if (r.status === 'Fulfilled') return error(res, 'Request already fulfilled', 400);
        if (r.status === 'Cancelled') return error(res, 'Cannot issue for cancelled request', 400);
        if (r.status === 'Pending') return error(res, 'Approve request first before issuing blood', 400);
        const [dupI] = await pool.execute('SELECT issue_id FROM Blood_Issue WHERE request_id=?', [request_id]);
        if (dupI.length) return error(res, 'Blood already issued for this request', 409);
        if (r.available_units < units_issued) return error(res, `Insufficient stock. Available: ${r.available_units}U, Requested: ${units_issued}U`, 400);
        if (units_issued > r.units_required) return error(res, `Cannot issue more than requested units (${r.units_required}U)`, 400);
        const issue_id = generateIssueId();
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('INSERT INTO Blood_Issue (issue_id,request_id,issue_date,units_issued,notes,created_at) VALUES (?,?,COALESCE(?,CURRENT_DATE),?,?,NOW())', [issue_id, request_id, issue_date || null, units_issued, notes || null]);
        // Trigger fires: stock decreases + request → Fulfilled
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'bloodbank', action: 'ISSUED', entity: 'Blood_Issue', entity_id: issue_id, detail: `Issued ${units_issued}U ${r.blood_group} to ${r.hospital_name}`, ip: req.ip });

        const [uR] = await conn.execute('SELECT user_id FROM Users WHERE entity_id=?', [r.hospital_id]);
        if (uR.length) {
            await createNotification({
                user_id: uR[0].user_id, role: 'hospital', type: 'blood_issued',
                title: 'Blood Units Issued', message: `${units_issued} units of ${r.blood_group} blood have been issued for your patient.`,
                link: '/hospital/requests', priority: 'normal'
            });
            await createNotification({
                user_id: uR[0].user_id, role: 'hospital', type: 'payment_due',
                title: 'Payment Pending', message: `Please complete the payment for the recently issued ${r.blood_group} blood.`,
                link: '/hospital/payments', priority: 'high'
            });
        }
        await conn.commit(); conn.release();
        const [stk] = await pool.execute('SELECT available_units, capacity FROM Blood_Stock WHERE bank_id=? AND blood_group=?', [bank_id, r.blood_group]);
        if (stk.length) await notifyInventoryAlert(bank_id, r.blood_group, stk[0].available_units, stk[0].capacity);
        return success(res, { issue_id, request_id, blood_group: r.blood_group, units_issued, issue_date: issue_date || new Date().toISOString().split('T')[0], request_status: 'Fulfilled', stock_updated: true, new_stock: { blood_group: r.blood_group, available_units: stk[0]?.available_units || 0 } }, 'Blood issued successfully. Stock updated automatically.', 201);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// ═══ 22. GET PAYMENTS ═══
async function getPayments(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20, offset = parseInt(req.query.offset) || 0;
        const { status, hospital_id } = req.query;
        let where = 'pay.bank_id=?'; const params = [bank_id];
        if (status) { where += ' AND pay.payment_status=?'; params.push(status); }
        if (hospital_id) { where += ' AND pay.hospital_id=?'; params.push(hospital_id); }
        const [sumR] = await pool.execute(`SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS total_received, COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS total_pending, COALESCE(SUM(amount),0) AS total_amount FROM Payment WHERE bank_id=?`, [bank_id]);
        const [payments] = await pool.execute(
            `SELECT pay.*, h.hospital_name, h.city AS hospital_city, h.contact_number AS hospital_phone,
        br.blood_group, br.units_required, br.priority, br.created_at AS request_date, p.name AS patient_name,
        bi.issue_date, bi.issue_id
       FROM Payment pay JOIN Hospital h ON h.hospital_id=pay.hospital_id
       JOIN Blood_Request br ON br.request_id=pay.request_id JOIN Patient p ON p.patient_id=br.patient_id
       LEFT JOIN Blood_Issue bi ON bi.request_id=br.request_id
       WHERE ${where} ORDER BY pay.created_at DESC LIMIT ${limit} OFFSET ${offset}`, params);
        const s = sumR[0];
        return success(res, { payments, summary: { total: s.total, total_received: s.total_received, total_pending: s.total_pending, total_amount: s.total_amount }, total: s.total, limit, offset });
    } catch (err) { next(err); }
}

// ═══ 23. UPDATE PAYMENT (confirm paid) ═══
async function updatePayment(req, res, next) {
    let conn;
    try {
        const bank_id = req.user.entity_id, payment_id = req.params.payment_id;
        const [rows] = await pool.execute('SELECT pay.*, h.hospital_name FROM Payment pay JOIN Hospital h ON h.hospital_id=pay.hospital_id WHERE pay.payment_id=? AND pay.bank_id=?', [payment_id, bank_id]);
        if (!rows.length) return notFound(res, 'Payment not found');
        if (rows[0].payment_status === 'Paid') return error(res, 'Payment already completed', 400);
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute("UPDATE Payment SET payment_status='Paid',payment_date=CURRENT_DATE WHERE payment_id=?", [payment_id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'bloodbank', action: 'PAID', entity: 'Payment', entity_id: payment_id, detail: `Payment ₹${rows[0].amount} received from ${rows[0].hospital_name}`, ip: req.ip });
        await conn.commit(); conn.release();

        // Notify Hospital
        const [u] = await pool.execute("SELECT user_id FROM Users WHERE entity_id=? AND role='hospital'", [rows[0].hospital_id]);
        if (u.length) {
            await createNotification({
                user_id: u[0].user_id,
                role: 'hospital',
                type: 'payment_confirmed',
                title: 'Payment Confirmed',
                message: `The blood bank has confirmed receipt of your payment (₹${rows[0].amount}) for request ${rows[0].request_id}.`,
                link: '/hospital/payments',
                priority: 'normal'
            });
        }

        return success(res, { payment_id, payment_status: 'Paid', amount: rows[0].amount }, 'Payment confirmed');
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// ═══ 24. RECALL DONORS ═══
async function recallDonors(req, res, next) {
    let conn;
    try {
        const bank_id = req.user.entity_id;
        const { blood_group, city, message } = req.body || {};
        const coolingDays = parseInt(process.env.COOLING_PERIOD_DAYS) || 90;
        let where = `d.donor_id IN (SELECT DISTINCT donor_id FROM Donation_Record WHERE bank_id=?)`;
        const params = [bank_id];
        if (blood_group) { where += ' AND d.blood_group=?'; params.push(blood_group); }
        if (city) { where += ' AND d.city=?'; params.push(city); }
        where += ` AND (d.last_donation_date IS NULL OR DATEDIFF(CURRENT_DATE,d.last_donation_date)>=?)`;
        params.push(coolingDays);
        const [donors] = await pool.execute(`SELECT d.donor_id, d.name, d.phone, d.blood_group, d.city FROM Donor d WHERE ${where}`, params);
        donors.forEach(d => { console.log(`📱 SMS to ${d.phone}: Dear ${d.name}, ${message || 'We need your help. Please visit us to donate blood. - HEM∆ Kerala'}`); });
        conn = await pool.getConnection();
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'bloodbank', action: 'RECALL', entity: 'Donor', entity_id: bank_id, detail: `Recall sent to ${donors.length} donors [${blood_group || 'all'} ${city || 'all cities'}]`, ip: req.ip });
        conn.release();
        return success(res, { donors_notified: donors.length, donors: donors.map(d => ({ donor_id: d.donor_id, name: d.name, phone: d.phone, blood_group: d.blood_group, city: d.city })), sms_sent: true }, `Recall sent to ${donors.length} eligible donors`);
    } catch (err) { if (conn) conn.release(); next(err); }
}

// ═══ 25. GET STATS ═══
async function getStats(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const [[invR], [donR], [reqR], [payR], [monthlyR], [stockR], [capR]] = await Promise.all([
            pool.execute(`SELECT COALESCE(SUM(available_units),0) AS total_units, COUNT(CASE WHEN available_units/capacity<=0.3 THEN 1 END) AS critical_types, COUNT(CASE WHEN available_units/capacity>0.3 AND available_units/capacity<=0.6 THEN 1 END) AS low_types, COUNT(CASE WHEN available_units/capacity>0.6 THEN 1 END) AS healthy_types FROM Blood_Stock WHERE bank_id=?`, [bank_id]),
            pool.execute(`SELECT COUNT(*) AS total_donations, COALESCE(SUM(quantity_ml),0) AS total_ml, COUNT(DISTINCT donor_id) AS unique_donors FROM Donation_Record WHERE bank_id=?`, [bank_id]),
            pool.execute(`SELECT COUNT(*) AS total_requests, SUM(status='Pending') AS pending, SUM(status='Fulfilled') AS fulfilled FROM Blood_Request WHERE bank_id=?`, [bank_id]),
            pool.execute(`SELECT COALESCE(SUM(amount),0) AS total_revenue, COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS received, COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending FROM Payment WHERE bank_id=?`, [bank_id]),
            pool.execute(`SELECT MONTH(donation_date) AS month, COUNT(*) AS donations, SUM(quantity_ml) AS ml FROM Donation_Record WHERE bank_id=? AND YEAR(donation_date)=YEAR(CURRENT_DATE) GROUP BY MONTH(donation_date)`, [bank_id]),
            pool.execute('SELECT blood_group, available_units, capacity FROM Blood_Stock WHERE bank_id=? ORDER BY blood_group', [bank_id]),
            pool.execute('SELECT storage_capacity FROM Blood_Bank WHERE bank_id=?', [bank_id]),
        ]);
        const inv = invR[0], don = donR[0], rq = reqR[0], pay = payR[0];
        const total_requests = Number(rq.total_requests || 0);
        const fulfilled_requests = Number(rq.fulfilled || 0);
        const pending_requests = Number(rq.pending || 0);

        return success(res, {
            inventory: { total_units: inv.total_units, critical_types: inv.critical_types, low_types: inv.low_types, healthy_types: inv.healthy_types, storage_capacity: capR[0]?.storage_capacity || 0 },
            donations: { total: don.total_donations, total_ml: don.total_ml, unique_donors: don.unique_donors, average_ml: don.total_donations > 0 ? Math.round(don.total_ml / don.total_donations) : 0 },
            requests: { total: total_requests, pending: pending_requests, fulfilled: fulfilled_requests, fulfillment_rate: total_requests > 0 ? Math.round((fulfilled_requests / total_requests) * 1000) / 10 : 0 },
            payments: { total_revenue: pay.total_revenue, received: pay.received, pending: pay.pending },
            monthly_chart: buildMonthlyChart(monthlyR),
            current_stock: stockR,
        });
    } catch (err) { next(err); }
}

// ═══ 26. GET DASHBOARD ═══
async function getDashboard(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const [[bankR], [stockR], [invSumR], [donSumR], [reqSumR], [paySumR], [emergR], [recentDonR], [recentReqR], [recentPayR], [alertsR], [hcSumR]] = await Promise.all([
            pool.execute('SELECT bank_id,bank_name,city,contact_number,operating_hours,status FROM Blood_Bank WHERE bank_id=?', [bank_id]),
            pool.execute(`SELECT bs.*, ROUND(bs.available_units/bs.capacity*100,1) AS percentage, CASE WHEN bs.available_units/bs.capacity>0.6 THEN 'Healthy' WHEN bs.available_units/bs.capacity>0.3 THEN 'Low' ELSE 'Critical' END AS stock_status FROM Blood_Stock bs WHERE bs.bank_id=? ORDER BY blood_group`, [bank_id]),
            pool.execute(`SELECT COALESCE(SUM(available_units),0) AS total_units, COUNT(CASE WHEN available_units/capacity<=0.3 THEN 1 END) AS critical_count FROM Blood_Stock WHERE bank_id=?`, [bank_id]),
            pool.execute(`SELECT COUNT(*) AS total, COALESCE(SUM(quantity_ml),0) AS total_ml, COUNT(DISTINCT donor_id) AS unique_donors FROM Donation_Record WHERE bank_id=?`, [bank_id]),
            pool.execute(`SELECT COUNT(*) AS total, SUM(status='Pending') AS pending, SUM(status='Fulfilled') AS fulfilled FROM Blood_Request WHERE bank_id=?`, [bank_id]),
            pool.execute(`SELECT COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending_amount, COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS received_amount FROM Payment WHERE bank_id=?`, [bank_id]),
            pool.execute(`SELECT br.request_id,br.blood_group,br.units_required,br.status,h.hospital_name,p.name AS patient_name FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Patient p ON p.patient_id=br.patient_id WHERE br.bank_id=? AND br.priority='Emergency' AND br.status IN ('Pending','Processing')`, [bank_id]),
            pool.execute(`SELECT dr.donation_id,dr.donation_date,dr.quantity_ml,dr.blood_group,d.name AS donor_name FROM Donation_Record dr JOIN Donor d ON d.donor_id=dr.donor_id WHERE dr.bank_id=? ORDER BY dr.created_at DESC LIMIT 5`, [bank_id]),
            pool.execute(`SELECT br.request_id,br.blood_group,br.units_required,br.status,br.priority,h.hospital_name,p.name AS patient_name FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Patient p ON p.patient_id=br.patient_id WHERE br.bank_id=? ORDER BY br.created_at DESC LIMIT 5`, [bank_id]),
            pool.execute(`SELECT pay.payment_id,pay.amount,pay.payment_status,pay.payment_date,h.hospital_name FROM Payment pay JOIN Hospital h ON h.hospital_id=pay.hospital_id WHERE pay.bank_id=? ORDER BY pay.created_at DESC LIMIT 5`, [bank_id]),
            pool.execute(`SELECT blood_group,available_units,capacity,ROUND(available_units/capacity*100,1) AS percentage FROM Blood_Stock WHERE bank_id=? AND available_units/capacity<=0.3 ORDER BY available_units/capacity`, [bank_id]),
            pool.execute(`
                SELECT 
                    COUNT(*) AS total,
                    SUM(CASE WHEN eligibility_status = 'Eligible' AND (SELECT last_donation_date FROM Donor WHERE donor_id = hc.donor_id) IS NOT NULL AND DATEDIFF(CURRENT_DATE, (SELECT last_donation_date FROM Donor WHERE donor_id = hc.donor_id)) < ? THEN 0 WHEN eligibility_status = 'Eligible' THEN 1 ELSE 0 END) AS real_eligible,
                    SUM(CASE WHEN eligibility_status = 'Eligible' AND (SELECT last_donation_date FROM Donor WHERE donor_id = hc.donor_id) IS NOT NULL AND DATEDIFF(CURRENT_DATE, (SELECT last_donation_date FROM Donor WHERE donor_id = hc.donor_id)) < ? THEN 1 ELSE 0 END) AS in_cooling
                FROM Health_Check hc 
                WHERE donor_id IN (SELECT DISTINCT donor_id FROM Donation_Record WHERE bank_id=?)`, [parseInt(process.env.COOLING_PERIOD_DAYS) || 90, parseInt(process.env.COOLING_PERIOD_DAYS) || 90, bank_id]),
        ]);
        const rq = reqSumR[0], dn = donSumR[0], py = paySumR[0], hc = hcSumR[0];
        const total_requests = Number(rq.total || 0);
        const pending_requests = Number(rq.pending || 0);
        const fulfilled_requests = Number(rq.fulfilled || 0);

        return success(res, {
            bank: bankR[0] || null,
            inventory: { stock: stockR, total_units: invSumR[0].total_units, critical_count: invSumR[0].critical_count },
            stats: {
                total_donations: dn.total,
                total_ml: dn.total_ml,
                unique_donors: dn.unique_donors,
                total_requests,
                pending_requests,
                fulfilled_requests,
                fulfillment_rate: total_requests > 0 ? Math.round((fulfilled_requests / total_requests) * 1000) / 10 : 0,
                pending_payments: py.pending_amount,
                received_revenue: py.received_amount,
                eligibility_rate: hc.total > 0 ? Math.round((hc.real_eligible / hc.total) * 100) : 0,
                eligible_count: hc.real_eligible,
                cooling_count: hc.in_cooling
            },
            emergency_requests: emergR,
            recent_donations: recentDonR,
            recent_requests: recentReqR,
            recent_payments: recentPayR,
            stock_alerts: alertsR,
        });
    } catch (err) { next(err); }
}

async function getAppointments(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const { status, donor_id, date, blood_group, from_date, to_date } = req.query;
        let where = 'a.bank_id = ?';
        const params = [bank_id];

        if (status) { where += ' AND a.status = ?'; params.push(status); }
        if (donor_id) { where += ' AND a.donor_id = ?'; params.push(donor_id); }
        if (date) { where += ' AND a.appointment_date = ?'; params.push(date); }
        if (blood_group) { where += ' AND d.blood_group = ?'; params.push(blood_group); }
        if (from_date) { where += ' AND a.appointment_date >= ?'; params.push(from_date); }
        if (to_date) { where += ' AND a.appointment_date <= ?'; params.push(to_date); }

        const [rows] = await pool.execute(
            `SELECT a.*, d.name AS donor_name, d.blood_group, d.phone AS donor_phone,
                    (SELECT COUNT(*) FROM Donation_Record dr WHERE dr.donor_id = a.donor_id) AS total_donations
             FROM Appointment a
             JOIN Donor d ON d.donor_id = a.donor_id
             WHERE ${where}
             ORDER BY a.appointment_date ASC`,
            params
        );

        return success(res, rows);
    } catch (err) { next(err); }
}

// ═══ 28. UPDATE APPOINTMENT STATUS ═══
async function updateAppointmentStatus(req, res, next) {
    let conn;
    try {
        const bank_id = req.user.entity_id;
        const appointment_id = req.params.appointment_id;
        const { status } = req.body;

        if (!['Confirmed', 'Fulfilled', 'Cancelled'].includes(status)) {
            return error(res, 'Invalid status', 400);
        }

        const [rows] = await pool.execute('SELECT * FROM Appointment WHERE appointment_id = ? AND bank_id = ?', [appointment_id, bank_id]);
        if (!rows.length) return notFound(res, 'Appointment not found');

        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.execute('UPDATE Appointment SET status = ?, updated_at = NOW() WHERE appointment_id = ?', [status, appointment_id]);

        // Audit Log
        await auditLog(conn, {
            user_id: req.user.user_id,
            role: 'bloodbank',
            action: 'UPDATE_STATUS',
            entity: 'Appointment',
            entity_id: appointment_id,
            detail: `Appointment status updated to ${status}`,
            ip: req.ip
        });

        // Notify donor
        const [donorUser] = await conn.execute('SELECT user_id FROM Users WHERE entity_id = ?', [rows[0].donor_id]);
        if (donorUser.length) {
            await createNotification({
                user_id: donorUser[0].user_id,
                role: 'donor',
                type: 'appointment_update',
                title: 'Appointment Updated',
                message: `Your appointment on ${rows[0].appointment_date} has been ${status.toLowerCase()}.`,
                link: '/donor/schedule',
                priority: status === 'Cancelled' ? 'high' : 'normal'
            });
        }

        await conn.commit();
        conn.release();

        return success(res, { appointment_id, status }, `Appointment ${status.toLowerCase()}`);
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}

// ═══ 29. GET CAMPS ═══
async function getCamps(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const [camps] = await pool.execute(
            `SELECT c.*, (SELECT COUNT(*) FROM Camp_RSVP WHERE camp_id=c.camp_id) AS rsvp_count
             FROM Blood_Camp c WHERE bank_id=? ORDER BY camp_date DESC`, [bank_id]);
        return success(res, camps);
    } catch (err) { next(err); }
}

// ═══ 30. CREATE CAMP ═══
async function createCamp(req, res, next) {
    let conn;
    try {
        const bank_id = req.user.entity_id;
        const { camp_name, location, city, camp_date, start_time, end_time, contact_person = null, contact_number = null, description = null } = req.body || {};
        const m = validate({ camp_name, location, city, camp_date, start_time, end_time }); if (m) return error(res, m, 400);
        const camp_id = generateCampId();
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('INSERT INTO Blood_Camp (camp_id, bank_id, camp_name, location, city, camp_date, start_time, end_time, contact_person, contact_number, description) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [camp_id, bank_id, camp_name, location, city, camp_date, start_time, end_time, contact_person, contact_number, description]);
        await auditLog(conn, { user_id: req.user.user_id, role: 'bloodbank', action: 'CREATED', entity: 'Blood_Camp', entity_id: camp_id, detail: `Camp scheduled: ${camp_name} on ${camp_date}`, ip: req.ip });
        await conn.commit(); conn.release();
        return success(res, { camp_id, camp_name, camp_date }, 'Camp scheduled successfully', 201);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// ═══ 31. UPDATE CAMP ═══
async function updateCamp(req, res, next) {
    try {
        const bank_id = req.user.entity_id, camp_id = req.params.camp_id;
        const [cur] = await pool.execute('SELECT * FROM Blood_Camp WHERE camp_id=? AND bank_id=?', [camp_id, bank_id]);
        if (!cur.length) return notFound(res, 'Camp not found');
        const c = cur[0], body = req.body || {};
        const u = { camp_name: body.camp_name || c.camp_name, location: body.location || c.location, city: body.city || c.city, camp_date: body.camp_date || c.camp_date, start_time: body.start_time || c.start_time, end_time: body.end_time || c.end_time, contact_person: body.contact_person || c.contact_person, contact_number: body.contact_number || c.contact_number, description: body.description || c.description, status: body.status || c.status };
        await pool.execute('UPDATE Blood_Camp SET camp_name=?,location=?,city=?,camp_date=?,start_time=?,end_time=?,contact_person=?,contact_number=?,description=?,status=?,updated_at=NOW() WHERE camp_id=?', [u.camp_name, u.location, u.city, u.camp_date, u.start_time, u.end_time, u.contact_person, u.contact_number, u.description, u.status, camp_id]);
        return success(res, { camp_id, ...u }, 'Camp updated');
    } catch (err) { next(err); }
}

// ═══ 32. DELETE CAMP ═══
async function deleteCamp(req, res, next) {
    try {
        const bank_id = req.user.entity_id, camp_id = req.params.camp_id;
        const [rows] = await pool.execute('DELETE FROM Blood_Camp WHERE camp_id=? AND bank_id=?', [camp_id, bank_id]);
        if (rows.affectedRows === 0) return notFound(res, 'Camp not found');
        return success(res, null, 'Camp deleted');
    } catch (err) { next(err); }
}

// ═══ 33. GET CAMP RSVPs ═══
async function getCampRSVPs(req, res, next) {
    try {
        const bank_id = req.user.entity_id, camp_id = req.params.camp_id;
        const [rows] = await pool.execute(
            `SELECT r.*, d.name AS donor_name, d.blood_group, d.phone AS donor_phone
             FROM Camp_RSVP r JOIN Donor d ON d.donor_id=r.donor_id
             JOIN Blood_Camp c ON c.camp_id=r.camp_id
             WHERE r.camp_id=? AND c.bank_id=?`, [camp_id, bank_id]);
        return success(res, rows);
    } catch (err) { next(err); }
}

// ═══ 34. SEARCH GLOBAL REGISTRY ═══
async function searchGlobalDonors(req, res, next) {
    try {
        const bank_id = req.user.entity_id;
        const { search, phone } = req.query;
        if (!search && !phone) {
            return error(res, 'Please provide search name or phone number', 400);
        }

        let query = `
            SELECT d.*, u.email,
              IF(EXISTS(SELECT 1 FROM blood_bank_donor bbd WHERE bbd.donor_id=d.donor_id AND bbd.bank_id=?), 1, 0) AS is_registered
            FROM Donor d
            LEFT JOIN Users u ON u.entity_id = d.donor_id AND u.role = 'donor'
            WHERE d.is_deleted = 0
        `;
        const params = [bank_id];

        if (phone) {
            query += ' AND d.phone = ?';
            params.push(phone);
        } else if (search) {
            query += ' AND (d.name LIKE ? OR d.phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY d.name ASC LIMIT 50';

        const [rows] = await pool.execute(query, params);
        return success(res, rows);
    } catch (err) { next(err); }
}

// ═══ 35. REGISTER EXISTING GLOBAL DONOR ═══
async function registerExistingDonor(req, res, next) {
    let conn;
    try {
        const bank_id = req.user.entity_id;
        const { donor_id } = req.body;
        if (!donor_id) return error(res, 'donor_id is required', 400);

        // Verify donor exists globally
        const [dRows] = await pool.execute('SELECT name, blood_group FROM Donor WHERE donor_id = ? AND is_deleted = 0', [donor_id]);
        if (dRows.length === 0) return notFound(res, 'Donor not found in global registry');

        const donor = dRows[0];

        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Register donor with this bank
        await conn.execute('INSERT IGNORE INTO blood_bank_donor (bank_id, donor_id) VALUES (?, ?)', [bank_id, donor_id]);

        // Audit log
        await auditLog(conn, {
            user_id: req.user.user_id,
            role: 'bloodbank',
            action: 'CREATED',
            entity: 'blood_bank_donor',
            entity_id: donor_id,
            detail: `Linked existing global donor: ${donor.name} (${donor.blood_group}) to blood bank`,
            ip: req.ip
        });

        await conn.commit();
        conn.release();

        return success(res, { donor_id, name: donor.name, blood_group: donor.blood_group }, 'Donor successfully linked to your blood bank', 201);
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}

module.exports = {
    getProfile, updateProfile, getInventory, updateStock, getDonors, getDonorById,
    createDonor, updateDonor, getHealthChecks, getHealthCheckById, createHealthCheck,
    getDonations, getDonationById, createDonation, getRequests, getRequestById,
    approveRequest, rejectRequest, getIssues, getIssueById, createIssue,
    getPayments, updatePayment, recallDonors, getStats, getDashboard,
    getAppointments, updateAppointmentStatus,
    getCamps, createCamp, updateCamp, deleteCamp, getCampRSVPs,
    searchGlobalDonors, registerExistingDonor
};
