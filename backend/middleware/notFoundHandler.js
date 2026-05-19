/**
 * HEM∆ — 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        hint: 'Check /api/health for status'
    });
};

module.exports = { notFoundHandler };
