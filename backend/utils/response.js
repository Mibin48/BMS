/**
 * HEM∆ — Standardized API Response Helpers
 */

function success(res, data, message = 'Success', code = 200) {
    return res.status(code).json({
        success: true,
        message,
        data,
    });
}

function error(res, message = 'Bad request', code = 400, data = null) {
    return res.status(code).json({
        success: false,
        message,
        data,
    });
}

function notFound(res, message = 'Not found') {
    return res.status(404).json({
        success: false,
        message,
    });
}

function unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({
        success: false,
        message,
    });
}

function forbidden(res, message = 'Access denied') {
    return res.status(403).json({
        success: false,
        message,
    });
}

module.exports = { success, error, notFound, unauthorized, forbidden };
