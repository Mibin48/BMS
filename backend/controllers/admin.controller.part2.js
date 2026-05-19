const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateUserId, generateLogId } = require('../utils/generateId');
const { success, error, notFound } = require('../utils/response');

const auditLog = async (conn, o) => { const id = generateLogId(); await conn.execute('INSERT INTO Audit_Log VALUES (?,?,?,?,?,?,?,?,?,?,NOW())', [id, o.user_id, o.user_name, o.role, o.action, o.entity, o.entity_id, o.detail, o.ip, o.severity || 'Info']); };

// 23. getAllDonations
async function getAllDonations(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { blood_group, bank_id, donor_id, year, search } = req.query; let w = '1=1'; const p = [];
        if (blood_group) { w += ' AND dr.blood_group=?'; p.push(blood_group); } 
        if (bank_id) { w += ' AND dr.bank_id=?'; p.push(bank_id); }
        if (donor_id) { w += ' AND dr.donor_id=?'; p.push(donor_id); } 
        if (year) { w += ' AND YEAR(dr.donation_date)=?'; p.push(parseInt(year)); }
        if (search) { w += ' AND (d.name LIKE ? OR b.bank_name LIKE ? OR dr.donation_id LIKE ?)'; p.push(`%${search}%`, `%${search}%`, `%${search}%`); }

        const qBase = ` FROM Donation_Record dr JOIN Donor d ON d.donor_id=dr.donor_id JOIN Blood_Bank b ON b.bank_id=dr.bank_id LEFT JOIN Health_Check hc ON hc.check_id=dr.check_id WHERE ${w}`;
        
        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t, COALESCE(SUM(dr.quantity_ml),0) AS ml, COUNT(DISTINCT dr.donor_id) AS ud, COUNT(DISTINCT dr.bank_id) AS ub ${qBase}`, p);
        const [rows] = await pool.execute(`SELECT dr.*, d.name AS donor_name, d.city AS donor_city, d.gender AS donor_gender, d.age AS donor_age, b.bank_name, b.city AS bank_city, hc.hemoglobin, hc.weight, hc.eligibility_status ${qBase} ORDER BY dr.donation_date DESC LIMIT ${lim} OFFSET ${off}`, p);
        
        const s = cnt[0]; 
        return success(res, { 
            donations: rows, 
            summary: { 
                total: Number(s.t) || 0, 
                total_ml: Number(s.ml) || 0, 
                unique_donors: Number(s.ud) || 0, 
                unique_banks: Number(s.ub) || 0 
            }, 
            total: Number(s.t) || 0, 
            limit: lim, 
            offset: off 
        });
    } catch (err) { next(err); }
}

// 24. getDonationById
async function getDonationById(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT dr.*,d.name AS donor_name,d.city AS donor_city,d.blood_group AS donor_blood_group,b.bank_name,b.city AS bank_city,hc.check_date,hc.weight,hc.hemoglobin,hc.blood_pressure,hc.eligibility_status FROM Donation_Record dr JOIN Donor d ON d.donor_id=dr.donor_id JOIN Blood_Bank b ON b.bank_id=dr.bank_id JOIN Health_Check hc ON hc.check_id=dr.check_id WHERE dr.donation_id=?', [req.params.donation_id]);
        if (!rows.length) return notFound(res, 'Donation not found'); return success(res, rows[0]);
    } catch (err) { next(err); }
}

// 25. getAllHealthChecks
async function getAllHealthChecks(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { status: result, donor_id, search } = req.query; 
        let w = '1=1'; const p = [];
        if (result) { w += ' AND hc.eligibility_status=?'; p.push(result); } 
        if (donor_id) { w += ' AND hc.donor_id=?'; p.push(donor_id); }
        if (search) { w += ' AND (d.name LIKE ? OR u.email LIKE ? OR b.bank_name LIKE ? OR hc.check_id LIKE ?)'; p.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }

        const qBase = ` FROM Health_Check hc JOIN Donor d ON d.donor_id=hc.donor_id LEFT JOIN Users u ON u.entity_id=d.donor_id AND u.role='donor' LEFT JOIN Donation_Record dr ON dr.check_id=hc.check_id LEFT JOIN Blood_Bank b ON b.bank_id=dr.bank_id WHERE ${w}`;
        
        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t, SUM(hc.eligibility_status='Eligible') AS e, SUM(hc.eligibility_status='Deferred') AS d ${qBase}`, p);
        const [rows] = await pool.execute(`SELECT hc.*, d.name AS donor_name, u.email AS donor_email, d.blood_group AS donor_blood_group, d.city AS donor_city, dr.donation_id, dr.quantity_ml, b.bank_name ${qBase} ORDER BY hc.check_date DESC LIMIT ${lim} OFFSET ${off}`, p);
        
        const s = cnt[0];
        return success(res, { 
            health_checks: rows, 
            summary: { 
                total: Number(s.t) || 0, 
                eligible: Number(s.e) || 0, 
                deferred: Number(s.d) || 0 
            }, 
            total: Number(s.t), 
            limit: lim, 
            offset: off 
        });
    } catch (err) { next(err); }
}

