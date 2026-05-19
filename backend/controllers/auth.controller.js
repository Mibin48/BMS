/**
 * ═══════════════════════════════════════════
 * HEM∆ — Auth Controller (Phase B2)
 * Complete authentication system:
 *   Registration, Login, OTP, Password Reset,
 *   Token Refresh, Logout, Profile
 * ═══════════════════════════════════════════
 */

const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../utils/jwt');
const {
    generateDonorId,
    generateHospitalId,
    generateBankId,
    generateUserId,
    generateStockId,
    generateLogId,
} = require('../utils/generateId');
const { success, error, unauthorized, notFound } = require('../utils/response');
const { createNotification, notifyAdmins } = require('../utils/notify');


// ─────────────────────────────────────
// HELPERS
// ─────────────────────────────────────

/**
 * Inline field validation.
 * Returns the first missing field name, or null if all present.
 */
const validate = (fields) => {
    for (const [key, val] of Object.entries(fields)) {
        if (val === undefined || val === null || val === '') {
            return `${key} is required`;
        }
    }
    return null;
};

/**
 * Generate a reference number for pending approvals.
 */
const generateRefNumber = () => {
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 90000 + 10000);
    return `HEM-${year}-KL-${seq}`;
};

/**
 * Insert a row into Audit_Log.
 */
const auditLog = async (conn, {
    user_id, user_name = null, role,
    action, entity, entity_id = null,
    detail = null, ip, severity = 'Info',
}) => {
    const log_id = generateLogId();
    await conn.execute(
        `INSERT INTO Audit_Log VALUES (?,?,?,?,?,?,?,?,?,?,NOW())`,
        [log_id, user_id, user_name, role, action, entity, entity_id, detail, ip, severity]
    );
};


// ═══════════════════════════════════════════
// 1. REGISTER DONOR
// POST /api/auth/register/donor
// ═══════════════════════════════════════════

