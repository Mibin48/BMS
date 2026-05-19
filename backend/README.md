# 🩸 HEM∆ Kerala Blood Management System
## Backend API — v1.0.0

The core engine of the HEM∆ platform, providing high-performance, secure, and audited access to Kerala's blood management network.

### 🛠 Tech Stack
- **Runtime:** Node.js + Express.js
- **Database:** MySQL 8.0 (mysql2/promise)
- **Auth:** JWT (Short-lived Access + Long-lived Refresh tokens)
- **Security:** Helmet, CORS, Rate Limiting, HPP, Input Validation
- **Logging:** Custom Winston-based logger with MySQL audit logs

---

### 🚦 Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DB credentials (DB_HOST, DB_USER, DB_PASSWORD, etc.)

# 3. Create database
mysql -u root -p
> CREATE DATABASE Blood_Management_System;
> exit

# 4. Initialize Schema and Seed Data
npm run db:schema
npm run db:seed

# 5. Start development
npm run dev
```

### 🛰 API Summary
- **Base URL:** `http://localhost:5000/api`
- **Health:** `GET /api/health`

| Module           | Prefix             | Count | Description |
|------------------|-------------------|-------|-------------|
| Auth             | `/api/auth/*`       | 11    | Registration, Login, Token Refresh, Password Reset |
| Donor            | `/api/donor/*`      | 10    | Profile, Health History, Schedule |
| Hospital         | `/api/hospital/*`   | 20    | Requests, Patients, Billing |
| Blood Bank       | `/api/bloodbank/*`  | 26    | Stock, Donations, Issues, Testing |
| **Admin**        | `/api/admin/*`      | 42    | Dashboard, Approvals, Global Management, Audit, Reports |

---

### 🛡 Core Features

#### Admin Control Center
- **Unified Statistics:** Real-time data aggregation across the entire network (Donors, Volumes, Fulfillment).
- **Approval System:** Multi-step verification for Hospitals and Blood Banks.
- **Audit Ledger:** Every sensitive action (Deletions, Approvals, Edits) is logged with Actor ID, IP, and Severity.
- **Trend Analysis:** 6-month historical lookback for donations vs. requests.

#### Operational Integrity
- **Database Isolation:** All queries use prepared statements to prevent injection.
- **Consistency:** Transactions are used for multi-table updates (e.g., Blood Issue + Stock Update).
- **Triggers:** Automatic stock adjustments and fulfillment updates via MySQL triggers.

#### Security
- **RBAC:** Strict role checking (donor, hospital, bloodbank, admin).
- **Entropy:** Secure ID generation for all entities (e.g., DON-2025-XXXXX).
- **Validation:** 100% route coverage for body and param validation via express-validator.

---

### 📄 Documentation & Testing
- **Schema:** Available in `db/schema.sql`
- **Seeder:** Comprehensive network data in `db/seed.sql`
- **Environment:** See `.env.example` for all required keys.

---
© 2026 Developed for HEM∆ Kerala Network.