// 26. getHealthCheckById
async function getHealthCheckById(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT hc.*,d.name AS donor_name,d.blood_group,d.city,dr.donation_id,dr.quantity_ml,b.bank_name FROM Health_Check hc JOIN Donor d ON d.donor_id=hc.donor_id LEFT JOIN Donation_Record dr ON dr.check_id=hc.check_id LEFT JOIN Blood_Bank b ON b.bank_id=dr.bank_id WHERE hc.check_id=?', [req.params.check_id]);
        if (!rows.length) return notFound(res, 'Health check not found'); return success(res, rows[0]);
    } catch (err) { next(err); }
}

// 27. getAllIssues
async function getAllIssues(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { blood_group, bank_id, hospital_id, search } = req.query; 
        let w = '1=1'; const p = [];
        if (blood_group) { w += ' AND br.blood_group=?'; p.push(blood_group); } 
        if (bank_id) { w += ' AND br.bank_id=?'; p.push(bank_id); }
        if (hospital_id) { w += ' AND br.hospital_id=?'; p.push(hospital_id); }
        if (search) { w += ' AND (h.hospital_name LIKE ? OR b.bank_name LIKE ? OR bi.issue_id LIKE ? OR br.request_id LIKE ?)'; p.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }

        const qBase = ` FROM Blood_Issue bi JOIN Blood_Request br ON br.request_id=bi.request_id JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Blood_Bank b ON b.bank_id=br.bank_id JOIN Patient p ON p.patient_id=br.patient_id LEFT JOIN Payment pay ON pay.request_id=br.request_id WHERE ${w}`;
        
        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t, COALESCE(SUM(bi.units_issued),0) AS tu ${qBase}`, p);
        const [rows] = await pool.execute(`SELECT bi.*, br.blood_group, br.units_required, br.priority, h.hospital_name, h.city AS hospital_city, b.bank_name, b.city AS bank_city, p.name AS patient_name, pay.amount, pay.payment_status ${qBase} ORDER BY bi.issue_date DESC LIMIT ${lim} OFFSET ${off}`, p);
        
        const s = cnt[0];
        return success(res, { 
            issues: rows, 
            summary: { 
                total: Number(s.t) || 0, 
                total_units_issued: Number(s.tu) || 0 
            }, 
            total: Number(s.t), 
            limit: lim, 
            offset: off 
        });
    } catch (err) { next(err); }
}

// 28. getIssueById
async function getIssueById(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT bi.*,br.blood_group,br.units_required,br.priority,br.request_date,h.hospital_name,b.bank_name,p.name AS patient_name,pay.payment_id,pay.amount,pay.payment_status FROM Blood_Issue bi JOIN Blood_Request br ON br.request_id=bi.request_id JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Blood_Bank b ON b.bank_id=br.bank_id JOIN Patient p ON p.patient_id=br.patient_id LEFT JOIN Payment pay ON pay.request_id=br.request_id WHERE bi.issue_id=?', [req.params.issue_id]);
        if (!rows.length) return notFound(res, 'Issue not found'); return success(res, rows[0]);
    } catch (err) { next(err); }
}

// 28a. updateIssueStatus
async function updateIssueStatus(req, res, next) {
    let conn; try {
        const id = req.params.issue_id; const { status: st } = req.body || {};
        const valid = ['Requested', 'Verified', 'Approved', 'Dispatched', 'Delivered'];
        if (!st || !valid.includes(st)) return error(res, `status must be one of: ${valid.join(', ')}`, 400);
        const [rows] = await pool.execute('SELECT * FROM Blood_Issue WHERE issue_id=?', [id]);
        if (!rows.length) return notFound(res, 'Issue not found');
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('UPDATE Blood_Issue SET status=? WHERE issue_id=?', [st, id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'UPDATED', entity: 'Blood_Issue', entity_id: id, detail: `Admin updated delivery status → ${st}`, ip: req.ip });
        await conn.commit(); conn.release();
        return success(res, { issue_id: id, status: st }, 'Delivery status updated');
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 29. getAllPayments
async function getAllPayments(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { status, hospital_id, bank_id, search } = req.query; 
        let w = '1=1'; const p = [];
        if (status) { w += ' AND pay.payment_status=?'; p.push(status); } 
        if (hospital_id) { w += ' AND pay.hospital_id=?'; p.push(hospital_id); }
        if (bank_id) { w += ' AND pay.bank_id=?'; p.push(bank_id); }
        if (search) { w += ' AND (h.hospital_name LIKE ? OR b.bank_name LIKE ? OR pay.payment_id LIKE ? OR pay.request_id LIKE ?)'; p.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }

        const qBase = ` FROM Payment pay JOIN Hospital h ON h.hospital_id=pay.hospital_id JOIN Blood_Bank b ON b.bank_id=pay.bank_id JOIN Blood_Request br ON br.request_id=pay.request_id JOIN Patient p ON p.patient_id=br.patient_id WHERE ${w}`;
        
        const [sumCount] = await pool.execute(`SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS total_amount, COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS paid, COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending ${qBase}`, p);
        const [rows] = await pool.execute(`SELECT pay.*, h.hospital_name, b.bank_name, br.blood_group, br.units_required, br.priority, p.name AS patient_name ${qBase} ORDER BY pay.created_at DESC LIMIT ${lim} OFFSET ${off}`, p);
        
        const s = sumCount[0]; 
        return success(res, { 
            payments: rows, 
            summary: { 
                total: Number(s.total) || 0, 
                total_amount: Number(s.total_amount) || 0, 
                paid_amount: Number(s.paid) || 0, 
                pending_amount: Number(s.pending) || 0 
            }, 
            total: Number(s.total), 
            limit: lim, 
            offset: off 
        });
    } catch (err) { next(err); }
}

// 30. getPaymentById
async function getPaymentById(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT pay.*,h.hospital_name,b.bank_name,br.blood_group,br.units_required,p.name AS patient_name FROM Payment pay JOIN Hospital h ON h.hospital_id=pay.hospital_id JOIN Blood_Bank b ON b.bank_id=pay.bank_id JOIN Blood_Request br ON br.request_id=pay.request_id JOIN Patient p ON p.patient_id=br.patient_id WHERE pay.payment_id=?', [req.params.payment_id]);
        if (!rows.length) return notFound(res, 'Payment not found'); return success(res, rows[0]);
    } catch (err) { next(err); }
}

// 31. updatePaymentStatus
async function updatePaymentStatus(req, res, next) {
    let conn; try {
        const id = req.params.payment_id; const { status: st } = req.body || {};
        if (!st || !['Paid', 'Pending', 'Overdue'].includes(st)) return error(res, "status must be 'Paid','Pending', or 'Overdue'", 400);
        const [rows] = await pool.execute('SELECT * FROM Payment WHERE payment_id=?', [id]);
        if (!rows.length) return notFound(res, 'Payment not found');
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute(`UPDATE Payment SET payment_status=?,payment_date=${st === 'Paid' ? 'CURRENT_DATE' : 'NULL'} WHERE payment_id=?`, [st, id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'UPDATED', entity: 'Payment', entity_id: id, detail: `Admin overrode payment status → ${st}`, ip: req.ip, severity: 'Warning' });
        await conn.commit(); conn.release();
        return success(res, { payment_id: id, payment_status: st }, 'Payment status updated');
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 32. getUsers
async function getUsers(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { role, is_active, search, sort = 'created_desc' } = req.query; let w = '1=1'; const p = [];
        if (role) { w += ' AND u.role=?'; p.push(role); } if (is_active !== undefined) { w += ' AND u.is_active=?'; p.push(is_active === 'true' ? 1 : 0); }
        if (search) { w += " AND (u.email LIKE ? OR COALESCE(d.name,h.hospital_name,b.bank_name,'Admin') LIKE ?)"; p.push(`%${search}%`, `%${search}%`); }

        let orderBy = 'u.created_at DESC';
        if (sort === 'created_asc') orderBy = 'u.created_at ASC';
        if (sort === 'name_asc') orderBy = 'display_name ASC';
        if (sort === 'name_desc') orderBy = 'display_name DESC';
        if (sort === 'role_asc') orderBy = 'u.role ASC';
        if (sort === 'role_desc') orderBy = 'u.role DESC';

        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t FROM Users u LEFT JOIN Donor d ON d.donor_id=u.entity_id AND u.role='donor' LEFT JOIN Hospital h ON h.hospital_id=u.entity_id AND u.role='hospital' LEFT JOIN Blood_Bank b ON b.bank_id=u.entity_id AND u.role='bloodbank' WHERE ${w}`, p);

        const [sumQuery] = await pool.execute(`
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN DATE(last_login) = CURRENT_DATE THEN 1 ELSE 0 END) AS active_today,
                SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) AS super_admins,
                SUM(CASE WHEN is_approved=0 THEN 1 ELSE 0 END) AS pending_invites,
                SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) AS role_admin,
                SUM(CASE WHEN role='donor' THEN 1 ELSE 0 END) AS role_donor,
                SUM(CASE WHEN role='hospital' THEN 1 ELSE 0 END) AS role_hospital,
                SUM(CASE WHEN role='bloodbank' THEN 1 ELSE 0 END) AS role_bloodbank
            FROM Users
        `);

        const [[entCounts]] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM Donor) AS total_donors,
                (SELECT COUNT(*) FROM Hospital) AS total_hospitals,
                (SELECT COUNT(*) FROM Blood_Bank) AS total_banks
        `);

        const s = sumQuery[0];
        const summary = {
            total_accounts: Number(s.total) || 0,
            active_today: Number(s.active_today) || 0,
            super_admins: Number(s.super_admins) || 0,
            pending_invites: Number(s.pending_invites) || 0,
            role_distribution: [
                { role: 'admin', count: Number(s.role_admin) || 0 },
                { role: 'donor', count: Number(s.role_donor) || 0 },
                { role: 'hospital', count: Number(s.role_hospital) || 0 },
                { role: 'bloodbank', count: Number(s.role_bloodbank) || 0 }
            ],
            system_scale: {
                donors: Number(entCounts.total_donors) || 0,
                hospitals: Number(entCounts.total_hospitals) || 0,
                banks: Number(entCounts.total_banks) || 0
            }
        };

        const [rows] = await pool.execute(`
            SELECT 
                u.user_id, u.email, u.phone, u.role, u.entity_id, u.is_active, u.is_approved, u.created_at, u.last_login,
                CASE u.role 
                    WHEN 'donor' THEN d.name 
                    WHEN 'hospital' THEN h.hospital_name 
                    WHEN 'bloodbank' THEN b.bank_name 
                    ELSE 'Admin' 
                END AS display_name,
                CASE u.role 
                    WHEN 'donor' THEN d.name 
                    WHEN 'hospital' THEN h.hospital_name 
                    WHEN 'bloodbank' THEN b.bank_name 
                    ELSE 'Global System' 
                END AS entity_name,
                CASE u.role 
                    WHEN 'donor' THEN d.city 
                    WHEN 'hospital' THEN h.city 
                    WHEN 'bloodbank' THEN b.city 
                    ELSE 'Kerala' 
                END AS city,
                d.blood_group, d.age, d.gender,
                h.hospital_id AS hosp_reg, b.license_number AS bank_reg,
                h.contact_number AS hosp_contact, b.contact_number AS bank_contact
            FROM Users u 
            LEFT JOIN Donor d ON d.donor_id=u.entity_id AND u.role='donor' 
            LEFT JOIN Hospital h ON h.hospital_id=u.entity_id AND u.role='hospital' 
            LEFT JOIN Blood_Bank b ON b.bank_id=u.entity_id AND u.role='bloodbank' 
            WHERE ${w} 
            ORDER BY ${orderBy} 
            LIMIT ${lim} 
            OFFSET ${off}
        `, p);
        return success(res, { users: rows, summary, total: cnt[0].t, limit: lim, offset: off });
    } catch (err) { next(err); }
}

// 33. getUserById
async function getUserById(req, res, next) {
    try {
        const [rows] = await pool.execute("SELECT u.user_id,u.email,u.phone,u.role,u.entity_id,u.is_active,u.is_approved,u.created_at,u.last_login,CASE u.role WHEN 'donor' THEN d.name WHEN 'hospital' THEN h.hospital_name WHEN 'bloodbank' THEN b.bank_name ELSE 'Admin' END AS display_name FROM Users u LEFT JOIN Donor d ON d.donor_id=u.entity_id AND u.role='donor' LEFT JOIN Hospital h ON h.hospital_id=u.entity_id AND u.role='hospital' LEFT JOIN Blood_Bank b ON b.bank_id=u.entity_id AND u.role='bloodbank' WHERE u.user_id=?", [req.params.user_id]);
        if (!rows.length) return notFound(res, 'User not found'); return success(res, rows[0]);
    } catch (err) { next(err); }
}

// 34. createAdmin
async function createAdmin(req, res, next) {
    let conn; try {
        const { email, phone, password } = req.body || {};
        if (!email || !password) return error(res, 'email and password required', 400);
        const [dup] = await pool.execute('SELECT user_id FROM Users WHERE email=?', [email]);
        if (dup.length) return error(res, 'Email already in use', 409);
        const hash = await bcrypt.hash(password, 10); const user_id = generateUserId();
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('INSERT INTO Users VALUES (?,?,?,?,?,NULL,TRUE,TRUE,NULL,NULL,NOW(),NULL)', [user_id, email, hash, phone || null, 'admin']);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'CREATED', entity: 'Users', entity_id: user_id, detail: `Admin account created: ${email}`, ip: req.ip, severity: 'Warning' });
        await conn.commit(); conn.release();
        return success(res, { user_id, email, role: 'admin' }, 'Admin account created', 201);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 35. inviteUser
async function inviteUser(req, res, next) {
    let conn; try {
        const { email, role: r, entity_id } = req.body || {};
        if (!email || !r || !entity_id) return error(res, 'email, role, and entity_id required', 400);
        if (!['hospital', 'bloodbank'].includes(r)) return error(res, "role must be 'hospital' or 'bloodbank'", 400);
        const [dup] = await pool.execute('SELECT user_id FROM Users WHERE email=?', [email]);
        if (dup.length) return error(res, 'Email already in use', 409);
        if (r === 'hospital') { const [e] = await pool.execute('SELECT hospital_id FROM Hospital WHERE hospital_id=?', [entity_id]); if (!e.length) return notFound(res, 'Hospital not found'); }
        else { const [e] = await pool.execute('SELECT bank_id FROM Blood_Bank WHERE bank_id=?', [entity_id]); if (!e.length) return notFound(res, 'Blood bank not found'); }
        const temp = Math.random().toString(36).substring(2, 10).toUpperCase();
        const hash = await bcrypt.hash(temp, 10); const user_id = generateUserId();
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('INSERT INTO Users VALUES (?,?,?,NULL,?,?,TRUE,TRUE,NULL,NULL,NOW(),NULL)', [user_id, email, hash, r, entity_id]);
        console.log(`📧 Invite to ${email}: Your HEM∆ account is ready. Temp password: ${temp}`);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'INVITED', entity: 'Users', entity_id: user_id, detail: `User invited: ${email} as ${r}`, ip: req.ip });
        await conn.commit(); conn.release();
        return success(res, { user_id, email, role: r, temp_password: temp }, 'User invited. Credentials logged.', 201);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 36. suspendUser
async function suspendUser(req, res, next) {
    let conn; try {
        const uid = req.params.user_id;
        if (uid === req.user.user_id) return error(res, 'Cannot suspend your own account', 400);
        const [rows] = await pool.execute('SELECT * FROM Users WHERE user_id=?', [uid]);
        if (!rows.length) return notFound(res, 'User not found');
        const u = rows[0];
        if (u.role === 'admin') { const [ac] = await pool.execute("SELECT COUNT(*) AS c FROM Users WHERE role='admin' AND is_active=TRUE"); if (ac[0].c <= 1) return error(res, 'Cannot suspend last admin', 400); }
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('UPDATE Users SET is_active=FALSE WHERE user_id=?', [uid]);
        if (u.role === 'hospital') await conn.execute("UPDATE Hospital SET status='Suspended' WHERE hospital_id=?", [u.entity_id]);
        if (u.role === 'bloodbank') await conn.execute("UPDATE Blood_Bank SET status='Suspended' WHERE bank_id=?", [u.entity_id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'SUSPENDED', entity: 'Users', entity_id: uid, detail: `User suspended: ${u.email}`, ip: req.ip, severity: 'Warning' });
        await conn.commit(); conn.release();
        return success(res, { message: 'User suspended' });
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 37. activateUser
async function activateUser(req, res, next) {
    let conn; try {
        const uid = req.params.user_id;
        const [rows] = await pool.execute('SELECT * FROM Users WHERE user_id=?', [uid]);
        if (!rows.length) return notFound(res, 'User not found');
        const u = rows[0];
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('UPDATE Users SET is_active=TRUE,is_approved=TRUE WHERE user_id=?', [uid]);
        if (u.role === 'hospital') await conn.execute("UPDATE Hospital SET status='Active' WHERE hospital_id=?", [u.entity_id]);
        if (u.role === 'bloodbank') await conn.execute("UPDATE Blood_Bank SET status='Active' WHERE bank_id=?", [u.entity_id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'ACTIVATED', entity: 'Users', entity_id: uid, detail: `User activated: ${u.email}`, ip: req.ip });
        await conn.commit(); conn.release();
        return success(res, { message: 'User activated' });
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 38. deleteUser
async function deleteUser(req, res, next) {
    let conn; try {
        const uid = req.params.user_id;
        if (uid === req.user.user_id) return error(res, 'Cannot delete your own account', 400);
        const [rows] = await pool.execute('SELECT * FROM Users WHERE user_id=?', [uid]);
        if (!rows.length) return notFound(res, 'User not found');
        if (rows[0].role === 'admin') return error(res, 'Admin accounts cannot be deleted. Use suspend instead.', 400);
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('DELETE FROM Users WHERE user_id=?', [uid]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'DELETED', entity: 'Users', entity_id: uid, detail: `User deleted: ${rows[0].email}`, ip: req.ip, severity: 'Warning' });
        await conn.commit(); conn.release();
        return success(res, { message: 'User account deleted' });
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 39. getAuditLogs
async function getAuditLogs(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { severity, action, entity, user_id, date_from, date_to, search } = req.query; let w = '1=1'; const p = [];
        if (severity) { w += ' AND severity=?'; p.push(severity); } if (action) { w += ' AND action=?'; p.push(action); }
        if (entity) { w += ' AND entity=?'; p.push(entity); } if (user_id) { w += ' AND user_id=?'; p.push(user_id); }
        if (date_from) { w += ' AND created_at>=?'; p.push(date_from); } if (date_to) { w += ' AND created_at<=?'; p.push(date_to + ' 23:59:59'); }
        if (search) { w += ' AND detail LIKE ?'; p.push(`%${search}%`); }
        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t,SUM(severity='Info') AS info_count,SUM(severity='Warning') AS warning_count,SUM(severity='Critical') AS critical_count FROM Audit_Log WHERE ${w}`, p);
        const [rows] = await pool.execute(`SELECT * FROM Audit_Log WHERE ${w} ORDER BY created_at DESC LIMIT ${lim} OFFSET ${off}`, p);
        const s = cnt[0]; return success(res, { logs: rows, summary: { total: s.t || 0, info_count: s.info_count || 0, warning_count: s.warning_count || 0, critical_count: s.critical_count || 0 }, total: s.t || 0, limit: lim, offset: off });
    } catch (err) { next(err); }
}

