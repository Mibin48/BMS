const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateUserId, generateLogId } = require('../utils/generateId');
const { success, error, unauthorized, notFound } = require('../utils/response');
const { createNotification } = require('../utils/notify');
const { buildMonthlyChart } = require('../utils/dateHelpers');
const { calcEligibility } = require('../utils/eligibility');

const auditLog = async (conn, o) => { const id = generateLogId(); await conn.execute('INSERT INTO Audit_Log VALUES (?,?,?,?,?,?,?,?,?,?,NOW())', [id, o.user_id, o.user_name, o.role, o.action, o.entity, o.entity_id, o.detail, o.ip, o.severity || 'Info']); };
const DISTRICTS = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];

// 1. getStats
async function getStats(req, res, next) {
    try {
        const [[e], [b], [r], [d], [p], [u]] = await Promise.all([
            pool.execute(`SELECT (SELECT COUNT(*) FROM Donor) AS total_donors, (SELECT COUNT(*) FROM Hospital WHERE status='Active') AS total_hospitals, (SELECT COUNT(*) FROM Blood_Bank WHERE status='Active') AS total_blood_banks, (SELECT COUNT(*) FROM Hospital WHERE status='Pending')+(SELECT COUNT(*) FROM Blood_Bank WHERE status='Pending') AS pending_approvals`),
            pool.execute(`SELECT COALESCE(SUM(available_units),0) AS total_units, COALESCE(SUM(capacity),0) AS total_capacity FROM Blood_Stock`),
            pool.execute(`SELECT COUNT(*) AS total_requests, SUM(status='Fulfilled') AS fulfilled, SUM(status='Pending') AS pending, SUM(priority='Emergency' AND status IN ('Pending','Processing')) AS active_emergencies FROM Blood_Request`),
            pool.execute(`SELECT COUNT(*) AS total_donations, COALESCE(SUM(quantity_ml),0) AS total_ml FROM Donation_Record`),
            pool.execute(`SELECT COALESCE(SUM(amount),0) AS total_revenue, COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS paid, COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending FROM Payment`),
            pool.execute(`SELECT COUNT(*) AS total_users, SUM(is_active=1) AS active_users, SUM(role='donor') AS donors, SUM(role='hospital') AS hospital_admins, SUM(role='bloodbank') AS bank_admins, SUM(role='admin') AS admins FROM Users`)
        ]);
        const E = e[0], B = b[0], R = r[0], D = d[0], P = p[0], U = u[0];
        
        // Coerce stats to numbers
        const rTotal = Number(R.total_requests || 0);
        const rFulfilled = Number(R.fulfilled || 0);
        
        return success(res, { 
            entities: {
                total_donors: Number(E.total_donors || 0),
                total_hospitals: Number(E.total_hospitals || 0),
                total_blood_banks: Number(E.total_blood_banks || 0),
                pending_approvals: Number(E.pending_approvals || 0)
            }, 
            blood: { 
                ...B, 
                total_units: Number(B.total_units || 0),
                total_capacity: Number(B.total_capacity || 0),
                avg_stock_level: B.total_capacity > 0 ? Math.round(B.total_units / B.total_capacity * 1000) / 10 : 0 
            }, 
            requests: { 
                ...R, 
                total_requests: rTotal,
                fulfilled: rFulfilled,
                pending: Number(R.pending || 0),
                active_emergencies: Number(R.active_emergencies || 0),
                fulfillment_rate: rTotal > 0 ? Math.round(rFulfilled / rTotal * 1000) / 10 : 0 
            }, 
            donations: { 
                ...D, 
                total_donations: Number(D.total_donations || 0),
                total_ml: Number(D.total_ml || 0),
                total_litres: (Number(D.total_ml || 0) / 1000).toFixed(2) 
            }, 
            payments: {
                total_revenue: Number(P.total_revenue || 0),
                paid: Number(P.paid || 0),
                pending: Number(P.pending || 0)
            }, 
            users: {
                total_users: Number(U.total_users || 0),
                active_users: Number(U.active_users || 0),
                donors: Number(U.donors || 0),
                hospital_admins: Number(U.hospital_admins || 0),
                bank_admins: Number(U.bank_admins || 0),
                admins: Number(U.admins || 0)
            }
        });
    } catch (err) { next(err); }
}

// 2. getDistrictStats
async function getDistrictStats(req, res, next) {
    try {
        const districts = await Promise.all(DISTRICTS.map(async d => {
            const [[h], [b], [dn], [s]] = await Promise.all([
                pool.execute("SELECT COUNT(*) AS c FROM Hospital WHERE city=? AND status='Active'", [d]),
                pool.execute("SELECT COUNT(*) AS c FROM Blood_Bank WHERE city=? AND status='Active'", [d]),
                pool.execute("SELECT COUNT(*) AS c FROM Donor WHERE city=?", [d]),
                pool.execute("SELECT COALESCE(SUM(bs.available_units),0) AS u FROM Blood_Stock bs JOIN Blood_Bank bb ON bb.bank_id=bs.bank_id WHERE bb.city=?", [d])
            ]);
            const units = s[0].u; return { district: d, hospitals: h[0].c, blood_banks: b[0].c, donors: dn[0].c, total_units: units, status: units < 100 ? 'Critical' : units < 300 ? 'Low' : 'Healthy' };
        }));
        return success(res, { districts, summary: { healthy: districts.filter(d => d.status === 'Healthy').length, low: districts.filter(d => d.status === 'Low').length, critical: districts.filter(d => d.status === 'Critical').length } });
    } catch (err) { next(err); }
}

