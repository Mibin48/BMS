/**
 * ═══════════════════════════════════════════
 * HEM∆ — Blood Management Network API
 * Kerala Blood Management System — v1.0.0
 * ═══════════════════════════════════════════
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const pool = require('./config/db');
const { logger } = require('./utils/logger');
const { sanitizeBody } = require('./utils/sanitize');
const errorHandler = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const { paginate } = require('./middleware/paginate');

// Route imports
const authRoutes = require('./routes/auth.routes');
const donorRoutes = require('./routes/donor.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const bloodbankRoutes = require('./routes/bloodbank.routes');
const adminRoutes = require('./routes/admin.routes');
const bloodBankPublicRoutes = require('./routes/bloodbank.public.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// trust proxy for proxy-aware rate-limiting behind Render
app.set('trust proxy', 1);

// ── SECURITY HEADERS ─────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS ─────────────────────────────
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5000'].filter(Boolean);
app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true); // Postman/curl
        if (allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── HTTP PARAMETER POLLUTION ─────────
app.use(hpp());

// ── COMPRESSION ──────────────────────
app.use(compression());

// ── LOGGING ──────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── BODY PARSERS ─────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── SANITIZE REQUEST BODY ────────────
app.use(sanitizeBody);

// ── GLOBAL RATE LIMITER ──────────────
const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
    message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ── AUTH RATE LIMITER ────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20,
    message: { success: false, message: 'Too many auth attempts. Please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

const http = require('http');
const socket = require('./utils/socket');

// ── HEALTH CHECK ─────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true, message: 'HEM∆ API running',
        database: 'Blood_Management_System', version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date(),
    });
});

// ── ROUTES ───────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/blood-banks', bloodBankPublicRoutes); // Public — no auth
app.use('/api/donor', paginate, donorRoutes);
app.use('/api/hospital', paginate, hospitalRoutes);
app.use('/api/bloodbank', paginate, bloodbankRoutes);
app.use('/api/admin', paginate, adminRoutes);
app.use('/api/notifications', require('./routes/notifications'));

// ── 404 HANDLER ──────────────────────
app.use(notFoundHandler);

// ── GLOBAL ERROR HANDLER (must be last)
app.use(errorHandler);

// ── CREATE SERVER (HTTP + SOCKET.IO) ──
const server = http.createServer(app);
socket.init(server);

// ── START SERVER ─────────────────────
const startServer = async () => {
    try {
        const conn = await pool.getConnection();
        logger.db(`Connected to: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
        conn.release();

        server.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════╗
║   🩸 HEM∆  Kerala BMS Backend         ║
╠═══════════════════════════════════════╣
║  Status : Running                     ║
║  Port   : ${String(PORT).padEnd(27)} ║
║  Env    : ${(process.env.NODE_ENV || 'development').padEnd(27)} ║
║  DB     : Blood_Management_System     ║
║  Realtime: Socket.io Enabled          ║
║  Security: Helmet + CORS + Rate Limit ║
╚═══════════════════════════════════════╝
      `);
        });
    } catch (err) {
        logger.error('Startup failed:', err.message);
        process.exit(1);
    }
};

startServer();
