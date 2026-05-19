# HEM∆ — Kerala Blood Management Network

HEM∆ is a premium, real-time blood management platform designed to streamline the lifecycle of blood products from donation to transfusion. It connects donors, hospitals, and blood banks through a unified, high-performance interface.

---

## 🏗 Repository Structure

This repository is a monorepo containing both the backend and frontend of the HEM∆ platform.

- **`backend/`**: Node.js + Express API with MySQL database. Handles authentication, role-based access control, health checks, inventory, and analytics.
- **`frontend/`**: React 18 (Vite) application with premium animations, charts, and a responsive dark-mode interface.

---

## 🚀 Quick Start

### 1. Database Setup
Ensure you have MySQL installed and running.
```bash
cd backend
# Create .env from template
cp .env.example .env 
# Initial setup
npm install
npm run db:schema
npm run db:seed
```

### 2. Run Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18+ (Vite)
- **Styling:** Vanilla CSS (CSS Variables) + Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** Custom Hooks (useFetch, useApi)

### Backend
- **Runtime:** Node.js (Express)
- **Database:** MySQL 8.0
- **Auth:** JWT (Access + Refresh Tokens)
- **Security:** Helmet, CORS, Rate Limiting, Input Validation

---

## 🎨 Design System

We use a specific "Dark Premium" design language:
- **Red (Primary):** `#D90025`
- **Background:** `#0A0A12`
- **Card Background:** `#0F0F17`
- **Typography:** Satoshi (Headings) & Inter (Body)
- **Animations:** Fluid page transitions and micro-interactions powered by Framer Motion.

---

## 📈 Roadmap

- [x] Phase 1-5: Portal UI Development (Admin, Donor, Hospital, Blood Bank)
- [x] Phase 6: Admin Portal & System Settings Core
- [x] Phase 7: Backend API Development (111+ Endpoints)
- [x] Phase 8: Strategic API Integration (Admin Module)
- [ ] Phase 9: Real-time Notification System (WebSockets)
- [ ] Phase 10: Mobile Application Expansion

---

© 2026 HEM∆ Network. Designed for Kerala Healthcare.