// 3. getStatsTrends
async function getStatsTrends(req, res, next) {
    try {
        const period = req.query.period || '6m';
        const months = period === '1y' ? 12 : period === '3m' ? 3 : period === '1m' ? 1 : 6;
        const [[donT], [reqT]] = await Promise.all([
            pool.execute(`SELECT YEAR(donation_date) AS yr, MONTH(donation_date) AS mo, COUNT(*) AS donations, SUM(quantity_ml) AS ml FROM Donation_Record WHERE donation_date>=DATE_SUB(CURRENT_DATE,INTERVAL ? MONTH) GROUP BY yr,mo ORDER BY yr,mo`, [months]),
            pool.execute(`SELECT YEAR(request_date) AS yr, MONTH(request_date) AS mo, COUNT(*) AS requests, SUM(status='Fulfilled') AS fulfilled FROM Blood_Request WHERE request_date>=DATE_SUB(CURRENT_DATE,INTERVAL ? MONTH) GROUP BY yr,mo ORDER BY yr,mo`, [months])
        ]);
        const map = {}; const MN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        donT.forEach(r => { const k = `${r.yr}-${r.mo}`; map[k] = { label: `${MN[r.mo]} ${r.yr}`, donations: r.donations, ml: r.ml, requests: 0, fulfilled: 0 }; });
        reqT.forEach(r => { const k = `${r.yr}-${r.mo}`; if (!map[k]) map[k] = { label: `${MN[r.mo]} ${r.yr}`, donations: 0, ml: 0 }; map[k].requests = r.requests; map[k].fulfilled = r.fulfilled || 0; });
        return success(res, { period, trends: Object.values(map) });
    } catch (err) { next(err); }
}

// 4. getApprovals
async function getApprovals(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { type, search } = req.query;
        let p = [];
        let hW = "h.status='Pending'", bW = "b.status='Pending'";
        if (search) {
            hW += " AND (h.hospital_name LIKE ? OR u.email LIKE ?)";
            bW += " AND (b.bank_name LIKE ? OR u.email LIKE ?)";
            p.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        let q = `SELECT h.hospital_id AS id,'Hospital' AS type,h.hospital_name AS org_name,h.city,h.contact_number,h.status,u.email,u.created_at AS submitted FROM Hospital h JOIN Users u ON u.entity_id=h.hospital_id WHERE ${hW}`;
        
        if (!type || type === 'Blood_Bank' || type === 'All') {
            const bQ = `SELECT b.bank_id AS id,'Blood_Bank' AS type,b.bank_name AS org_name,b.city,b.contact_number,b.status,u.email,u.created_at AS submitted FROM Blood_Bank b JOIN Users u ON u.entity_id=b.bank_id WHERE ${bW}`;
            if (!type || type === 'All') q = `(${q}) UNION ALL (${bQ})`;
            else q = bQ;
        }

        const [fullList] = await pool.execute(q, p);
        const [rows] = await pool.execute(q + ` ORDER BY submitted ASC LIMIT ${lim} OFFSET ${off}`, p);
        
        const [[hc], [bc]] = await Promise.all([pool.execute("SELECT COUNT(*) AS c FROM Hospital WHERE status='Pending'"), pool.execute("SELECT COUNT(*) AS c FROM Blood_Bank WHERE status='Pending'")]);
        return success(res, { approvals: rows, total: fullList.length, summary: { hospitals: hc[0].c, blood_banks: bc[0].c }, limit: lim, offset: off });
    } catch (err) { next(err); }
}

// 5. getApprovalById
async function getApprovalById(req, res, next) {
    try {
        const id = req.params.id;
        const [h] = await pool.execute('SELECT h.*,u.email,u.created_at AS submitted FROM Hospital h JOIN Users u ON u.entity_id=h.hospital_id WHERE h.hospital_id=?', [id]);
        if (h.length) return success(res, { ...h[0], type: 'Hospital' });
        const [b] = await pool.execute('SELECT b.*,u.email,u.created_at AS submitted FROM Blood_Bank b JOIN Users u ON u.entity_id=b.bank_id WHERE b.bank_id=?', [id]);
        if (b.length) return success(res, { ...b[0], type: 'Blood_Bank' });
        return notFound(res, 'Entity not found');
    } catch (err) { next(err); }
}