// 40. getAuditLogById
async function getAuditLogById(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT * FROM Audit_Log WHERE log_id=?', [req.params.log_id]);
        if (!rows.length) return notFound(res, 'Audit log not found'); return success(res, rows[0]);
    } catch (err) { next(err); }
}

// 41. generateReport
async function generateReport(req, res, next) {
    let conn; try {
        const { report_type, from_date, to_date } = req.body || {};
        if (!report_type) return error(res, 'report_type is required', 400);
        let data = {};
        if (report_type === 'naco_monthly' || report_type === 'annual_summary') {
            const [dons] = await pool.execute('SELECT blood_group,COUNT(*) AS count,SUM(quantity_ml) AS ml FROM Donation_Record WHERE donation_date BETWEEN ? AND ? GROUP BY blood_group', [from_date || '2020-01-01', to_date || '2099-12-31']);
            const [stk] = await pool.execute('SELECT bs.blood_group,SUM(available_units) AS units FROM Blood_Stock bs GROUP BY bs.blood_group');
            const [hcs] = await pool.execute("SELECT eligibility_status,COUNT(*) AS count FROM Health_Check WHERE check_date BETWEEN ? AND ? GROUP BY eligibility_status", [from_date || '2020-01-01', to_date || '2099-12-31']);
            data = { donations_by_group: dons, stock_levels: stk, health_checks: hcs };
        }
        if (report_type === 'district_stock') {
            const [rows] = await pool.execute("SELECT bb.city,bs.blood_group,SUM(available_units) AS units FROM Blood_Stock bs JOIN Blood_Bank bb ON bb.bank_id=bs.bank_id WHERE bb.status='Active' GROUP BY bb.city,bs.blood_group ORDER BY bb.city");
            data = { district_stock: rows };
        }
        if (report_type === 'donor_activity') {
            const [newD] = await pool.execute('SELECT COUNT(*) AS c FROM Donor WHERE created_at BETWEEN ? AND ?', [from_date || '2020-01-01', to_date || '2099-12-31']);
            const [topD] = await pool.execute('SELECT d.name,d.blood_group,COUNT(*) AS donations FROM Donation_Record dr JOIN Donor d ON d.donor_id=dr.donor_id WHERE dr.donation_date BETWEEN ? AND ? GROUP BY dr.donor_id,d.name,d.blood_group ORDER BY donations DESC LIMIT 10', [from_date || '2020-01-01', to_date || '2099-12-31']);
            const [bgDist] = await pool.execute('SELECT blood_group,COUNT(*) AS count FROM Donor GROUP BY blood_group');
            data = { new_donors: newD[0].c, top_donors: topD, blood_group_distribution: bgDist };
        }
        if (report_type === 'hospital_requests') {
            const [byH] = await pool.execute("SELECT h.hospital_name,COUNT(*) AS requests,SUM(br.status='Fulfilled') AS fulfilled FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id WHERE br.request_date BETWEEN ? AND ? GROUP BY br.hospital_id,h.hospital_name ORDER BY requests DESC", [from_date || '2020-01-01', to_date || '2099-12-31']);
            data = { by_hospital: byH };
        }
        if (report_type === 'revenue') {
            const [byH] = await pool.execute("SELECT h.hospital_name,SUM(amount) AS total,SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END) AS paid FROM Payment p JOIN Hospital h ON h.hospital_id=p.hospital_id GROUP BY p.hospital_id,h.hospital_name ORDER BY total DESC");
            const [byB] = await pool.execute("SELECT b.bank_name,SUM(amount) AS total,SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END) AS received FROM Payment p JOIN Blood_Bank b ON b.bank_id=p.bank_id GROUP BY p.bank_id,b.bank_name ORDER BY total DESC");
            data = { by_hospital: byH, by_bank: byB };
        }
        const report_id = `RPT-${Date.now()}`;
        conn = await pool.getConnection();
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'GENERATED', entity: 'Report', entity_id: report_id, detail: `Report: ${report_type} ${from_date || 'all'} to ${to_date || 'all'}`, ip: req.ip });
        conn.release();
        return success(res, { report_id, report_type, from_date, to_date, generated_at: new Date(), generated_by: req.user.user_id, data }, 'Report generated', 201);
    } catch (err) { if (conn) conn.release(); next(err); }
}