async function registerDonor(req, res, next) {
    let conn;
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return error(res, 'Request body is missing or unparsed. Ensure Content-Type is application/json.', 400);
        }
        const { name, age, gender, blood_group, phone, city, email, password } = req.body;

        // Validate required fields
        const missing = validate({ name, age, gender, blood_group, phone, city, email, password });
        if (missing) return error(res, missing, 400);

        // Additional validations
        if (age < 18 || age > 65) return error(res, 'Age must be between 18 and 65', 400);
        if (!['Male', 'Female', 'Other'].includes(gender)) return error(res, 'Invalid gender', 400);
        if (!['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].includes(blood_group)) return error(res, 'Invalid blood group', 400);
        if (!email.includes('@')) return error(res, 'Invalid email format', 400);
        if (password.length < 6) return error(res, 'Password must be at least 6 characters', 400);

        // Check email not already registered
        const [existingEmail] = await pool.execute('SELECT user_id FROM Users WHERE email = ?', [email]);
        if (existingEmail.length > 0) return error(res, 'Email already registered', 409);

        // Check phone not already registered
        const [existingPhone] = await pool.execute('SELECT donor_id FROM Donor WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) return error(res, 'Phone number already registered', 409);

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Generate IDs
        const donor_id = generateDonorId();
        const user_id = generateUserId();

        // Transaction
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // INSERT Donor
        await conn.execute(
            `INSERT INTO Donor (donor_id, name, age, gender, blood_group, phone, city, last_donation_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())`,
            [donor_id, name, age, gender, blood_group, phone, city]
        );

        // INSERT User (donor is instantly active + approved)
        await conn.execute(
            `INSERT INTO Users (user_id, email, password_hash, phone, role, entity_id, is_active, is_approved, otp, otp_expires, created_at, last_login)
       VALUES (?, ?, ?, ?, 'donor', ?, TRUE, TRUE, NULL, NULL, NOW(), NULL)`,
            [user_id, email, hash, phone, donor_id]
        );

        // Audit log
        await auditLog(conn, {
            user_id, user_name: name, role: 'donor',
            action: 'REGISTERED', entity: 'Donor', entity_id: donor_id,
            detail: `New donor registered: ${name}`, ip: req.ip, severity: 'Info',
        });

        await conn.commit();
        conn.release();

        // Generate tokens
        const payload = { user_id, role: 'donor', entity_id: donor_id };
        const accessToken = generateAccessToken(payload);
        const refreshTokenVal = generateRefreshToken({ user_id, role: 'donor' });

        return success(res, {
            user_id,
            donor_id,
            name,
            role: 'donor',
            token: accessToken,
            refresh_token: refreshTokenVal,
        }, 'Registration successful', 201);

    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 2. REGISTER HOSPITAL
// POST /api/auth/register/hospital
// ═══════════════════════════════════════════

async function registerHospital(req, res, next) {
    let conn;
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return error(res, 'Request body is missing or unparsed. Ensure Content-Type is application/json.', 400);
        }
        const { hospital_name, city, contact_number, beds, admin_name, email, phone, password } = req.body;

        // Validate
        const missing = validate({ hospital_name, city, contact_number, beds, email, password });
        if (missing) return error(res, missing, 400);
        if (beds < 1) return error(res, 'Beds must be greater than 0', 400);
        if (!email.includes('@')) return error(res, 'Invalid email format', 400);
        if (password.length < 6) return error(res, 'Password must be at least 6 characters', 400);

        // Check email
        const [existingEmail] = await pool.execute('SELECT user_id FROM Users WHERE email = ?', [email]);
        if (existingEmail.length > 0) return error(res, 'Email already registered', 409);

        // Check contact_number
        const [existingContact] = await pool.execute('SELECT hospital_id FROM Hospital WHERE contact_number = ?', [contact_number]);
        if (existingContact.length > 0) return error(res, 'Contact number already registered', 409);

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Generate IDs
        const hospital_id = generateHospitalId();
        const user_id = generateUserId();
        const ref_number = generateRefNumber();

        // Transaction
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // INSERT Hospital (status = Pending)
        await conn.execute(
            `INSERT INTO Hospital (hospital_id, hospital_name, city, contact_number, beds, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
            [hospital_id, hospital_name, city, contact_number, beds]
        );

        // INSERT User (not active, not approved — needs admin approval)
        await conn.execute(
            `INSERT INTO Users (user_id, email, password_hash, phone, role, entity_id, is_active, is_approved, otp, otp_expires, created_at, last_login)
       VALUES (?, ?, ?, ?, 'hospital', ?, FALSE, FALSE, NULL, NULL, NOW(), NULL)`,
            [user_id, email, hash, phone || null, hospital_id]
        );

        // Audit log
        await auditLog(conn, {
            user_id, user_name: admin_name || hospital_name, role: 'hospital',
            action: 'REGISTERED', entity: 'Hospital', entity_id: hospital_id,
            detail: `Hospital registration pending: ${hospital_name}`, ip: req.ip, severity: 'Info',
        });

        await conn.commit();
        conn.release();

        // Notify Admins
        try {
            await notifyAdmins({
                type: 'new_hospital_registration',
                title: 'New Hospital Application',
                message: `Hospital "${hospital_name}" has registered and is awaiting approval.`,
                link: '/admin/approvals',
                priority: 'normal'
            });
        } catch (nErr) { console.error('Notify Admin Error:', nErr); }

        // No token — needs admin approval
        return success(res, {
            hospital_id,
            hospital_name,
            status: 'Pending',
            ref_number,
        }, 'Application submitted. Awaiting admin approval.', 201);

    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 3. REGISTER BLOOD BANK
// POST /api/auth/register/bloodbank
// ═══════════════════════════════════════════

async function registerBloodBank(req, res, next) {
    let conn;
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return error(res, 'Request body is missing or unparsed. Ensure Content-Type is application/json.', 400);
        }
        const {
            bank_name, city, contact_number, naco_number, license_number,
            storage_capacity, operating_hours, admin_name, email, phone, password,
        } = req.body;

        // Validate
        const missing = validate({ bank_name, city, contact_number, naco_number, email, password });
        if (missing) return error(res, missing, 400);
        if (!email.includes('@')) return error(res, 'Invalid email format', 400);
        if (password.length < 6) return error(res, 'Password must be at least 6 characters', 400);

        // Check email
        const [existingEmail] = await pool.execute('SELECT user_id FROM Users WHERE email = ?', [email]);
        if (existingEmail.length > 0) return error(res, 'Email already registered', 409);

        // Check NACO number
        const [existingNACO] = await pool.execute('SELECT bank_id FROM Blood_Bank WHERE naco_number = ?', [naco_number]);
        if (existingNACO.length > 0) return error(res, 'NACO number already registered', 409);

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Generate IDs
        const bank_id = generateBankId();
        const user_id = generateUserId();
        const ref_number = generateRefNumber();

        // Transaction
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // INSERT Blood_Bank (status = Pending)
        await conn.execute(
            `INSERT INTO Blood_Bank (bank_id, bank_name, city, contact_number, naco_number, license_number, storage_capacity, operating_hours, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
            [bank_id, bank_name, city, contact_number, naco_number, license_number || null, storage_capacity || 1000, operating_hours || null]
        );

        // INSERT Blood_Stock for all 8 blood groups (empty stock)
        const stockGroups = [
            { group: 'A+', cap: 200 },
            { group: 'A-', cap: 100 },
            { group: 'B+', cap: 200 },
            { group: 'B-', cap: 80 },
            { group: 'O+', cap: 300 },
            { group: 'O-', cap: 100 },
            { group: 'AB+', cap: 120 },
            { group: 'AB-', cap: 60 },
        ];

        for (const sg of stockGroups) {
            const stock_id = generateStockId();
            await conn.execute(
                `INSERT INTO Blood_Stock (stock_id, bank_id, blood_group, available_units, capacity, last_updated)
         VALUES (?, ?, ?, 0, ?, NOW())`,
                [stock_id, bank_id, sg.group, sg.cap]
            );
        }

        // INSERT User (not active, not approved)
        await conn.execute(
            `INSERT INTO Users (user_id, email, password_hash, phone, role, entity_id, is_active, is_approved, otp, otp_expires, created_at, last_login)
       VALUES (?, ?, ?, ?, 'bloodbank', ?, FALSE, FALSE, NULL, NULL, NOW(), NULL)`,
            [user_id, email, hash, phone || null, bank_id]
        );

        // Audit log
        await auditLog(conn, {
            user_id, user_name: admin_name || bank_name, role: 'bloodbank',
            action: 'REGISTERED', entity: 'Blood_Bank', entity_id: bank_id,
            detail: `Blood bank registration pending: ${bank_name}`, ip: req.ip, severity: 'Info',
        });

        await conn.commit();
        conn.release();

        // Notify Admins
        try {
            await notifyAdmins({
                type: 'new_blood_bank_registration',
                title: 'New Blood Bank Application',
                message: `Blood Bank "${bank_name}" has registered and is awaiting approval.`,
                link: '/admin/approvals',
                priority: 'normal'
            });
        } catch (nErr) { console.error('Notify Admin Error:', nErr); }

        // No token — needs admin approval
        return success(res, {
            bank_id,
            bank_name,
            status: 'Pending',
            ref_number,
        }, 'Application submitted. Awaiting admin approval.', 201);

    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 4. LOGIN
// POST /api/auth/login
// ═══════════════════════════════════════════

async function login(req, res, next) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return error(res, 'Request body is missing or unparsed.', 400);
        }
        const { email, password, role } = req.body;

        const missing = validate({ email, password, role });
        if (missing) return error(res, missing, 400);

        // 1. Find user with display name
        const [rows] = await pool.execute(
            `SELECT u.*,
             CASE u.role
               WHEN 'donor'     THEN d.name
               WHEN 'hospital'  THEN h.hospital_name
               WHEN 'bloodbank' THEN b.bank_name
               WHEN 'admin'     THEN 'Admin Kerala'
             END AS display_name
           FROM Users u
           LEFT JOIN Donor d       ON u.entity_id = d.donor_id
           LEFT JOIN Hospital h    ON u.entity_id = h.hospital_id
           LEFT JOIN Blood_Bank b  ON u.entity_id = b.bank_id
           WHERE u.email = ? AND u.role = ?`,
            [email, role]
        );

        if (rows.length === 0) return notFound(res, 'Account not found');
        const user = rows[0];

        // 2. Check Lockout Status
        if (user.lock_until && new Date() < new Date(user.lock_until)) {
            const mins = Math.ceil((new Date(user.lock_until) - new Date()) / 60000);
            return error(res, `Account locked due to multiple failed attempts. Try again in ${mins} minutes.`, 403);
        }

        // 3. Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            const attempts = (user.login_attempts || 0) + 1;
            if (attempts >= 5) {
                const lockoutTime = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
                await pool.execute('UPDATE Users SET login_attempts = ?, lock_until = ? WHERE user_id = ?', [attempts, lockoutTime, user.user_id]);
                return error(res, 'Too many failed attempts. Account locked for 30 minutes.', 403);
            } else {
                await pool.execute('UPDATE Users SET login_attempts = ? WHERE user_id = ?', [attempts, user.user_id]);
                return unauthorized(res, `Invalid password. ${5 - attempts} attempts remaining.`);
            }
        }

        // 4. Success Reset + Status Checks
        if (!user.is_approved) {
            return error(res, `Account pending approval.`, 403, { status: 'Pending' });
        }
        if (!user.is_active) {
            return error(res, 'Account is deactivated.', 403);
        }

        // Reset attempts
        await pool.execute('UPDATE Users SET login_attempts = 0, lock_until = NULL, last_login = NOW() WHERE user_id = ?', [user.user_id]);

        // Generate tokens
        const payload = { user_id: user.user_id, role: user.role, entity_id: user.entity_id };
        const accessToken = generateAccessToken(payload);
        const refreshTokenVal = generateRefreshToken({ user_id: user.user_id, role: user.role });

        return success(res, {
            user_id: user.user_id,
            token: accessToken,
            refresh_token: refreshTokenVal,
            role: user.role,
            entity_id: user.entity_id,
            name: user.display_name,
            redirect: `/${user.role === 'bloodbank' ? 'bloodbank' : user.role}/dashboard`,
        }, 'Login successful');

    } catch (err) { next(err); }
}

