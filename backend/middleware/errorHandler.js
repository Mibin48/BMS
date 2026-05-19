/**
 * HEM∆ — Global Error Handler
 */
const { logger } = require('../utils/logger');

const extractDupField = (msg) => {
    const match = msg.match(/for key '(.+)'/);
    if (!match) return 'unknown';
    const key = match[1];
    if (key.includes('email')) return 'email';
    if (key.includes('phone')) return 'phone';
    if (key.includes('naco')) return 'naco_number';
    if (key.includes('check_id')) return 'check_id';
    if (key.includes('request_id')) return 'request_id';
    return key;
};

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, process.env.NODE_ENV === 'development' ? err.stack : '');

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Record already exists', field: extractDupField(err.message) });
    if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ success: false, message: 'Referenced record not found' });
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ success: false, message: 'Cannot delete: record is in use' });
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') return res.status(503).json({ success: false, message: 'Database connection lost' });

    // JWT errors
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired' });

    // CORS error
    if (err.message === 'Not allowed by CORS') return res.status(403).json({ success: false, message: 'CORS policy violation' });

    // Syntax error (malformed JSON)
    if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ success: false, message: 'Invalid JSON in request' });

    // Payload too large
    if (err.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'Request body too large' });

    // Default
    res.status(err.status || 500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
};

module.exports = errorHandler;
