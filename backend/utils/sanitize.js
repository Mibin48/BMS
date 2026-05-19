/**
 * HEM∆ — Sanitization Utilities
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\0/g, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').substring(0, 1000);
};

const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
        clean[key] = typeof val === 'string' ? sanitizeString(val) : val;
    }
    return clean;
};

const sanitizeBody = (req, res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    next();
};

module.exports = { sanitizeString, sanitizeObject, sanitizeBody };
