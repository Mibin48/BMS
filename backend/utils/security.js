/**
 * HEM∆ — Security Helpers
 */
const maskEmail = (email) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    return `${user.substring(0, 2)}***@${domain}`;
};

const maskPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})\d+(\d{4})/, '$1*****$2');
};

const sanitizeUser = (user) => {
    if (!user) return null;
    const { password_hash, otp, otp_expires, ...safe } = user;
    return safe;
};

module.exports = { maskEmail, maskPhone, sanitizeUser };
