/**
 * ═══════════════════════════════════════════
 * HEM∆ — Hospital Controller (Phase B4)
 * Profile, Patients CRUD, Blood Requests,
 * Issues, Payments, Blood Banks, Stats, Dashboard
 * ═══════════════════════════════════════════
 */

const pool = require('../config/db');
const {
    generatePatientId,
    generateRequestId,
    generatePaymentId,
    generateLogId,
} = require('../utils/generateId');
const { createNotification } = require('../utils/notify');
const { success, error, notFound } = require('../utils/response');
const { buildMonthlyChart } = require('../utils/dateHelpers');

// ─────────────────────────────────────
// HELPER
// ─────────────────────────────────────
const auditLog = async (conn, { user_id, user_name, role, action, entity, entity_id, detail, ip, severity = 'Info' }) => {
    const log_id = generateLogId();
    await conn.execute(
        'INSERT INTO Audit_Log VALUES (?,?,?,?,?,?,?,?,?,?,NOW())',
        [log_id, user_id, user_name, role, action, entity, entity_id, detail, ip, severity]
    );
};

const validate = (fields) => {
    for (const [key, val] of Object.entries(fields)) {
        if (val === undefined || val === null || val === '') return `${key} is required`;
    }
    return null;
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];


// ═══════════════════════════════════════════
// 1. GET PROFILE
// ═══════════════════════════════════════════
async function getProfile(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const [rows] = await pool.execute(
            `SELECT h.*, u.email, u.last_login, u.created_at AS member_since,
         (SELECT COUNT(*) FROM Patient p WHERE p.hospital_id = h.hospital_id AND p.status != 'Discharged') AS active_patients,
         (SELECT COUNT(*) FROM Blood_Request br WHERE br.hospital_id = h.hospital_id) AS total_requests,
         (SELECT COUNT(*) FROM Blood_Request br WHERE br.hospital_id = h.hospital_id AND br.status = 'Fulfilled') AS fulfilled_requests
       FROM Hospital h JOIN Users u ON u.entity_id = h.hospital_id
       WHERE h.hospital_id = ?`,
            [hospital_id]
        );
        if (rows.length === 0) return notFound(res, 'Hospital not found');
        const profile = rows[0];
        profile.fulfillment_rate = profile.total_requests > 0
            ? Math.round((profile.fulfilled_requests / profile.total_requests) * 1000) / 10
            : 0;
        return success(res, profile);
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 2. UPDATE PROFILE
// ═══════════════════════════════════════════
async function updateProfile(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const [current] = await pool.execute('SELECT * FROM Hospital WHERE hospital_id = ?', [hospital_id]);
        if (current.length === 0) return notFound(res, 'Hospital not found');
        const h = current[0];
        const body = req.body || {};
        const updated = {
            hospital_name: body.hospital_name || h.hospital_name,
            city: body.city || h.city,
            contact_number: body.contact_number || h.contact_number,
            beds: body.beds || h.beds,
        };
        await pool.execute(
            'UPDATE Hospital SET hospital_name=?, city=?, contact_number=?, beds=?, updated_at=NOW() WHERE hospital_id=?',
            [updated.hospital_name, updated.city, updated.contact_number, updated.beds, hospital_id]
        );
        return success(res, { hospital_id, ...updated }, 'Profile updated');
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 3. GET PATIENTS
// ═══════════════════════════════════════════
async function getPatients(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const { status, ward, blood_group, search } = req.query;

        let where = 'p.hospital_id = ?';
        const params = [hospital_id];
        if (status) { where += ' AND p.status = ?'; params.push(status); }
        if (ward) { where += ' AND p.ward = ?'; params.push(ward); }
        if (blood_group) { where += ' AND p.blood_group = ?'; params.push(blood_group); }
        if (search) { where += ' AND p.name LIKE ?'; params.push(`%${search}%`); }

        const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM Patient p WHERE ${where}`, params);
        const total = countRows[0].total;

        // Summary counts (all patients, no pagination filter except hospital)
        const [summaryRows] = await pool.execute(
            `SELECT
         SUM(status != 'Discharged') AS total_active,
         SUM(status = 'Critical') AS critical,
         SUM(status = 'Stable') AS stable,
         SUM(status = 'Admitted') AS admitted
       FROM Patient WHERE hospital_id = ?`,
            [hospital_id]
        );

        const [patients] = await pool.execute(
            `SELECT p.*,
         (SELECT COUNT(*) FROM Blood_Request br WHERE br.patient_id = p.patient_id) AS total_requests,
         (SELECT br2.status FROM Blood_Request br2 WHERE br2.patient_id = p.patient_id ORDER BY br2.created_at DESC LIMIT 1) AS latest_request_status
       FROM Patient p
       WHERE ${where}
       ORDER BY CASE p.status WHEN 'Critical' THEN 1 WHEN 'Admitted' THEN 2 WHEN 'Stable' THEN 3 ELSE 4 END, p.admitted_on DESC
       LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        const s = summaryRows[0];
        return success(res, {
            patients,
            summary: {
                total_active: Number(s.total_active || 0),
                critical: Number(s.critical || 0),
                stable: Number(s.stable || 0),
                admitted: Number(s.admitted || 0),
            },
            total, limit, offset,
        });
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 4. GET PATIENT BY ID
// ═══════════════════════════════════════════
async function getPatientById(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const patient_id = req.params.patient_id;

        const [rows] = await pool.execute(
            'SELECT p.* FROM Patient p WHERE p.patient_id = ? AND p.hospital_id = ?',
            [patient_id, hospital_id]
        );
        if (rows.length === 0) return notFound(res, 'Patient not found');

        // Fetch blood requests for this patient
        const [requests] = await pool.execute(
            `SELECT br.request_id, br.blood_group, br.units_required, br.status, br.priority, br.request_date, b.bank_name
       FROM Blood_Request br JOIN Blood_Bank b ON b.bank_id = br.bank_id
       WHERE br.patient_id = ?
       ORDER BY br.created_at DESC`,
            [patient_id]
        );

        const patient = rows[0];
        patient.blood_requests = requests;
        return success(res, patient);
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 5. CREATE PATIENT
// ═══════════════════════════════════════════
async function createPatient(req, res, next) {
    let conn;
    try {
        const { name, age, gender, blood_group, ward, admitted_on, status } = req.body || {};
        const missing = validate({ name, age, gender, blood_group });
        if (missing) return error(res, missing, 400);
        if (age < 1 || age > 120) return error(res, 'Age must be between 1 and 120', 400);
        if (!['Male', 'Female', 'Other'].includes(gender)) return error(res, 'Invalid gender', 400);
        if (!BLOOD_GROUPS.includes(blood_group)) return error(res, 'Invalid blood group', 400);

        const hospital_id = req.user.entity_id;
        const patient_id = generatePatientId();
        const patientStatus = status || 'Admitted';

        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.execute(
            `INSERT INTO Patient (patient_id, hospital_id, name, age, gender, blood_group, ward, admitted_on, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ${admitted_on ? '?' : 'CURRENT_DATE'}, ?, NOW())`,
            admitted_on
                ? [patient_id, hospital_id, name, age, gender, blood_group, ward || null, admitted_on, patientStatus]
                : [patient_id, hospital_id, name, age, gender, blood_group, ward || null, patientStatus]
        );

        await auditLog(conn, {
            user_id: req.user.user_id, user_name: null, role: 'hospital',
            action: 'CREATED', entity: 'Patient', entity_id: patient_id,
            detail: `Patient added: ${name}, ${blood_group}, ${ward || 'N/A'}`, ip: req.ip,
        });

        await conn.commit();
        conn.release();

        return success(res, {
            patient_id, hospital_id, name, blood_group, ward: ward || null, status: patientStatus,
        }, 'Patient added successfully', 201);
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 6. UPDATE PATIENT
// ═══════════════════════════════════════════
async function updatePatient(req, res, next) {
    let conn;
    try {
        const hospital_id = req.user.entity_id;
        const patient_id = req.params.patient_id;

        const [current] = await pool.execute(
            'SELECT * FROM Patient WHERE patient_id = ? AND hospital_id = ?',
            [patient_id, hospital_id]
        );
        if (current.length === 0) return notFound(res, 'Patient not found');
        const p = current[0];
        const body = req.body || {};

        const updated = {
            name: body.name || p.name,
            age: body.age || p.age,
            gender: body.gender || p.gender,
            blood_group: body.blood_group || p.blood_group,
            ward: body.ward !== undefined ? body.ward : p.ward,
            status: body.status || p.status,
        };

        if (body.gender && !['Male', 'Female', 'Other'].includes(body.gender)) return error(res, 'Invalid gender', 400);
        if (body.blood_group && !BLOOD_GROUPS.includes(body.blood_group)) return error(res, 'Invalid blood group', 400);

        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.execute(
            'UPDATE Patient SET name=?, age=?, gender=?, blood_group=?, ward=?, status=? WHERE patient_id=? AND hospital_id=?',
            [updated.name, updated.age, updated.gender, updated.blood_group, updated.ward, updated.status, patient_id, hospital_id]
        );

        await auditLog(conn, {
            user_id: req.user.user_id, user_name: null, role: 'hospital',
            action: 'UPDATED', entity: 'Patient', entity_id: patient_id,
            detail: `Patient status → ${updated.status}`, ip: req.ip,
        });

        await conn.commit();
        conn.release();

        return success(res, { patient_id, ...updated }, 'Patient updated');
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 7. DELETE PATIENT
// ═══════════════════════════════════════════
async function deletePatient(req, res, next) {
    let conn;
    try {
        const hospital_id = req.user.entity_id;
        const patient_id = req.params.patient_id;

        const [rows] = await pool.execute(
            'SELECT * FROM Patient WHERE patient_id = ? AND hospital_id = ?',
            [patient_id, hospital_id]
        );
        if (rows.length === 0) return notFound(res, 'Patient not found');

        // Check for active requests
        const [active] = await pool.execute(
            "SELECT COUNT(*) AS cnt FROM Blood_Request WHERE patient_id = ? AND status IN ('Pending','Processing')",
            [patient_id]
        );
        if (active[0].cnt > 0) {
            return error(res, 'Cannot delete patient with active blood requests. Cancel requests first.', 409);
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.execute('DELETE FROM Patient WHERE patient_id = ? AND hospital_id = ?', [patient_id, hospital_id]);

        await auditLog(conn, {
            user_id: req.user.user_id, user_name: null, role: 'hospital',
            action: 'DELETED', entity: 'Patient', entity_id: patient_id,
            detail: `Patient deleted: ${rows[0].name}`, ip: req.ip, severity: 'Warning',
        });

        await conn.commit();
        conn.release();

        return success(res, { message: 'Patient removed' });
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 8. GET REQUESTS
// ═══════════════════════════════════════════
async function getRequests(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const { status, priority, blood_group } = req.query;

        let where = 'br.hospital_id = ?';
        const params = [hospital_id];
        if (status) { where += ' AND br.status = ?'; params.push(status); }
        if (priority) { where += ' AND br.priority = ?'; params.push(priority); }
        if (blood_group) { where += ' AND br.blood_group = ?'; params.push(blood_group); }

        const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM Blood_Request br WHERE ${where}`, params);
        const total = countRows[0].total;

        // Summary
        const [summaryRows] = await pool.execute(
            `SELECT COUNT(*) AS total,
         SUM(status='Pending') AS pending, SUM(status='Processing') AS processing,
         SUM(status='Fulfilled') AS fulfilled, SUM(status='Cancelled') AS cancelled
       FROM Blood_Request WHERE hospital_id = ?`,
            [hospital_id]
        );
        const s = summaryRows[0];
        const pending = Number(s.pending || 0);
        const processing = Number(s.processing || 0);
        const fulfilled = Number(s.fulfilled || 0);
        const cancelled = Number(s.cancelled || 0);
        const sTotal = Number(s.total || 0);
        
        const fulfillment_rate = sTotal > 0 ? Math.round((fulfilled / sTotal) * 1000) / 10 : 0;

        const [requests] = await pool.execute(
            `SELECT br.*, p.name AS patient_name, p.age AS patient_age, p.ward AS patient_ward,
         b.bank_name, b.city AS bank_city, b.contact_number AS bank_phone,
         bi.issue_id, bi.issue_date, bi.units_issued,
         pay.payment_id, pay.amount, pay.payment_status
       FROM Blood_Request br
       JOIN Patient p ON p.patient_id = br.patient_id
       JOIN Blood_Bank b ON b.bank_id = br.bank_id
       LEFT JOIN Blood_Issue bi ON bi.request_id = br.request_id
       LEFT JOIN Payment pay ON pay.request_id = br.request_id
       WHERE ${where}
       ORDER BY CASE br.priority WHEN 'Emergency' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, br.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        return success(res, {
            requests,
            summary: {
                total: sTotal, pending, processing,
                fulfilled, cancelled, fulfillment_rate,
            },
            total, limit, offset,
        });
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 9. GET REQUEST BY ID
// ═══════════════════════════════════════════
async function getRequestById(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const request_id = req.params.request_id;

        const [rows] = await pool.execute(
            `SELECT br.*, p.name AS patient_name, p.age AS patient_age, p.ward AS patient_ward, p.blood_group AS patient_blood_group,
         b.bank_name, b.city AS bank_city, b.contact_number AS bank_phone,
         bi.issue_id, bi.issue_date, bi.units_issued, bi.notes AS issue_notes,
         pay.payment_id, pay.amount, pay.payment_status, pay.payment_date
       FROM Blood_Request br
       JOIN Patient p ON p.patient_id = br.patient_id
       JOIN Blood_Bank b ON b.bank_id = br.bank_id
       LEFT JOIN Blood_Issue bi ON bi.request_id = br.request_id
       LEFT JOIN Payment pay ON pay.request_id = br.request_id
       WHERE br.request_id = ? AND br.hospital_id = ?`,
            [request_id, hospital_id]
        );
        if (rows.length === 0) return notFound(res, 'Request not found');

        const r = rows[0];
        // Build timeline
        r.timeline = [
            { step: 'Requested', done: true, date: r.request_date },
            { step: 'Processing', done: r.status !== 'Pending' && r.status !== 'Cancelled', date: null },
            { step: 'Fulfilled', done: r.status === 'Fulfilled', date: r.issue_date || null },
        ];

        return success(res, r);
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 10. CREATE REQUEST
// ═══════════════════════════════════════════
async function createRequest(req, res, next) {
    let conn;
    try {
        const { patient_id, bank_id, blood_group, units_required, priority, notes } = req.body || {};
        const reqPriority = priority || 'Routine';

        const missing = validate({ patient_id, bank_id, blood_group, units_required });
        if (missing) return error(res, missing, 400);
        if (!BLOOD_GROUPS.includes(blood_group)) return error(res, 'Invalid blood group', 400);

        // Increase limit for emergency requests
        const maxUnits = reqPriority === 'Emergency' ? 50 : 20;
        if (units_required < 1 || units_required > maxUnits) {
            return error(res, `Units must be between 1 and ${maxUnits} ${reqPriority === 'Emergency' ? '(Emergency limit)' : ''}`, 400);
        }

        const hospital_id = req.user.entity_id;

        // Verify patient belongs to this hospital
        const [patientRows] = await pool.execute(
            'SELECT patient_id, name FROM Patient WHERE patient_id = ? AND hospital_id = ?',
            [patient_id, hospital_id]
        );
        if (patientRows.length === 0) return error(res, 'Patient not found in your hospital', 403);

        // Verify bank is active
        const [bankRows] = await pool.execute(
            "SELECT bank_id, bank_name FROM Blood_Bank WHERE bank_id = ? AND status = 'Active'",
            [bank_id]
        );
        if (bankRows.length === 0) return notFound(res, 'Blood bank not found or inactive');
        const bank_name = bankRows[0].bank_name;

        // Check stock (warning only, don't block)
        const [stockRows] = await pool.execute(
            'SELECT available_units FROM Blood_Stock WHERE bank_id = ? AND blood_group = ?',
            [bank_id, blood_group]
        );
        const available = stockRows.length > 0 ? stockRows[0].available_units : 0;
        const stock_warning = available < units_required
            ? 'Low stock — bank may partially fulfil'
            : null;

        // Check no duplicate active request (Allow emergency to override or coexist with non-urgent)
        const [dupRows] = await pool.execute(
            "SELECT request_id, priority FROM Blood_Request WHERE patient_id = ? AND blood_group = ? AND status IN ('Pending','Processing')",
            [patient_id, blood_group]
        );
        
        if (dupRows.length > 0) {
            const hasEmergency = dupRows.some(r => r.priority === 'Emergency');
            // Block only if there's already an active Emergency request, or if this is a routine request and something already exists
            if (hasEmergency || (reqPriority !== 'Emergency')) {
                return error(res, `An active ${hasEmergency ? 'Emergency ' : ''}request already exists for this patient and group`, 409);
            }
            // If we are here, we are creating an Emergency request and there's only non-emergency ones. Allow it.
        }

        const request_id = generateRequestId();
        const payment_id = generatePaymentId();
        const amount = units_required * 500;

        conn = await pool.getConnection();
        await conn.beginTransaction();

        // INSERT Blood_Request
        await conn.execute(
            `INSERT INTO Blood_Request (request_id, hospital_id, patient_id, bank_id, blood_group, units_required, request_date, status, priority, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE, 'Pending', ?, ?, NOW(), NOW())`,
            [request_id, hospital_id, patient_id, bank_id, blood_group, units_required, reqPriority, notes || null]
        );

        // Auto-create pending Payment
        await conn.execute(
            `INSERT INTO Payment (payment_id, hospital_id, bank_id, request_id, amount, payment_date, payment_status, created_at)
       VALUES (?, ?, ?, ?, ?, NULL, 'Pending', NOW())`,
            [payment_id, hospital_id, bank_id, request_id, amount]
        );

        await auditLog(conn, {
            user_id: req.user.user_id, user_name: null, role: 'hospital',
            action: 'CREATED', entity: 'Blood_Request', entity_id: request_id,
            detail: `Request ${reqPriority}: ${units_required}U ${blood_group} from ${bank_name}`,
            ip: req.ip, severity: reqPriority === 'Emergency' ? 'Warning' : 'Info',
        });
        
        const [uR] = await conn.execute('SELECT user_id FROM Users WHERE entity_id=?', [bank_id]);
        if (uR.length) {
            await createNotification({
                user_id: uR[0].user_id, role: 'bloodbank',
                type: reqPriority === 'Emergency' ? 'emergency_request_received' : 'new_request_received',
                title: reqPriority === 'Emergency' ? 'EMERGENCY REQUEST' : 'New Routine Request',
                message: `You have received a request for ${units_required}U ${blood_group} from a registered hospital.`,
                link: '/bloodbank/requests',
                priority: reqPriority === 'Emergency' ? 'critical' : 'normal'
            });
        }

        await conn.commit();
        conn.release();

        return success(res, {
            request_id, status: 'Pending', priority: reqPriority, blood_group,
            units_required, bank_name, payment_id, amount, stock_warning,
        }, 'Blood request submitted', 201);
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 11. CANCEL REQUEST
// ═══════════════════════════════════════════
async function cancelRequest(req, res, next) {
    let conn;
    try {
        const hospital_id = req.user.entity_id;
        const request_id = req.params.request_id;

        const [rows] = await pool.execute(
            'SELECT * FROM Blood_Request WHERE request_id = ? AND hospital_id = ?',
            [request_id, hospital_id]
        );
        if (rows.length === 0) return notFound(res, 'Request not found');

        const r = rows[0];
        if (r.status !== 'Pending') {
            return error(res, `Only Pending requests can be cancelled. Current status: ${r.status}`, 400);
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.execute(
            "UPDATE Blood_Request SET status = 'Cancelled', updated_at = NOW() WHERE request_id = ?",
            [request_id]
        );

        // Delete pending payment
        await conn.execute(
            "DELETE FROM Payment WHERE request_id = ? AND payment_status = 'Pending'",
            [request_id]
        );

        await auditLog(conn, {
            user_id: req.user.user_id, user_name: null, role: 'hospital',
            action: 'CANCELLED', entity: 'Blood_Request', entity_id: request_id,
            detail: `Request cancelled: ${r.blood_group} ${r.units_required}U`, ip: req.ip, severity: 'Warning',
        });

        await conn.commit();
        conn.release();

        return success(res, { message: 'Request cancelled' });
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 12. GET ISSUES
// ═══════════════════════════════════════════
async function getIssues(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;

        const [issues] = await pool.execute(
            `SELECT bi.*, br.blood_group, br.units_required, br.priority,
         p.name AS patient_name, p.ward AS patient_ward,
         b.bank_name, b.city AS bank_city, b.contact_number
       FROM Blood_Issue bi
       JOIN Blood_Request br ON br.request_id = bi.request_id
       JOIN Patient p ON p.patient_id = br.patient_id
       JOIN Blood_Bank b ON b.bank_id = br.bank_id
       WHERE br.hospital_id = ?
       ORDER BY bi.issue_date DESC`,
            [hospital_id]
        );

        return success(res, { issues, total: issues.length });
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 13. GET ISSUE BY ID
// ═══════════════════════════════════════════
async function getIssueById(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const issue_id = req.params.issue_id;

        const [rows] = await pool.execute(
            `SELECT bi.*, br.blood_group, br.units_required, br.priority, br.request_date,
         p.name AS patient_name, p.ward AS patient_ward, p.age AS patient_age,
         b.bank_name, b.city AS bank_city, b.contact_number
       FROM Blood_Issue bi
       JOIN Blood_Request br ON br.request_id = bi.request_id
       JOIN Patient p ON p.patient_id = br.patient_id
       JOIN Blood_Bank b ON b.bank_id = br.bank_id
       WHERE bi.issue_id = ? AND br.hospital_id = ?`,
            [issue_id, hospital_id]
        );
        if (rows.length === 0) return notFound(res, 'Issue not found');
        return success(res, rows[0]);
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 14. GET PAYMENTS
// ═══════════════════════════════════════════
async function getPayments(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const { status } = req.query;

        let where = 'pay.hospital_id = ?';
        const params = [hospital_id];
        if (status) { where += ' AND pay.payment_status = ?'; params.push(status); }

        const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM Payment pay WHERE ${where}`, params);
        const total = countRows[0].total;

        // Summary
        const [summaryRows] = await pool.execute(
            `SELECT COUNT(*) AS total,
         COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS total_paid,
         COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS total_pending,
         COALESCE(SUM(amount),0) AS total_amount
       FROM Payment WHERE hospital_id = ?`,
            [hospital_id]
        );

        const [payments] = await pool.execute(
            `SELECT pay.*, b.bank_name, b.city AS bank_city, b.contact_number,
         br.blood_group, br.units_required, br.priority,
         p.name AS patient_name
       FROM Payment pay
       JOIN Blood_Bank b ON b.bank_id = pay.bank_id
       JOIN Blood_Request br ON br.request_id = pay.request_id
       JOIN Patient p ON p.patient_id = br.patient_id
       WHERE ${where}
       ORDER BY pay.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        const s = summaryRows[0];
        return success(res, {
            payments,
            summary: {
                total: Number(s.total || 0),
                total_paid: Number(s.total_paid || 0),
                total_pending: Number(s.total_pending || 0),
                total_amount: Number(s.total_amount || 0),
            },
            total, limit, offset,
        });
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 15. GET PAYMENT BY ID
// ═══════════════════════════════════════════
async function getPaymentById(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const payment_id = req.params.payment_id;

        const [rows] = await pool.execute(
            `SELECT pay.*, b.bank_name, b.city AS bank_city, b.contact_number,
         br.blood_group, br.units_required, br.priority, br.request_date,
         p.name AS patient_name, p.ward AS patient_ward
       FROM Payment pay
       JOIN Blood_Bank b ON b.bank_id = pay.bank_id
       JOIN Blood_Request br ON br.request_id = pay.request_id
       JOIN Patient p ON p.patient_id = br.patient_id
       WHERE pay.payment_id = ? AND pay.hospital_id = ?`,
            [payment_id, hospital_id]
        );
        if (rows.length === 0) return notFound(res, 'Payment not found');
        return success(res, rows[0]);
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 16. PAY NOW
// ═══════════════════════════════════════════
async function payNow(req, res, next) {
    let conn;
    try {
        const hospital_id = req.user.entity_id;
        const payment_id = req.params.payment_id;

        const [rows] = await pool.execute(
            'SELECT pay.*, b.bank_name FROM Payment pay JOIN Blood_Bank b ON b.bank_id = pay.bank_id WHERE pay.payment_id = ? AND pay.hospital_id = ?',
            [payment_id, hospital_id]
        );
        if (rows.length === 0) return notFound(res, 'Payment not found');

        const pay = rows[0];
        if (pay.payment_status === 'Paid') return error(res, 'Payment already completed', 400);

        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.execute(
            "UPDATE Payment SET payment_status = 'Paid', payment_date = CURRENT_DATE WHERE payment_id = ?",
            [payment_id]
        );

        await auditLog(conn, {
            user_id: req.user.user_id, user_name: null, role: 'hospital',
            action: 'PAID', entity: 'Payment', entity_id: payment_id,
            detail: `Payment of ₹${pay.amount} to ${pay.bank_name} marked Paid`, ip: req.ip,
        });

        await conn.commit();
        conn.release();

        // Notify Blood Bank
        const [u] = await pool.execute("SELECT user_id FROM Users WHERE entity_id=? AND role='bloodbank'", [pay.bank_id]);
        if (u.length) {
            await createNotification({
                user_id: u[0].user_id,
                role: 'bloodbank',
                type: 'payment_received',
                title: 'Payment Received',
                message: `Hospital "${req.user.name || 'A Hospital'}" has paid ₹${pay.amount} for request ${pay.request_id}.`,
                link: '/bloodbank/payments',
                priority: 'normal'
            });
        }

        const today = new Date().toISOString().split('T')[0];
        return success(res, {
            payment_id, payment_status: 'Paid', payment_date: today, amount: pay.amount,
        }, 'Payment marked as paid');
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 17. GET BLOOD BANKS (hospital view)
// ═══════════════════════════════════════════
async function getBloodBanks(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;
        const { city } = req.query;

        let where = "b.status = 'Active'";
        const params = [];
        if (city) { where += ' AND b.city = ?'; params.push(city); }

        const [banks] = await pool.execute(
            `SELECT b.bank_id, b.bank_name, b.city, b.contact_number, b.operating_hours, b.storage_capacity,
         (SELECT COALESCE(SUM(available_units),0) FROM Blood_Stock bs WHERE bs.bank_id = b.bank_id) AS total_units
       FROM Blood_Bank b WHERE ${where} ORDER BY b.bank_name`,
            params
        );

        // Add has_requested flag + stock for each bank
        const banksWithDetails = await Promise.all(
            banks.map(async (bank) => {
                const [reqCount] = await pool.execute(
                    'SELECT COUNT(*) AS cnt FROM Blood_Request WHERE hospital_id = ? AND bank_id = ?',
                    [hospital_id, bank.bank_id]
                );
                const [stockRows] = await pool.execute(
                    'SELECT blood_group, available_units, capacity FROM Blood_Stock WHERE bank_id = ? ORDER BY blood_group',
                    [bank.bank_id]
                );
                const stock = {};
                stockRows.forEach((r) => { stock[r.blood_group] = r.available_units; });
                return { ...bank, has_requested: reqCount[0].cnt > 0, stock };
            })
        );

        return success(res, { banks: banksWithDetails, total: banksWithDetails.length });
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 18. GET BANK STOCK (hospital view)
// ═══════════════════════════════════════════
async function getBankStock(req, res, next) {
    try {
        const bank_id = req.params.bank_id;

        const [bankRows] = await pool.execute(
            "SELECT bank_id, bank_name, city, contact_number FROM Blood_Bank WHERE bank_id = ? AND status = 'Active'",
            [bank_id]
        );
        if (bankRows.length === 0) return notFound(res, 'Blood bank not found or not active');

        const [stockRows] = await pool.execute(
            `SELECT stock_id, blood_group, available_units, capacity, last_updated,
         ROUND(available_units/capacity*100, 1) AS percentage,
         CASE WHEN available_units/capacity > 0.6 THEN 'Healthy' WHEN available_units/capacity > 0.3 THEN 'Low' ELSE 'Critical' END AS stock_status
       FROM Blood_Stock WHERE bank_id = ? ORDER BY blood_group`,
            [bank_id]
        );

        const total_units = stockRows.reduce((sum, r) => sum + r.available_units, 0);
        return success(res, {
            bank: bankRows[0], stock: stockRows, total_units,
            last_updated: stockRows.length > 0 ? stockRows[0].last_updated : null,
        });
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 19. GET STATS
// ═══════════════════════════════════════════
async function getStats(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;

        const [[patientStats], [requestStats], [paymentStats], [monthlyRaw], [bloodGroupDemand]] = await Promise.all([
            pool.execute(
                `SELECT COUNT(*) AS total_patients,
           SUM(status='Critical') AS critical, SUM(status='Stable') AS stable,
           SUM(status='Admitted') AS admitted, SUM(status='Discharged') AS discharged
         FROM Patient WHERE hospital_id = ?`,
                [hospital_id]
            ),
            pool.execute(
                `SELECT COUNT(*) AS total,
           SUM(status='Pending') AS pending, SUM(status='Processing') AS processing,
           SUM(status='Fulfilled') AS fulfilled, SUM(status='Cancelled') AS cancelled
         FROM Blood_Request WHERE hospital_id = ?`,
                [hospital_id]
            ),
            pool.execute(
                `SELECT COALESCE(SUM(amount),0) AS total_amount,
           COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS paid,
           COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending
         FROM Payment WHERE hospital_id = ?`,
                [hospital_id]
            ),
            pool.execute(
                `SELECT MONTH(request_date) AS month, COUNT(*) AS requests, SUM(status='Fulfilled') AS fulfilled
         FROM Blood_Request WHERE hospital_id = ? AND YEAR(request_date) = YEAR(CURRENT_DATE)
         GROUP BY MONTH(request_date)`,
                [hospital_id]
            ),
            pool.execute(
                `SELECT blood_group, COUNT(*) AS units_requested FROM Blood_Request WHERE hospital_id = ?
         GROUP BY blood_group ORDER BY units_requested DESC`,
                [hospital_id]
            ),
        ]);

        const p = patientStats[0];
        const r = requestStats[0];
        const pay = paymentStats[0];

        // Build monthly trend (12 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthMap = {};
        monthlyRaw.forEach((row) => { monthMap[row.month] = { requests: row.requests, fulfilled: row.fulfilled || 0 }; });
        const monthly_trend = months.map((m, i) => ({
            month: m,
            requests: monthMap[i + 1]?.requests || 0,
            fulfilled: monthMap[i + 1]?.fulfilled || 0,
        }));

        return success(res, {
            patients: { total: p.total_patients || 0, critical: p.critical || 0, stable: p.stable || 0, admitted: p.admitted || 0, discharged: p.discharged || 0 },
            requests: { total: r.total || 0, pending: r.pending || 0, processing: r.processing || 0, fulfilled: r.fulfilled || 0, cancelled: r.cancelled || 0, fulfillment_rate: r.total > 0 ? Math.round((r.fulfilled / r.total) * 1000) / 10 : 0 },
            payments: { total_amount: pay.total_amount, paid: pay.paid, pending: pay.pending },
            monthly_trend,
            blood_group_demand: bloodGroupDemand,
        });
    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 20. GET DASHBOARD
// ═══════════════════════════════════════════
async function getDashboard(req, res, next) {
    try {
        const hospital_id = req.user.entity_id;

        const [
            [hospitalRows],
            [patientStats],
            [requestStats],
            [payStats],
            [activePatients],
            [recentRequests],
            [recentPayments],
            [emergencyRequests],
            [topBanks],
        ] = await Promise.all([
            // 1. Hospital profile
            pool.execute(
                'SELECT hospital_id, hospital_name, city, contact_number, beds, status FROM Hospital WHERE hospital_id = ?',
                [hospital_id]
            ),
            // 2. Patient KPIs
            pool.execute(
                `SELECT COUNT(*) AS total, SUM(status='Critical') AS critical,
           SUM(status != 'Discharged') AS active
         FROM Patient WHERE hospital_id = ?`,
                [hospital_id]
            ),
            // 3. Request KPIs
            pool.execute(
                `SELECT COUNT(*) AS total, SUM(status='Pending') AS pending,
           SUM(status='Fulfilled') AS fulfilled
         FROM Blood_Request WHERE hospital_id = ?`,
                [hospital_id]
            ),
            // 4. Payment KPIs
            pool.execute(
                `SELECT COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending_amount
         FROM Payment WHERE hospital_id = ?`,
                [hospital_id]
            ),
            // 5. Active patients (top 5)
            pool.execute(
                `SELECT * FROM Patient WHERE hospital_id = ? AND status != 'Discharged'
         ORDER BY CASE status WHEN 'Critical' THEN 1 ELSE 2 END LIMIT 5`,
                [hospital_id]
            ),
            // 6. Recent requests (top 5)
            pool.execute(
                `SELECT br.request_id, br.blood_group, br.units_required, br.status, br.priority, br.request_date,
           p.name AS patient_name, b.bank_name
         FROM Blood_Request br
         JOIN Patient p ON p.patient_id = br.patient_id
         JOIN Blood_Bank b ON b.bank_id = br.bank_id
         WHERE br.hospital_id = ?
         ORDER BY br.created_at DESC LIMIT 5`,
                [hospital_id]
            ),
            // 7. Recent payments (top 5)
            pool.execute(
                `SELECT pay.payment_id, pay.amount, pay.payment_status, pay.payment_date, b.bank_name
         FROM Payment pay JOIN Blood_Bank b ON b.bank_id = pay.bank_id
         WHERE pay.hospital_id = ?
         ORDER BY pay.created_at DESC LIMIT 5`,
                [hospital_id]
            ),
            // 8. Active emergency requests
            pool.execute(
                `SELECT br.request_id, br.blood_group, br.units_required, br.status, p.name AS patient_name, b.bank_name
         FROM Blood_Request br
         JOIN Patient p ON p.patient_id = br.patient_id
         JOIN Blood_Bank b ON b.bank_id = br.bank_id
         WHERE br.hospital_id = ? AND br.priority = 'Emergency' AND br.status IN ('Pending','Processing')`,
                [hospital_id]
            ),
            // 9. Top connected banks
            pool.execute(
                `SELECT br.bank_id, b.bank_name, b.city, COUNT(*) AS request_count
         FROM Blood_Request br JOIN Blood_Bank b ON b.bank_id = br.bank_id
         WHERE br.hospital_id = ?
         GROUP BY br.bank_id, b.bank_name, b.city
         ORDER BY request_count DESC LIMIT 3`,
                [hospital_id]
            ),
        ]);

        // Fetch stock for top banks
        const connectedBanks = await Promise.all(
            topBanks.map(async (tb) => {
                const [stockRows] = await pool.execute(
                    'SELECT blood_group, available_units FROM Blood_Stock WHERE bank_id = ? ORDER BY blood_group',
                    [tb.bank_id]
                );
                const stock = {};
                stockRows.forEach((r) => { stock[r.blood_group] = r.available_units; });
                return { ...tb, stock };
            })
        );

        const pStat = patientStats[0];
        const rStat = requestStats[0];

        const total_requests = Number(rStat.total || 0);
        const pending_requests = Number(rStat.pending || 0);
        const fulfilled_requests = Number(rStat.fulfilled || 0);

        return success(res, {
            hospital: hospitalRows[0] || null,
            stats: {
                active_patients: Number(pStat.active || 0),
                critical_patients: Number(pStat.critical || 0),
                total_requests,
                pending_requests,
                fulfilled_requests,
                fulfillment_rate: total_requests > 0 ? Math.round((fulfilled_requests / total_requests) * 1000) / 10 : 0,
                pending_payments: payStats[0].pending_amount,
            },
            active_patients: activePatients,
            recent_requests: recentRequests,
            recent_payments: recentPayments,
            emergency_requests: emergencyRequests,
            connected_banks: connectedBanks,
        });
    } catch (err) { next(err); }
}


module.exports = {
    getProfile, updateProfile,
    getPatients, getPatientById, createPatient, updatePatient, deletePatient,
    getRequests, getRequestById, createRequest, cancelRequest,
    getIssues, getIssueById,
    getPayments, getPaymentById, payNow,
    getBloodBanks, getBankStock,
    getStats, getDashboard,
};