// 6. approveEntity
async function approveEntity(req, res, next) {
    let conn; try {
        const id = req.params.id;
        const [h] = await pool.execute('SELECT * FROM Hospital WHERE hospital_id=?', [id]);
        const [b] = await pool.execute('SELECT * FROM Blood_Bank WHERE bank_id=?', [id]);
        if (!h.length && !b.length) return notFound(res, 'Entity not found');
        const isH = h.length > 0; const name = isH ? h[0].hospital_name : b[0].bank_name; const type = isH ? 'Hospital' : 'Blood_Bank'; const role = isH ? 'hospital' : 'bloodbank';
        conn = await pool.getConnection(); await conn.beginTransaction();
        if (isH) { await conn.execute("UPDATE Hospital SET status='Active',updated_at=NOW() WHERE hospital_id=?", [id]); }
        else { await conn.execute("UPDATE Blood_Bank SET status='Active',updated_at=NOW() WHERE bank_id=?", [id]); }
        await conn.execute("UPDATE Users SET is_approved=TRUE,is_active=TRUE WHERE entity_id=? AND role=?", [id, role]);
        await conn.commit(); conn.release();

        // Notify User
        const [u] = await pool.execute("SELECT user_id FROM Users WHERE entity_id=? AND role=?", [id, role]);
        if (u.length) {
            await createNotification({
                user_id: u[0].user_id,
                role: role,
                type: 'account_approved',
                title: 'Account Approved',
                message: `Congratulations! Your ${type} account has been approved and is now active.`,
                link: '/dashboard',
                priority: 'normal'
            });
        }

        return success(res, { id, type, status: 'Active' }, `${type} approved successfully. Account is now active.`);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 7. rejectEntity
async function rejectEntity(req, res, next) {
    let conn; try {
        const id = req.params.id; const { reason } = req.body || {};
        const [h] = await pool.execute('SELECT * FROM Hospital WHERE hospital_id=?', [id]);
        const [b] = await pool.execute('SELECT * FROM Blood_Bank WHERE bank_id=?', [id]);
        if (!h.length && !b.length) return notFound(res, 'Entity not found');
        const isH = h.length > 0; const type = isH ? 'Hospital' : 'Blood_Bank'; const role = isH ? 'hospital' : 'bloodbank';
        conn = await pool.getConnection(); await conn.beginTransaction();
        if (isH) await conn.execute("UPDATE Hospital SET status='Rejected', rejection_reason=?, updated_at=NOW() WHERE hospital_id=?", [reason || 'No reason', id]);
        else await conn.execute("UPDATE Blood_Bank SET status='Rejected', rejection_reason=?, updated_at=NOW() WHERE bank_id=?", [reason || 'No reason', id]);
        await conn.execute("UPDATE Users SET is_approved=FALSE,is_active=FALSE WHERE entity_id=? AND role=?", [id, role]);
        await conn.commit(); conn.release();

        // Notify User
        const [u] = await pool.execute("SELECT user_id FROM Users WHERE entity_id=? AND role=?", [id, role]);
        if (u.length) {
            await createNotification({
                user_id: u[0].user_id,
                role: role,
                type: 'account_rejected',
                title: 'Registration Rejected',
                message: `Your registration was rejected. Reason: ${reason || 'No specific reason provided'}.`,
                link: '/login',
                priority: 'critical'
            });
        }

        return success(res, { id, status: 'Rejected' }, `${type} application rejected`);
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 8. getAllDonors
async function getAllDonors(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { blood_group, city, search } = req.query; let w = '1=1'; const p = [];
        if (blood_group) { w += ' AND d.blood_group=?'; p.push(blood_group); } if (city) { w += ' AND d.city=?'; p.push(city); }
        if (search) { w += ' AND (d.name LIKE ? OR d.phone LIKE ? OR u.email LIKE ?)'; p.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        
        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t FROM Donor d LEFT JOIN Users u ON u.entity_id=d.donor_id AND u.role='donor' WHERE d.is_deleted=0 AND ${w}`, p);
        
        // Comprehensive summary stats
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) AS total,
                SUM(gender='Male') AS male,
                SUM(gender='Female') AS female,
                COUNT(CASE WHEN blood_group='O+' THEN 1 END) AS op,
                COUNT(CASE WHEN blood_group='O-' THEN 1 END) AS oneg,
                COUNT(CASE WHEN blood_group='A+' THEN 1 END) AS ap,
                COUNT(CASE WHEN blood_group='A-' THEN 1 END) AS aneg,
                COUNT(CASE WHEN blood_group='B+' THEN 1 END) AS bp,
                COUNT(CASE WHEN blood_group='B-' THEN 1 END) AS bneg,
                COUNT(CASE WHEN blood_group='AB+' THEN 1 END) AS abp,
                COUNT(CASE WHEN blood_group='AB-' THEN 1 END) AS abneg
            FROM Donor
            WHERE is_deleted=0
        `);

        // Fetch donors with extra metadata
        const [rows] = await pool.execute(`
            SELECT 
                d.*,
                u.user_id, u.email, u.is_active, u.last_login,
                (SELECT COUNT(*) FROM Donation_Record dr WHERE dr.donor_id=d.donor_id) AS total_donations,
                (SELECT COALESCE(SUM(quantity_ml), 0) FROM Donation_Record dr WHERE dr.donor_id=d.donor_id) AS total_ml,
                (SELECT MAX(donation_date) FROM Donation_Record dr WHERE dr.donor_id=d.donor_id) AS last_donation,
                (SELECT hc.eligibility_status FROM Health_Check hc WHERE hc.donor_id=d.donor_id ORDER BY hc.check_date DESC LIMIT 1) AS last_check_status,
                (SELECT hc.hemoglobin FROM Health_Check hc WHERE hc.donor_id=d.donor_id ORDER BY hc.check_date DESC LIMIT 1) AS last_hb,
                (SELECT hc.weight FROM Health_Check hc WHERE hc.donor_id=d.donor_id ORDER BY hc.check_date DESC LIMIT 1) AS last_weight
            FROM Donor d 
            LEFT JOIN Users u ON u.entity_id=d.donor_id AND u.role='donor' 
            WHERE d.is_deleted=0 AND ${w} 
            ORDER BY d.created_at DESC
        `, p);

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

        const donors = processed.slice(off, off + lim);
        const s = stats[0];

        const summary = { 
            total: s.total || 0, 
            male: s.male || 0, 
            female: s.female || 0,
            blood_groups: { 'O+': s.op, 'O-': s.oneg, 'A+': s.ap, 'A-': s.aneg, 'B+': s.bp, 'B-': s.bneg, 'AB+': s.abp, 'AB-': s.abneg },
            eligibility: { 
                eligible: processed.filter(d => d.current_eligibility === 'Eligible').length, 
                cooling: processed.filter(d => d.current_eligibility === 'Cooling').length, 
                deferred: processed.filter(d => d.current_eligibility === 'Deferred').length 
            }
        };

        return success(res, { 
            donors, 
            summary, 
            total: cnt[0].t, 
            limit: lim, 
            offset: off 
        });
    } catch (err) { next(err); }
}

// 9. getDonorById
async function getDonorById(req, res, next) {
    try {
        const id = req.params.donor_id;
        const [d] = await pool.execute(`
            SELECT d.*, u.email, u.is_active, u.last_login,
                (SELECT COUNT(*) FROM Donation_Record dr WHERE dr.donor_id=d.donor_id) AS total_donations,
                (SELECT COALESCE(SUM(quantity_ml), 0) FROM Donation_Record dr WHERE dr.donor_id=d.donor_id) AS total_ml,
                (SELECT MAX(donation_date) FROM Donation_Record dr WHERE dr.donor_id=d.donor_id) AS last_donation,
                (SELECT hc.eligibility_status FROM Health_Check hc WHERE hc.donor_id=d.donor_id ORDER BY hc.check_date DESC LIMIT 1) AS current_eligibility 
            FROM Donor d 
            LEFT JOIN Users u ON u.entity_id=d.donor_id AND u.role='donor' 
            WHERE d.donor_id=?
        `, [id]);
        
        if (!d.length) return notFound(res, 'Donor not found');
        
        const [hcs] = await pool.execute('SELECT * FROM Health_Check WHERE donor_id=? ORDER BY check_date DESC', [id]);
        const [dons] = await pool.execute('SELECT dr.*, b.bank_name FROM Donation_Record dr JOIN Blood_Bank b ON b.bank_id=dr.bank_id WHERE dr.donor_id=? ORDER BY donation_date DESC', [id]);
        
        return success(res, {
            ...d[0],
            current_eligibility: calcEligibility(parseFloat(hcs[0]?.hemoglobin || 13), parseFloat(hcs[0]?.weight || 60), d[0].last_donation_date),
            health_checks: hcs,
            donations: dons
        });
    } catch (err) { next(err); }
}

// 10. updateDonor
async function updateDonor(req, res, next) {
    let conn; try {
        const id = req.params.donor_id; const [cur] = await pool.execute('SELECT * FROM Donor WHERE donor_id=?', [id]);
        if (!cur.length) return notFound(res, 'Donor not found'); const d = cur[0], body = req.body || {};
        const u = { name: body.name || d.name, age: body.age || d.age, gender: body.gender || d.gender, blood_group: body.blood_group || d.blood_group, phone: body.phone || d.phone, city: body.city || d.city };
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('UPDATE Donor SET name=?,age=?,gender=?,blood_group=?,phone=?,city=?,updated_at=NOW() WHERE donor_id=?', [u.name, u.age, u.gender, u.blood_group, u.phone, u.city, id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'UPDATED', entity: 'Donor', entity_id: id, detail: `Admin updated donor: ${u.name}`, ip: req.ip });
        await conn.commit(); conn.release();
        return success(res, { donor_id: id, ...u }, 'Donor updated');
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 11. deleteDonor
async function deleteDonor(req, res, next) {
    let conn; try {
        const id = req.params.donor_id; const [d] = await pool.execute('SELECT * FROM Donor WHERE donor_id=?', [id]);
        if (!d.length) return notFound(res, 'Donor not found');
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute("UPDATE Users SET is_active=FALSE WHERE entity_id=? AND role='donor'", [id]);
        await conn.execute('UPDATE Donor SET is_deleted=1, updated_at=NOW() WHERE donor_id=?', [id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'DELETED', entity: 'Donor', entity_id: id, detail: `Donor soft-deleted: ${d[0].name}`, ip: req.ip, severity: 'Warning' });
        await conn.commit(); conn.release();
        return success(res, { message: 'Donor removed' });
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 12. getAllHospitals
async function getAllHospitals(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { status, city, search } = req.query; let w = '1=1'; const p = [];
        if (status) { w += ' AND h.status=?'; p.push(status); } if (city) { w += ' AND h.city=?'; p.push(city); }
        if (search) { w += ' AND h.hospital_name LIKE ?'; p.push(`%${search}%`); }
        
        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t FROM Hospital h WHERE ${w}`, p);
        const [rows] = await pool.execute(`SELECT h.*, u.user_id, u.email, u.is_active, u.last_login,
            (SELECT COUNT(*) FROM Patient pp WHERE pp.hospital_id=h.hospital_id AND pp.status!='Discharged') AS active_patients,
            (SELECT COUNT(*) FROM Blood_Request br WHERE br.hospital_id=h.hospital_id) AS total_requests,
            (SELECT COUNT(*) FROM Blood_Request br WHERE br.hospital_id=h.hospital_id AND br.status='Fulfilled') AS fulfilled,
            (SELECT COUNT(*) FROM Blood_Request br WHERE br.hospital_id=h.hospital_id AND br.status IN ('Rejected', 'Cancelled', 'Expired')) AS denied 
            FROM Hospital h LEFT JOIN Users u ON u.entity_id=h.hospital_id AND u.role='hospital' 
            WHERE ${w} AND h.is_deleted=0 ORDER BY h.created_at DESC LIMIT ${lim} OFFSET ${off}`, p);
        
        const [sum] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN h.status='Active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN h.status='Pending' THEN 1 ELSE 0 END) as pending,
                (SELECT COUNT(*) FROM Blood_Request WHERE status='Pending') as active_requests
            FROM Hospital h WHERE h.is_deleted=0
        `);

        return success(res, { hospitals: rows, total: cnt[0].t, limit: lim, offset: off, summary: sum[0] });
    } catch (err) { next(err); }
}

// 13. getHospitalById
async function getHospitalById(req, res, next) {
    try {
        const id = req.params.hospital_id;
        const [h] = await pool.execute('SELECT h.*,u.email,u.is_active FROM Hospital h LEFT JOIN Users u ON u.entity_id=h.hospital_id AND u.role=\'hospital\' WHERE h.hospital_id=?', [id]);
        if (!h.length) return notFound(res, 'Hospital not found');
        const [reqs] = await pool.execute('SELECT br.*,p.name AS patient_name,b.bank_name FROM Blood_Request br JOIN Patient p ON p.patient_id=br.patient_id JOIN Blood_Bank b ON b.bank_id=br.bank_id WHERE br.hospital_id=? ORDER BY br.created_at DESC LIMIT 10', [id]);
        const [pay] = await pool.execute("SELECT COALESCE(SUM(amount),0) AS total,COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS paid,COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending FROM Payment WHERE hospital_id=?", [id]);
        const [pats] = await pool.execute('SELECT COUNT(*) AS total, SUM(CASE WHEN status="Admitted" THEN 1 ELSE 0 END) AS admitted FROM Patient WHERE hospital_id=?', [id]);
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status='Fulfilled' THEN 1 ELSE 0 END) as fulfilled,
                SUM(CASE WHEN status IN ('Rejected', 'Cancelled', 'Expired') THEN 1 ELSE 0 END) as denied
            FROM Blood_Request WHERE hospital_id=?
        `, [id]);
        return success(res, { ...h[0], recent_requests: reqs, payments: pay[0], patient_stats: pats[0], request_stats: stats[0] });
    } catch (err) { next(err); }
}

// 14. updateHospital
async function updateHospital(req, res, next) {
    let conn; try {
        const id = req.params.hospital_id; const [cur] = await pool.execute('SELECT * FROM Hospital WHERE hospital_id=?', [id]);
        if (!cur.length) return notFound(res, 'Hospital not found'); const h = cur[0], body = req.body || {};
        const u = { hospital_name: body.hospital_name || h.hospital_name, city: body.city || h.city, contact_number: body.contact_number || h.contact_number, beds: body.beds !== undefined ? body.beds : h.beds, status: body.status || h.status };
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('UPDATE Hospital SET hospital_name=?,city=?,contact_number=?,beds=?,status=?,updated_at=NOW() WHERE hospital_id=?', [u.hospital_name, u.city, u.contact_number, u.beds, u.status, id]);
        if (body.status && body.status !== h.status) {
            if (body.status === 'Active') await conn.execute("UPDATE Users SET is_active=TRUE,is_approved=TRUE WHERE entity_id=? AND role='hospital'", [id]);
            if (body.status === 'Suspended') await conn.execute("UPDATE Users SET is_active=FALSE WHERE entity_id=? AND role='hospital'", [id]);
        }
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'UPDATED', entity: 'Hospital', entity_id: id, detail: `Hospital updated: ${u.hospital_name} status=${u.status}`, ip: req.ip });
        await conn.commit(); conn.release();
        return success(res, { hospital_id: id, ...u }, 'Hospital updated');
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 15. deleteHospital
async function deleteHospital(req, res, next) {
    let conn; try {
        const id = req.params.hospital_id; const [h] = await pool.execute('SELECT * FROM Hospital WHERE hospital_id=?', [id]);
        if (!h.length) return notFound(res, 'Hospital not found');
        const [act] = await pool.execute("SELECT COUNT(*) AS c FROM Blood_Request WHERE hospital_id=? AND status IN ('Pending','Processing')", [id]);
        if (act[0].c > 0) return error(res, 'Hospital has active blood requests. Resolve first.', 409);
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute("UPDATE Users SET is_active=FALSE WHERE entity_id=? AND role='hospital'", [id]);
        await conn.execute("UPDATE Hospital SET is_deleted=1, status='Deleted', updated_at=NOW() WHERE hospital_id=?", [id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'DELETED', entity: 'Hospital', entity_id: id, detail: `Hospital deleted: ${h[0].hospital_name}`, ip: req.ip, severity: 'Warning' });
        await conn.commit(); conn.release();
        return success(res, { message: 'Hospital removed' });
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 16. getAllBloodBanks
async function getAllBloodBanks(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { status, city, search } = req.query; let w = '1=1'; const p = [];
        if (status) { w += ' AND b.status=?'; p.push(status); } if (city) { w += ' AND b.city=?'; p.push(city); }
        if (search) { w += ' AND b.bank_name LIKE ?'; p.push(`%${search}%`); }
        
        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t FROM Blood_Bank b WHERE ${w}`, p);
        const [rows] = await pool.execute(`SELECT b.*, u.user_id, u.email, u.is_active, u.last_login,
            (SELECT COALESCE(SUM(available_units),0) FROM Blood_Stock bs WHERE bs.bank_id=b.bank_id) AS total_units,
            (SELECT COUNT(*) FROM Donation_Record dr WHERE dr.bank_id=b.bank_id) AS total_donations,
            (SELECT COALESCE(SUM(quantity_ml),0) FROM Donation_Record dr WHERE dr.bank_id=b.bank_id) AS total_ml,
            (SELECT COUNT(*) FROM Blood_Request br WHERE br.bank_id=b.bank_id AND br.status='Fulfilled') AS fulfilled,
            (SELECT COUNT(*) FROM Blood_Request br WHERE br.bank_id=b.bank_id AND br.status IN ('Rejected', 'Cancelled', 'Expired')) AS denied 
            FROM Blood_Bank b LEFT JOIN Users u ON u.entity_id=b.bank_id AND u.role='bloodbank' 
            WHERE ${w} AND b.is_deleted=0 ORDER BY b.created_at DESC LIMIT ${lim} OFFSET ${off}`, p);
        
        const [sum] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN b.status='Active' THEN 1 ELSE 0 END) as active,
                (SELECT COALESCE(SUM(available_units),0) FROM Blood_Stock) as global_stock,
                (SELECT COUNT(*) FROM Donation_Record WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as monthly_donations
            FROM Blood_Bank b WHERE b.is_deleted=0
        `);

        return success(res, { blood_banks: rows, total: cnt[0].t, limit: lim, offset: off, summary: sum[0] });
    } catch (err) { next(err); }
}

// 17. getBloodBankById
async function getBloodBankById(req, res, next) {
    try {
        const id = req.params.bank_id;
        const [b] = await pool.execute('SELECT b.*,u.email,u.is_active FROM Blood_Bank b LEFT JOIN Users u ON u.entity_id=b.bank_id AND u.role=\'bloodbank\' WHERE b.bank_id=?', [id]);
        if (!b.length) return notFound(res, 'Blood bank not found');
        const [stk] = await pool.execute('SELECT * FROM Blood_Stock WHERE bank_id=?', [id]);
        const [dons] = await pool.execute('SELECT dr.*,d.name AS donor_name FROM Donation_Record dr JOIN Donor d ON d.donor_id=dr.donor_id WHERE dr.bank_id=? ORDER BY dr.donation_date DESC LIMIT 10', [id]);
        const [reqs] = await pool.execute('SELECT br.*,h.hospital_name,p.name AS patient_name FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Patient p ON p.patient_id=br.patient_id WHERE br.bank_id=? ORDER BY br.created_at DESC LIMIT 10', [id]);
        const [stats] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM Donation_Record WHERE bank_id=?) as total_donations,
                (SELECT COALESCE(SUM(quantity_ml),0) FROM Donation_Record WHERE bank_id=?) as total_ml,
                (SELECT COUNT(*) FROM Blood_Request WHERE bank_id=? AND status='Fulfilled') as fulfilled,
                (SELECT COUNT(*) FROM Blood_Request WHERE bank_id=? AND status IN ('Rejected', 'Cancelled', 'Expired')) as denied
            FROM DUAL
        `, [id, id, id, id]);
        const [pay] = await pool.execute("SELECT COALESCE(SUM(amount),0) AS total,COALESCE(SUM(CASE WHEN payment_status='Paid' THEN amount ELSE 0 END),0) AS received,COALESCE(SUM(CASE WHEN payment_status='Pending' THEN amount ELSE 0 END),0) AS pending FROM Payment WHERE bank_id=?", [id]);
        return success(res, { ...b[0], stock: stk, recent_donations: dons, recent_requests: reqs, operation_stats: stats[0], payments: pay[0] });
    } catch (err) { next(err); }
}

// 18. updateBloodBank
async function updateBloodBank(req, res, next) {
    let conn; try {
        const id = req.params.bank_id; const [cur] = await pool.execute('SELECT * FROM Blood_Bank WHERE bank_id=?', [id]);
        if (!cur.length) return notFound(res, 'Blood bank not found'); const b = cur[0], body = req.body || {};
        const u = { bank_name: body.bank_name || b.bank_name, city: body.city || b.city, contact_number: body.contact_number || b.contact_number, storage_capacity: body.storage_capacity || b.storage_capacity, operating_hours: body.operating_hours !== undefined ? body.operating_hours : b.operating_hours, status: body.status || b.status };
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute('UPDATE Blood_Bank SET bank_name=?,city=?,contact_number=?,storage_capacity=?,operating_hours=?,status=?,updated_at=NOW() WHERE bank_id=?', [u.bank_name, u.city, u.contact_number, u.storage_capacity, u.operating_hours, u.status, id]);
        if (body.status && body.status !== b.status) {
            if (body.status === 'Active') await conn.execute("UPDATE Users SET is_active=TRUE,is_approved=TRUE WHERE entity_id=? AND role='bloodbank'", [id]);
            if (body.status === 'Suspended') await conn.execute("UPDATE Users SET is_active=FALSE WHERE entity_id=? AND role='bloodbank'", [id]);
        }
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'UPDATED', entity: 'Blood_Bank', entity_id: id, detail: `Blood bank updated: ${u.bank_name}`, ip: req.ip });
        await conn.commit(); conn.release();
        return success(res, { bank_id: id, ...u }, 'Blood bank updated');
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 19. deleteBloodBank
async function deleteBloodBank(req, res, next) {
    let conn; try {
        const id = req.params.bank_id; const [b] = await pool.execute('SELECT * FROM Blood_Bank WHERE bank_id=?', [id]);
        if (!b.length) return notFound(res, 'Blood bank not found');
        const [act] = await pool.execute("SELECT COUNT(*) AS c FROM Blood_Request WHERE bank_id=? AND status IN ('Pending','Processing')", [id]);
        if (act[0].c > 0) return error(res, 'Blood bank has active requests. Resolve first.', 409);
        conn = await pool.getConnection(); await conn.beginTransaction();
        await conn.execute("UPDATE Users SET is_active=FALSE WHERE entity_id=? AND role='bloodbank'", [id]);
        await conn.execute("UPDATE Blood_Bank SET is_deleted=1, status='Deleted', updated_at=NOW() WHERE bank_id=?", [id]);
        await auditLog(conn, { user_id: req.user.user_id, user_name: null, role: 'admin', action: 'DELETED', entity: 'Blood_Bank', entity_id: id, detail: `Blood bank deleted: ${b[0].bank_name}`, ip: req.ip, severity: 'Warning' });
        await conn.commit(); conn.release();
        return success(res, { message: 'Blood bank removed' });
    } catch (err) { if (conn) { await conn.rollback(); conn.release(); } next(err); }
}

// 20. getAllInventory
async function getAllInventory(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { bank_id, blood_group, city, search } = req.query; 
        let w = "bb.status='Active' AND bb.is_deleted=0"; const p = [];
        if (bank_id) { w += ' AND bs.bank_id=?'; p.push(bank_id); } 
        if (blood_group) { w += ' AND bs.blood_group=?'; p.push(blood_group); }
        if (city) { w += ' AND bb.city=?'; p.push(city); }
        if (search) { w += ' AND bb.bank_name LIKE ?'; p.push(`%${search}%`); }

        // Get total unique banks matching criteria
        const [cnt] = await pool.execute(`SELECT COUNT(DISTINCT bb.bank_id) AS t FROM Blood_Bank bb LEFT JOIN Blood_Stock bs ON bb.bank_id=bs.bank_id WHERE ${w}`, p);
        
        // Get paginated banks
        const [banksRows] = await pool.execute(`SELECT bb.bank_id FROM Blood_Bank bb LEFT JOIN Blood_Stock bs ON bb.bank_id=bs.bank_id WHERE ${w} GROUP BY bb.bank_id ORDER BY bb.bank_name LIMIT ${lim} OFFSET ${off}`, p);
        
        if (!banksRows.length) {
            return success(res, { inventory: [], total: 0, limit: lim, offset: off, summary: { total_units: 0, critical_count: 0, low_count: 0, healthy_count: 0 } });
        }

        const targetBankIds = banksRows.map(b => b.bank_id);
        
        // Get all stock rows for THESE banks (not just the paginated slice)
        const [rows] = await pool.execute(`
            SELECT bs.*, bb.bank_name, bb.city, bb.contact_number, 
            ROUND(bs.available_units/bs.capacity*100,1) AS percentage,
            CASE WHEN bs.available_units/bs.capacity>0.6 THEN 'Healthy' 
                 WHEN bs.available_units/bs.capacity>0.3 THEN 'Low' 
                 ELSE 'Critical' END AS stock_status 
            FROM Blood_Stock bs 
            JOIN Blood_Bank bb ON bb.bank_id=bs.bank_id 
            WHERE bs.bank_id IN (${targetBankIds.map(() => '?').join(',')})
            ORDER BY bb.bank_name, bs.blood_group
        `, targetBankIds);

        const banks = {}; 
        rows.forEach(r => { 
            if (!banks[r.bank_id]) banks[r.bank_id] = { bank_id: r.bank_id, bank_name: r.bank_name, city: r.city, stock: [], total_units: 0 }; 
            banks[r.bank_id].stock.push(r); 
            banks[r.bank_id].total_units += r.available_units; 
        });
        
        const inv = Object.values(banks);
        const totalU = rows.reduce((s, r) => s + r.available_units, 0);
        const totalC = rows.reduce((s, r) => s + r.capacity, 0);

        return success(res, { 
            inventory: inv, 
            total: cnt[0].t,
            limit: lim, 
            offset: off,
            summary: { 
                total_units: totalU, 
                total_capacity: totalC,
                critical_count: rows.filter(r => r.stock_status === 'Critical').length, 
                low_count: rows.filter(r => r.stock_status === 'Low').length, 
                healthy_count: rows.filter(r => r.stock_status === 'Healthy').length 
            } 
        });
    } catch (err) { next(err); }
}

// 21. getAllRequests
async function getAllRequests(req, res, next) {
    try {
        const lim = parseInt(req.query.limit) || 20, off = parseInt(req.query.offset) || 0;
        const { status, priority, blood_group, hospital_id, bank_id, search } = req.query; 
        let w = '1=1'; const p = [];
        if (status) { w += ' AND br.status=?'; p.push(status); } 
        if (priority) { w += ' AND br.priority=?'; p.push(priority); }
        if (blood_group) { w += ' AND br.blood_group=?'; p.push(blood_group); } 
        if (hospital_id) { w += ' AND br.hospital_id=?'; p.push(hospital_id); }
        if (bank_id) { w += ' AND br.bank_id=?'; p.push(bank_id); }
        if (search) { w += ' AND (h.hospital_name LIKE ? OR b.bank_name LIKE ? OR p.name LIKE ? OR br.request_id LIKE ?)'; p.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }

        const qBase = ` FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Blood_Bank b ON b.bank_id=br.bank_id JOIN Patient p ON p.patient_id=br.patient_id WHERE ${w}`;
        
        const [cnt] = await pool.execute(`SELECT COUNT(*) AS t ${qBase}`, p);
        const [sum] = await pool.execute("SELECT COUNT(*) AS total,SUM(status='Pending') AS pending,SUM(status='Processing') AS processing,SUM(status='Fulfilled') AS fulfilled,SUM(status='Cancelled') AS cancelled,SUM(priority='Emergency' AND status IN ('Pending','Processing')) AS emergency FROM Blood_Request");
        const [rows] = await pool.execute(`SELECT br.*,h.hospital_name,h.city AS hospital_city,b.bank_name,b.city AS bank_city,p.name AS patient_name,p.blood_group AS patient_blood_group,bi.issue_id,bi.units_issued,bi.issue_date,pay.payment_id,pay.amount,pay.payment_status ${qBase.replace(' WHERE', ' LEFT JOIN Blood_Issue bi ON bi.request_id=br.request_id LEFT JOIN Payment pay ON pay.request_id=br.request_id WHERE')} ORDER BY CASE br.priority WHEN 'Emergency' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END,br.created_at DESC LIMIT ${lim} OFFSET ${off}`, p);
        
        const s = sum[0]; 
        const sTotal = Number(s.total || 0);
        const sFulfilled = Number(s.fulfilled || 0);

        return success(res, { 
            requests: rows, 
            summary: { 
                total: sTotal, 
                pending: Number(s.pending || 0), 
                processing: Number(s.processing || 0), 
                fulfilled: sFulfilled, 
                cancelled: Number(s.cancelled || 0), 
                emergency: Number(s.emergency || 0), 
                fulfillment_rate: sTotal > 0 ? Math.round(sFulfilled / sTotal * 1000) / 10 : 0 
            }, 
            total: cnt[0].t, 
            limit: lim, 
            offset: off 
        });
    } catch (err) { next(err); }
}

// 22. getRequestById
async function getRequestById(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT br.*,h.hospital_name,h.city AS hospital_city,b.bank_name,b.city AS bank_city,p.name AS patient_name,bi.issue_id,bi.units_issued,bi.issue_date,bi.notes AS issue_notes,pay.payment_id,pay.amount,pay.payment_status,pay.payment_date FROM Blood_Request br JOIN Hospital h ON h.hospital_id=br.hospital_id JOIN Blood_Bank b ON b.bank_id=br.bank_id JOIN Patient p ON p.patient_id=br.patient_id LEFT JOIN Blood_Issue bi ON bi.request_id=br.request_id LEFT JOIN Payment pay ON pay.request_id=br.request_id WHERE br.request_id=?', [req.params.request_id]);
        if (!rows.length) return notFound(res, 'Request not found'); return success(res, rows[0]);
    } catch (err) { next(err); }
}

