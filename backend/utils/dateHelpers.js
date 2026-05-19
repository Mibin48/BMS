/**
 * ═══════════════════════════════════════════
 * HEM∆ — Date Helper Utilities
 * ═══════════════════════════════════════════
 */

/**
 * Add days to a date and return YYYY-MM-DD string.
 */
const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

/**
 * Get the number of days between two dates.
 */
const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d2 - d1;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Format a date to YYYY-MM-DD string.
 */
const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
};

/**
 * Build a 12-month chart array from query rows.
 * Each row should have { month: 1-12, ml: number }.
 */
const buildMonthlyChart = (rows) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = {};
    rows.forEach((r) => {
        map[r.month] = r.ml || 0;
    });
    return months.map((m, i) => ({
        month: m,
        ml: map[i + 1] || 0,
    }));
};

module.exports = { addDays, daysBetween, formatDate, buildMonthlyChart };
