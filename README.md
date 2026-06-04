# 🩸 HEM∆ — Kerala Blood Management Network

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-blue.svg)](https://nodejs.org)
[![Database](https://img.shields.io/badge/database-MySQL%208.0-orange.svg)](#)
[![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-lightblue.svg)](https://react.dev)
[![UX Styling](https://img.shields.io/badge/UX-Premium%20Dark--Mode-critical.svg)](#)

HEM∆ is a premium, real-time enterprise blood management platform engineered to optimize and secure the lifecycle of blood products from initial donor screening to final clinical transfusion. By integrating real-time analytics, automated inventory routing, and responsive dashboard networks, HEM∆ bridges the critical gap between **Donors**, **Hospitals**, and **Blood Banks** across Kerala.

---

## 🏗 System Architecture & Repository Layout

HEM∆ is structured as a unified monorepo for maximum build efficiency and isolated deployment.

```
bms-root/
│
├── backend/                 # Express REST API & Database Controller
│   ├── config/              # Database pool & socket config
│   ├── controllers/         # Core controller modules (Admin, Blood Bank, Donor, Hospital)
│   ├── db/                  # SQL schema scripts, seeds, and triggers
│   ├── middleware/          # JWT authenticators, RBAC guards, and security limiters
│   ├── routes/              # Express routing modules
│   └── server.js            # Express application bootstrap
│
├── frontend/                # Vite + React Client SPA
│   ├── src/
│   │   ├── components/      # UI component library (Skeletons, Steppers, Badges)
│   │   ├── context/         # React Auth context & global state wrappers
│   │   ├── hooks/           # useFetch and useApi abstraction hooks
│   │   ├── pages/           # Role-based dashboards (Admin, Donor, Hospital, Blood Bank)
│   │   └── services/        # Service API handlers (axios integration)
│   └── vite.config.js       # Vite build configurations
│
├── run-dev.bat              # Windows-optimized dev server launcher
└── package.json             # Root NPM command runner configuration
```

---

## 🛠 Tech Stack

### Frontend Client
- **Core Engine:** React 18+ (Vite SPA)
- **State Management:** Custom Hook layer (`useFetch` for declarative fetching, `useApi` for operations)
- **UI & Animations:** Vanilla CSS Custom Properties (CSS variables) + Framer Motion (micro-animations, page transitions, shimmers)
- **Visual Skeletons:** High-fidelity custom loader components (`BBListSkeleton`, `BBSkeleton`, `SkeletonLine`) to minimize Layout Shift (CLS)
- **Data Visualization:** Recharts (Inventory density charts, donation frequency trends)
- **Icons:** Lucide React

### Backend API
- **Runtime Environment:** Node.js + Express
- **Database Engine:** MySQL 8.0 (utilizing connection pools and trigger routines)
- **Real-time Engine:** Socket.io (real-time notification broadcasts and synchronization)
- **Security Infrastructure:** Helmet.js (HTTP security headers), CORS policies, Express-Rate-Limit (DDOS protection), and Express-Validator (input sanitization)
- **Authentication:** Dual-token JWT (Access + Refresh tokens securely handled)

---

## 🚀 Installation & Local Development

We have simplified local development. You do not need to run separate commands inside each subdirectory.

### Prerequisite Checklist
* Node.js version 20.0.0 or higher
* MySQL 8.0 Server running and accessible
* Ports `5000` (Backend) and `5173` (Frontend) available

### 1. Environment Configurations
Configure your environmental variables:
* Copy `./backend/.env.example` to `./backend/.env` and update with your MySQL credentials, database name, and JWT secrets.

### 2. Isolated NPM Installation
Install all backend, frontend, and development dependencies in a single step from the root directory:
```bash
# Installs root script dependencies and triggers installation in subfolders
npm install
```

### 3. Initialize the Database Schema & Seed Data
Execute database commands directly through the backend workspace:
```bash
# Runs from project root directory
npm run db:reset --prefix backend
```

### 4. Running the Development Servers

#### Option A: Joint Terminal Console (Cross-Platform)
Run this command from the root of the project to concurrently launch both the API server (nodemon) and Vite client:
```bash
npm run dev
```
* The backend will spin up on **`http://localhost:5000`**
* The frontend client will spin up on **`http://localhost:5173`**

#### Option B: Windows-Optimized Launcher (Separate Windows)
If you are on Windows and want to track the console logs of the frontend and backend in separate, cleanly-titled cmd windows, simply double-click or run:
```cmd
.\run-dev.bat
```

---

## 🎨 Design System

HEM∆ employs a curated, premium dark-mode design system optimized for clinical readability and visual depth:

* **Primary Red (Clinical Accent):** `#D90025`
* **Root Background:** `#0A0A12` (deep obsidian black)
* **Card & Section Backgrounds:** `#0F0F17` (curated dark gray with `1px solid rgba(255,255,255,0.06)` borders)
* **Typography:** Satoshi (Headings, modern geometric sans) & Inter (Body, high legibility)
* **Visual States:** Smooth glassmorphic layouts, animated linear beams, and custom shimmers matching exact component hierarchies.

---

## 🔒 Security & Validation Infrastructure

HEM∆ enforces rigorous production-ready security patterns at the API boundaries:

1. **Role-Based Access Control (RBAC):** Middleware checks verify incoming JWT claims, guarding routes strictly by role (`Admin`, `Donor`, `Hospital`, `Blood Bank`).
2. **Double-Token Auth:** Standard authentication uses short-lived Access Tokens paired with secure Refresh Tokens.
3. **Database Validation:** Strict constraints, MySQL triggers, and foreign keys guarantee that:
   * Stock amounts cannot fall below 0.
   * Blood banks cannot register duplicate donors.
   * Donors must undergo a validated eligibility check before scheduling appointments.
4. **API Safety:** Inputs are sanitized and schema-validated using `express-validator` to block SQL injection and Cross-Site Scripting (XSS) vectors.

---

## 🗺 Operational Roadmaps

- [x] **Phase 1-5:** Portal UI Implementations (Universal, Admin, Donor, Hospital, Blood Bank dashboards)
- [x] **Phase 6:** Admin Portal & Settings Core
- [x] **Phase 7:** Backend Express API (111+ Endpoints)
- [x] **Phase 8:** Junction Table Database Migration (`blood_bank_donor` mapping table for walk-ins)
- [x] **Phase 9:** Premium Skeleton Loader Integration (Eliminating CLS across profiles, inventories, and lists)
- [ ] **Phase 10:** Multi-Regional Inventory Sharing Protocols
- [ ] **Phase 11:** Progressive Web App (PWA) Offline Syncing

---

© 2026 HEM∆ Network. All Rights Reserved. Engineered for excellence in healthcare.
