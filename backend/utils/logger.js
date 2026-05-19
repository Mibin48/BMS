/**
 * HEM∆ — Logger Utility
 * Colored console logger with timestamps and levels
 */
const c = (code, text) => `\x1b[${code}m${text}\x1b[0m`;
const ts = () => c('90', new Date().toISOString());

const logger = {
    info: (msg, data) => console.log(`${ts()} ${c('32', '[INFO]')} ${msg}`, data || ''),
    warn: (msg, data) => console.log(`${ts()} ${c('33', '[WARN]')} ${msg}`, data || ''),
    error: (msg, data) => console.error(`${ts()} ${c('31', '[ERROR]')} ${msg}`, data || ''),
    db: (msg) => console.log(`${ts()} ${c('34', '[DB]')} ${msg}`),
    auth: (msg) => console.log(`${ts()} ${c('1', '[AUTH]')} ${msg}`),
    success: (msg) => console.log(`${ts()} ${c('32', '[✓]')} ${msg}`),
};

module.exports = { logger };
