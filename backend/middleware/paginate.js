/**
 * HEM∆ — Pagination Middleware
 */
const paginate = (req, res, next) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const page = Math.floor(offset / limit) + 1;
    req.pagination = { limit, offset, page };
    next();
};

const paginatedResponse = (res, data, total, pagination, message = 'Success') => {
    const { limit, offset, page } = pagination;
    const total_pages = Math.ceil(total / limit);
    res.json({
        success: true, message, data,
        pagination: { total, limit, offset, page, total_pages, has_next: offset + limit < total, has_prev: offset > 0 }
    });
};

module.exports = { paginate, paginatedResponse };