// ═══════════════════════════════════════════
// 5. SEND OTP
// POST /api/auth/send-otp
// ═══════════════════════════════════════════

async function sendOTP(req, res, next) {
    try {
        const { phone } = req.body;
        if (!phone) return error(res, 'Phone number is required', 400);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update user's OTP
        const [result] = await pool.execute(
            "UPDATE Users SET otp = ?, otp_expires = ? WHERE REPLACE(REPLACE(phone, ' ', ''), '+', '') = REPLACE(REPLACE(?, ' ', ''), '+', '')",
            [otp, expires, phone]
        );

        if (result.affectedRows === 0) return notFound(res, 'Phone number not registered');

        // Log OTP for testing (no real SMS)
        console.log(`📱 OTP for ${phone}: ${otp}`);

        return success(res, {
            message: 'OTP sent successfully',
            expires_in: 300,
            otp_preview: otp, // For testing only
        });

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 6. VERIFY OTP
// POST /api/auth/verify-otp
// ═══════════════════════════════════════════

async function verifyOTP(req, res, next) {
    try {
        const { phone, otp } = req.body;
        const missing = validate({ phone, otp });
        if (missing) return error(res, missing, 400);

        // Find user
        const [rows] = await pool.execute(
            "SELECT user_id, otp, otp_expires FROM Users WHERE REPLACE(REPLACE(phone, ' ', ''), '+', '') = REPLACE(REPLACE(?, ' ', ''), '+', '')",
            [phone]
        );

        if (rows.length === 0) return notFound(res, 'Phone not registered');

        const user = rows[0];

        // Check OTP matches
        if (user.otp !== otp) return unauthorized(res, 'Invalid OTP');

        // Check OTP not expired
        if (new Date() > new Date(user.otp_expires)) {
            return unauthorized(res, 'OTP expired. Request a new one.');
        }

        // Clear OTP + activate
        await pool.execute(
            "UPDATE Users SET otp = NULL, otp_expires = NULL, is_active = TRUE WHERE REPLACE(REPLACE(phone, ' ', ''), '+', '') = REPLACE(REPLACE(?, ' ', ''), '+', '')",
            [phone]
        );

        return success(res, {
            verified: true,
            message: 'Phone verified successfully',
        });

    } catch (err) {
        next(err);
    }
}

// ═══════════════════════════════════════════
// 6b. OTP LOGIN (Passwordless)
// POST /api/auth/otp-login
// ═══════════════════════════════════════════
async function otpLogin(req, res, next) {
    try {
        const { phone, otp, role } = req.body;
        const missing = validate({ phone, otp, role });
        if (missing) return error(res, missing, 400);

        // 1. Find user by phone and role
        const [rows] = await pool.execute(
            `SELECT u.*,
             CASE u.role
               WHEN 'donor'     THEN d.name
               WHEN 'hospital'  THEN h.hospital_name
               WHEN 'bloodbank' THEN b.bank_name
               WHEN 'admin'     THEN 'Admin Kerala'
             END AS display_name
           FROM Users u
           LEFT JOIN Donor d       ON u.entity_id = d.donor_id
           LEFT JOIN Hospital h    ON u.entity_id = h.hospital_id
           LEFT JOIN Blood_Bank b  ON u.entity_id = b.bank_id
           WHERE REPLACE(REPLACE(u.phone, ' ', ''), '+', '') = REPLACE(REPLACE(?, ' ', ''), '+', '') AND u.role = ?`,
            [phone, role]
        );

        if (rows.length === 0) return notFound(res, 'Account not found for this role');
        const user = rows[0];

        // 2. Verify OTP
        if (!user.otp || user.otp !== otp) {
            return unauthorized(res, 'Invalid OTP');
        }
        if (new Date() > new Date(user.otp_expires)) {
            return unauthorized(res, 'OTP expired. Please request a new one.');
        }

        // 3. Status checks
        if (!user.is_approved) {
            return error(res, 'Account pending approval.', 403, { status: 'Pending' });
        }
        if (!user.is_active) {
            return error(res, 'Account is deactivated.', 403);
        }

        // 4. Reset attempts + clear OTP
        await pool.execute(
            'UPDATE Users SET otp = NULL, otp_expires = NULL, login_attempts = 0, last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        // 5. Generate ACCESS TOKEN ONLY (no refresh token for this mode)
        const accessToken = generateAccessToken({
            user_id: user.user_id,
            role: user.role,
            entity_id: user.entity_id
        });

        return success(res, {
            token: accessToken,
            user_id: user.user_id,
            role: user.role,
            entity_id: user.entity_id,
            name: user.display_name,
            redirect: '/' + (user.role === 'bloodbank' ? 'bloodbank' : user.role) + '/dashboard',
        }, 'OTP Login successful');

    } catch (err) { next(err); }
}


// ═══════════════════════════════════════════
// 7. FORGOT PASSWORD
// POST /api/auth/forgot-password
// ═══════════════════════════════════════════

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) return error(res, 'Email is required', 400);

        // Generate reset OTP (6-digit)
        const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Update user (if exists) — don't reveal if email doesn't exist
        const [result] = await pool.execute(
            'UPDATE Users SET otp = ?, otp_expires = ? WHERE email = ?',
            [resetOTP, expires, email]
        );

        // Log for testing
        if (result.affectedRows > 0) {
            console.log(`🔑 Reset OTP for ${email}: ${resetOTP}`);
        }

        // Always return 200 (security: don't reveal if email exists)
        return success(res, {
            message: 'Reset OTP sent to email',
            otp_preview: result.affectedRows > 0 ? resetOTP : undefined,
        });

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 8. RESET PASSWORD
// POST /api/auth/reset-password
// ═══════════════════════════════════════════

async function resetPassword(req, res, next) {
    let conn;
    try {
        const { email, otp, new_password } = req.body;
        const missing = validate({ email, otp, new_password });
        if (missing) return error(res, missing, 400);
        if (new_password.length < 6) return error(res, 'Password must be at least 6 characters', 400);

        // Find user
        const [rows] = await pool.execute(
            'SELECT user_id, otp, otp_expires FROM Users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) return notFound(res, 'Email not found');

        const user = rows[0];

        // Check OTP
        if (user.otp !== otp) return unauthorized(res, 'Invalid OTP');
        if (new Date() > new Date(user.otp_expires)) {
            return unauthorized(res, 'OTP expired. Request a new one.');
        }

        // Hash new password
        const newHash = await bcrypt.hash(new_password, 10);

        // Transaction
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Update password + clear OTP
        await conn.execute(
            'UPDATE Users SET password_hash = ?, otp = NULL, otp_expires = NULL WHERE email = ?',
            [newHash, email]
        );

        // Audit log
        await auditLog(conn, {
            user_id: user.user_id, user_name: null, role: null,
            action: 'PASSWORD_RESET', entity: 'Users', entity_id: user.user_id,
            detail: `Password reset for: ${email}`, ip: req.ip, severity: 'Info',
        });

        await conn.commit();
        conn.release();

        return success(res, {
            message: 'Password reset successful. Please login.',
        });

    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}


// ═══════════════════════════════════════════
// 9. REFRESH TOKEN
// POST /api/auth/refresh-token
// ═══════════════════════════════════════════

async function refreshToken(req, res, next) {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) return error(res, 'Refresh token is required', 400);

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refresh_token);
        } catch (err) {
            return unauthorized(res, 'Invalid refresh token');
        }

        // Check user still exists + is active
        const [rows] = await pool.execute(
            'SELECT user_id, role, entity_id, is_active, is_approved FROM Users WHERE user_id = ?',
            [decoded.user_id]
        );

        if (rows.length === 0) return unauthorized(res, 'User no longer exists');

        const user = rows[0];
        if (!user.is_active) return unauthorized(res, 'Account is deactivated');

        // Generate new access token
        const newAccessToken = generateAccessToken({
            user_id: user.user_id,
            role: user.role,
            entity_id: user.entity_id,
        });

        return success(res, {
            token: newAccessToken,
        }, 'Token refreshed');

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 10. LOGOUT
// POST /api/auth/logout
// ═══════════════════════════════════════════

async function logout(req, res, next) {
    try {
        // Audit log if user is authenticated
        if (req.user) {
            const conn = await pool.getConnection();
            await auditLog(conn, {
                user_id: req.user.user_id, user_name: null, role: req.user.role,
                action: 'LOGOUT', entity: 'Users', entity_id: req.user.user_id,
                detail: 'User logged out', ip: req.ip, severity: 'Info',
            });
            conn.release();
        }

        return success(res, {
            message: 'Logged out successfully',
        });

    } catch (err) {
        next(err);
    }
}


// ═══════════════════════════════════════════
// 11. GET ME
// GET /api/auth/me  (requires protect)
// ═══════════════════════════════════════════

async function getMe(req, res, next) {
    try {
        const { user_id, role, entity_id } = req.user;
        let profile;

        if (role === 'donor') {
            const [rows] = await pool.execute(
                `SELECT d.*, u.email, u.last_login
         FROM Donor d
         JOIN Users u ON u.entity_id = d.donor_id
         WHERE d.donor_id = ?`,
                [entity_id]
            );
            profile = rows[0];

        } else if (role === 'hospital') {
            const [rows] = await pool.execute(
                `SELECT h.*, u.email, u.last_login
         FROM Hospital h
         JOIN Users u ON u.entity_id = h.hospital_id
         WHERE h.hospital_id = ?`,
                [entity_id]
            );
            profile = rows[0];

        } else if (role === 'bloodbank') {
            const [rows] = await pool.execute(
                `SELECT b.*, u.email, u.last_login
         FROM Blood_Bank b
         JOIN Users u ON u.entity_id = b.bank_id
         WHERE b.bank_id = ?`,
                [entity_id]
            );
            profile = rows[0];

        } else if (role === 'admin') {
            const [rows] = await pool.execute(
                `SELECT u.user_id, u.email, u.role, u.last_login, 'Admin Kerala' AS name
         FROM Users u
         WHERE u.user_id = ?`,
                [user_id]
            );
            profile = rows[0];
        }

        if (!profile) return notFound(res, 'Profile not found');

        return success(res, {
            ...profile,
            user_id,
            role,
            entity_id,
        });

    } catch (err) {
        next(err);
    }
}


// 11. REAPPLY (Clear rejected application to allow re-registration)
async function reapply(req, res, next) {
    let conn; try {
        const { email } = req.body; if (!email) return error(res, 'email required', 400);
        const [u] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
        if (!u.length) return notFound(res, 'Account not found');
        const user = u[0];

        if (user.is_approved) return error(res, 'Account already approved', 400);

        let status = 'Pending';
        if (user.role === 'hospital') {
            const [h] = await pool.execute('SELECT status FROM Hospital WHERE hospital_id = ?', [user.entity_id]);
            if (h[0]) status = h[0].status;
        } else if (user.role === 'bloodbank') {
            const [b] = await pool.execute('SELECT status FROM Blood_Bank WHERE bank_id = ?', [user.entity_id]);
            if (b[0]) status = b[0].status;
        }

        if (status.toLowerCase() !== 'rejected') return error(res, 'Only rejected applications can reapply', 400);

        conn = await pool.getConnection();
        await conn.beginTransaction();

        let prevData = { user };

        // Fetch details before deletion
        if (user.role === 'hospital') {
            const [h] = await conn.execute('SELECT * FROM Hospital WHERE hospital_id = ?', [user.entity_id]);
            prevData.entity = h[0];
            await conn.execute('DELETE FROM Hospital WHERE hospital_id = ?', [user.entity_id]);
        } else if (user.role === 'bloodbank') {
            const [b] = await conn.execute('SELECT * FROM Blood_Bank WHERE bank_id = ?', [user.entity_id]);
            prevData.entity = b[0];
            await conn.execute('DELETE FROM Blood_Bank WHERE bank_id = ?', [user.entity_id]);
        }

        await conn.execute('DELETE FROM Users WHERE user_id = ?', [user.user_id]);

        // Audit log (inside transaction)
        await auditLog(conn, {
            user_id: user.user_id, user_name: null, role: user.role,
            action: 'REAPPLIED', entity: user.role, entity_id: user.entity_id,
            detail: `User cleared rejected ${user.role} application to re-register`, ip: req.ip
        });

        await conn.commit();
        conn.release();
        return success(res, prevData, 'Application cleared successfully. You can now register again.');
    } catch (err) {
        if (conn) { await conn.rollback(); conn.release(); }
        next(err);
    }
}

module.exports = {
    registerDonor,
    registerHospital,
    registerBloodBank,
    login,
    sendOTP,
    verifyOTP,
    otpLogin,
    forgotPassword,
    resetPassword,
    refreshToken,
    logout,
    getMe,
    reapply
};