// 42. getReportHistory
async function getReportHistory(req, res, next) {
    try {
        const [rows] = await pool.execute("SELECT * FROM Audit_Log WHERE action='GENERATED' AND entity='Report' ORDER BY created_at DESC LIMIT 20");
        return success(res, { reports: rows, total: rows.length });
    } catch (err) { next(err); }
}


// 43. getSettings
async function getSettings(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT `key`, `value` FROM System_Settings');
        return success(res, { settings: rows });
    } catch (err) { next(err); }
}

// 44. updateSettings
async function updateSettings(req, res, next) {
    let conn; try {
        const settings = req.body || {};
        conn = await pool.getConnection();
        await conn.beginTransaction();

        for (const [key, value] of Object.entries(settings)) {
            await conn.execute(
                'INSERT INTO System_Settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value`=? ',
                [key, String(value), String(value)]
            );
        }

        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'UPDATED', entity: 'Settings', entity_id: 'system', detail: 'System settings synchronized', ip: req.ip, severity: 'Warning' });
        await conn.commit();
        conn.release();
        return success(res, settings, 'Configuration synchronized successfully');
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}

// 45. getDashboard
async function getDashboard(req, res, next) {
    try {
        const [[ent], [bld], [req2], [don], [pay], [pendH], [pendB], [emerg], [recReq], [recPay], [alerts], [logs]] = await Promise.all([
            pool.execute("SELECT (SELECT COUNT(*) FROM Donor WHERE is_deleted=0) AS donors,(SELECT COUNT(*) FROM Hospital WHERE status='Active') AS hospitals,(SELECT COUNT(*) FROM Blood_Bank WHERE status='Active') AS banks"),
            pool.execute("SELECT COALESCE(SUM(available_units),0) AS total_units FROM Blood_Stock"),
            pool.execute("SELECT COUNT(*) AS total,SUM(status='Fulfilled') AS fulfilled,SUM(status='Pending') AS pending FROM Blood_Request"),
            pool.execute("SELECT COUNT(*) AS total,COALESCE(SUM(quantity_ml),0) AS ml FROM Donation_Record"),
            pool.execute("SELECT COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending FROM Payment"),
            pool.execute("SELECT h.hospital_id AS id,'Hospital' AS type,h.hospital_name AS name,h.city,u.email,u.created_at AS submitted FROM Hospital h JOIN Users u ON u.entity_id=h.hospital_id WHERE h.status='Pending'"),
            pool.execute("SELECT b.bank_id AS id,'Blood_Bank' AS type,b.bank_name AS name,b.city,u.email,u.created_at AS submitted FROM Blood_Bank b JOIN Users u ON u.entity_id=b.bank_id WHERE b.status='Pending'"),
            pool.execute("SELECT br.request_id,br.blood_group,br.units_required,br.status,h.hospital_name,b.bank_name,p.name AS patient_name FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Blood_Bank b ON b.bank_id=br.bank_id JOIN Patient p ON p.patient_id=br.patient_id WHERE br.priority='Emergency' AND br.status IN ('Pending','Processing')"),
            pool.execute("SELECT br.request_id,br.blood_group,br.units_required,br.status,br.priority,h.hospital_name,b.bank_name FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Blood_Bank b ON b.bank_id=br.bank_id ORDER BY br.created_at DESC LIMIT 5"),
            pool.execute("SELECT pay.payment_id,pay.amount,pay.payment_status,h.hospital_name,b.bank_name FROM Payment pay JOIN Hospital h ON h.hospital_id=pay.hospital_id JOIN Blood_Bank b ON b.bank_id=pay.bank_id ORDER BY pay.created_at DESC LIMIT 5"),
            pool.execute("SELECT bs.blood_group,bb.bank_name,bs.available_units,bs.capacity FROM Blood_Stock bs JOIN Blood_Bank bb ON bb.bank_id=bs.bank_id WHERE bs.available_units/bs.capacity<=0.15 ORDER BY bs.available_units/bs.capacity"),
            pool.execute("SELECT * FROM Audit_Log WHERE severity IN ('Warning','Critical') ORDER BY created_at DESC LIMIT 5")
        ]);
        const E = ent[0], R = req2[0], D = don[0], P = pay[0], B = bld[0];
        return success(res, { 
            stats: { 
                donors: Number(E.donors) || 0, 
                hospitals: Number(E.hospitals) || 0, 
                blood_banks: Number(E.banks) || 0, 
                total_units: Number(B.total_units) || 0, 
                total_requests: Number(R.total) || 0, 
                pending_requests: Number(R.pending) || 0, 
                fulfilled_requests: Number(R.fulfilled) || 0, 
                fulfillment_rate: R.total > 0 ? Math.round((Number(R.fulfilled) || 0) / Number(R.total) * 1000) / 10 : 0, 
                total_donations: Number(D.total) || 0, 
                total_ml: Number(D.ml) || 0, 
                pending_payments: Number(P.pending) || 0 
            }, 
            pending_approvals: [...pendH, ...pendB], 
            active_emergencies: emerg, 
            recent_requests: recReq, 
            recent_payments: recPay, 
            critical_stock: alerts, 
            recent_alerts: logs 
        });
    } catch (err) { next(err); }
}

