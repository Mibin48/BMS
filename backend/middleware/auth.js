/**
 * HEM∆ — Auth Middleware (protect)
 * Extracts and verifies JWT from Authorization header.
 */

const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/response');

function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorized(res, 'No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return unauthorized(res, 'Token expired');
        }
        return unauthorized(res, 'Invalid token');
    }
}

module.exports = { protect };