// 23. sendDonorReminder
async function sendDonorReminder(req, res, next) {
    try {
        const id = req.params.donor_id;
        const [d] = await pool.execute('SELECT d.*, u.user_id FROM Donor d JOIN Users u ON u.entity_id=d.donor_id AND u.role="donor" WHERE d.donor_id=?', [id]);
        if (!d.length) return notFound(res, 'Donor not found');
        
        await createNotification({
            user_id: d[0].user_id,
            role: 'donor',
            type: 'reminder',
            title: 'Donation Reminder',
            message: `Hello ${d[0].name}, your help is needed! You are currently eligible to donate. Please visit your nearest blood bank.`,
            link: '/donor/schedule',
            priority: 'normal'
        });

        return success(res, null, 'Reminder sent successfully');
    } catch (err) { next(err); }
}

// 24-28 + remaining endpoints loaded from part 2
const part2 = require('./admin.controller.part2');

module.exports = { getStats, getDistrictStats, getStatsTrends, getDashboard: part2.getDashboard, getApprovals, getApprovalById, approveEntity, rejectEntity, getAllDonors, getDonorById, updateDonor, deleteDonor, getAllHospitals, getHospitalById, updateHospital, deleteHospital, getAllBloodBanks, getBloodBankById, updateBloodBank, deleteBloodBank, getAllInventory, getAllRequests, getRequestById, sendDonorReminder, ...part2 };
