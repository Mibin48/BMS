# 🩸 HEM∆ Backend API — Core Engine (v1.0.0)

HEM∆ Backend is a secure, high-performance REST API and Socket.io gateway designed to coordinate blood supply operations across Kerala. It enforces role-based access control, tracks real-time inventory adjustments via SQL triggers, and records administrative actions inside a secure audit ledger.

---

## 🛠 Tech Stack & Libraries

* **Runtime:** Node.js + Express.js
* **Database Engine:** MySQL 8.0 (utilizing `mysql2/promise` connection pooling)
* **Realtime Communication:** Socket.io
* **Security & Hardening:** 
  * `helmet` for secure HTTP headers.
  * `cors` with origin whitelisting.
  * `express-rate-limit` for rate limiting (auth routes capped at 100 requests per 15 minutes).
  * `hpp` for HTTP Parameter Pollution protection.
  * `bcryptjs` for high-entropy password hashing.
  * `express-validator` for request validation.
* **Logging & Auditing:** Custom MySQL-backed database logger for core administrative activities.

---

## 🏗 Directory Architecture

```
backend/
├── config/                  # Server configuration engines
│   ├── db.js                # MySQL connection pool configuration
│   └── socket.js            # Socket.io server configuration
│
├── controllers/             # Request handlers containing business logic
│   ├── admin.controller.js  # Approvals, system configurations, and statistics
│   ├── auth.controller.js   # JWT authentication & session refresh
│   ├── bloodbank.controller.js # Inventory, testing, and blood issuance
│   ├── donor.controller.js  # Donor schedule, vitals, and profile
│   └── hospital.controller.js # Blood requests, patient rosters, and payments
│
├── db/                      # Schema definition and database state management
│   ├── schema.sql           # Database table structural definition
│   ├── seed.sql             # Test state seeding scripts
│   └── trigger.sql          # Automated MySQL trigger procedures
│
├── middleware/              # Express request middleware
│   ├── auth.middleware.js   # JWT verification and RBAC enforcement
│   ├── error.middleware.js  # Global centralized error handler
│   └── rateLimit.middleware.js # Rate limiters for security boundaries
│
└── routes/                  # Express path routers mapped to controllers
```

---

## 🚦 Local Setup & Initialization

### 1. Pre-installation Checklist
* MySQL 8.0 server installed and running.
* Node.js version 20.0.0 or higher.

### 2. Dependency Setup
From the `backend` folder:
```bash
# Install node packages
npm install
```

### 3. Environment Setup
Create a `.env` file from the template:
```bash
cp .env.example .env
```
Fill in the configuration parameters:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bms
DB_PORT=3306
DB_SSL=false
JWT_SECRET=your_high_entropy_access_secret
JWT_REFRESH_SECRET=your_high_entropy_refresh_secret
NODE_ENV=development
```

### 4. Database Initialization
Create the database and load the schema, triggers, and seeds:
```bash
# Runs schema generation
npm run db:schema

# Runs seed population
npm run db:seed
```

### 5. Running the Dev Server
Launch the nodemon development server:
```bash
npm run dev
```
The API server will listen on `http://localhost:5000`.

---

## 🛰 Endpoints & API Modules

The API exposes **111+ endpoints** protected by Role-Based Access Control:

| Route Path | Associated Middleware | Description |
|---|---|---|
| `POST /api/auth/register` | Open | Register new Donors, Hospitals, or Blood Banks |
| `POST /api/auth/login` | Open / Rate Limited | Authenticate credentials & yield JWT access/refresh tokens |
| `POST /api/auth/refresh` | Open | Reissue access token using a valid refresh token |
| `GET /api/donor/profile` | `authMiddleware` (Donor) | Access and edit donor clinical profile |
| `GET /api/hospital/requests` | `authMiddleware` (Hospital) | Manage, query, and pay for blood requests |
| `GET /api/bloodbank/inventory` | `authMiddleware` (Blood Bank) | Access blood unit inventory levels |
| `POST /api/bloodbank/issues` | `authMiddleware` (Blood Bank) | Distribute blood units against approved hospital requests |
| `GET /api/admin/audit` | `authMiddleware` (Admin) | Retrieve chronological system-wide audit ledgers |

---

## 🔒 Security Architecture & DB Triggers

### 1. Authentication Lifecycle
* **Access Tokens:** Signed with `JWT_SECRET` and set to expire in 15 minutes. Must be attached to the `Authorization: Bearer <token>` header.
* **Refresh Tokens:** Signed with `JWT_REFRESH_SECRET` and set to expire in 7 days, allowing persistent sessions.

### 2. Transaction Integrity & SQL Triggers
HEM∆ ensures consistency at the database engine level via transactions and triggers:
* **Trigger `after_issue_insert`:** Automatically reduces the matching blood bank inventory levels when a blood issue record is registered.
* **Trigger `prevent_negative_inventory`:** Throws a SQL state exception if an issuance drops available blood units below zero.
* **Trigger `after_donation_check`:** Promotes a donor record's eligibility to standard limits upon successful health evaluation clearance.

### 3. Unified Auditing Ledger
Every critical state change (approval, registration, deletion, profile editing) triggers an entry in the `audit_log` table, recording:
* `actor_id` (Who performed the change)
* `action` (The operation performed)
* `target` (The entity affected)
* `ip_address` (Network tracking)
* `severity` (Info, Warning, Critical)

---

© 2026 Developed for HEM∆ Kerala Healthcare Network.
