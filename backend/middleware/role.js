/**
 * HEM∆ — Role Authorization Middleware
 * Usage: authorize('admin', 'hospital')
 */

const { forbidden } = require('../utils/response');

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return forbidden(res, `Access denied. Required roles: ${roles.join(', ')}`);
        }
        next();
    };
}

module.exports = { authorize };