async function updateInventoryStock(req, res, next) {
    let conn;
    try {
        const { bank_id, stock_id } = req.params;
        const { action: act, units, notes, blood_group: body_bg } = req.body || {};

        if (!act || !['add', 'remove'].includes(act)) return error(res, "action must be 'add' or 'remove'", 400);
        if (!units || units < 1) return error(res, 'units must be greater than 0', 400);

        const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        let targetGroup = body_bg;

        // If stock_id is a blood group, we are doing a group-based update (upsert)
        if (BLOOD_GROUPS.includes(stock_id)) targetGroup = stock_id;

        conn = await pool.getConnection();
        await conn.beginTransaction();

        let stockRecord;
        if (targetGroup && (!stock_id || !stock_id.startsWith('STK-'))) {
            const [rows] = await conn.execute('SELECT * FROM Blood_Stock WHERE bank_id=? AND blood_group=?', [bank_id, targetGroup]);
            if (rows.length > 0) stockRecord = rows[0];
            else {
                // Initializing new group for this bank
                const newId = `STK-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                await conn.execute(
                    'INSERT INTO Blood_Stock (stock_id, bank_id, blood_group, available_units, capacity, last_updated) VALUES (?,?,?,0,50,NOW())',
                    [newId, bank_id, targetGroup]
                );
                const [n] = await conn.execute('SELECT * FROM Blood_Stock WHERE stock_id=?', [newId]);
                stockRecord = n[0];
            }
        } else {
            const [rows] = await conn.execute('SELECT * FROM Blood_Stock WHERE stock_id=? AND bank_id=?', [stock_id, bank_id]);
            if (rows.length === 0) return notFound(res, 'Stock record not found');
            stockRecord = rows[0];
        }

        const currentUnits = Number(stockRecord.available_units);
        const newUnits = act === 'add' ? currentUnits + Number(units) : currentUnits - Number(units);

        if (newUnits < 0) return error(res, 'Insufficient stock for removal', 400);
        if (newUnits > (stockRecord.capacity || 1000)) return error(res, 'Update exceeds storage capacity', 400);

        await conn.execute(
            'UPDATE Blood_Stock SET available_units=?, last_updated=NOW() WHERE stock_id=?',
            [newUnits, stockRecord.stock_id]
        );

        // Audit Log
        const [[u]] = await conn.execute('SELECT name FROM Users WHERE user_id=?', [req.user.user_id]);
        await auditLog(conn, {
            user_id: req.user.user_id,
            user_name: u?.name || 'Admin',
            role: 'admin',
            action: 'Inventory Correction',
            entity: 'Blood_Stock',
            entity_id: stockRecord.stock_id,
            detail: `Admin manually ${act === 'add' ? 'added' : 'removed'} ${units} units of ${stockRecord.blood_group} for Bank ${bank_id}. Reason: ${notes || 'Administrative adjustment'}`,
            severity: 'Warning'
        });

        await conn.commit();
        return success(res, { message: 'Stock updated successfully', new_units: newUnits, blood_group: stockRecord.blood_group });

    } catch (err) {
        if (conn) await conn.rollback();
        next(err);
    } finally {
        if (conn) conn.release();
    }
}

module.exports = { getAllDonations, getDonationById, getAllHealthChecks, getHealthCheckById, getAllIssues, updateIssueStatus, getIssueById, getAllPayments, getPaymentById, updatePaymentStatus, getUsers, getUserById, createAdmin, inviteUser, suspendUser, activateUser, deleteUser, getAuditLogs, getAuditLogById, generateReport, getReportHistory, getSettings, updateSettings, getDashboard, updateInventoryStock };
