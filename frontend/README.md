# 🎨 HEM∆ Kerala — Frontend Application
## Premium Blood Management Interface — v1.0.0

The frontend for the HEM∆ platform, developed with high-performance React (Vite), premium animations, and a sophisticated dark-mode design system.

### 🛠 Tech Stack
- **Framework:** React 18+ (Vite)
- **State & Logic:** Custom Hooks (`useFetch`, `useApi`, `useDebounce`)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Visualization:** Recharts
- **Routing:** React Router DOM v6
- **Notifications:** React Hot Toast

---

### 🚦 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure Environment
cp .env.example .env
# Set VITE_API_URL to http://localhost:5000/api

# 3. Start development
npm run dev
# App runs on http://localhost:5173
```

### 🛰 API Integration
- **Service Layer:** `src/services/adminService.js` and other service files.
- **Hook-based:** Components use `useFetch` for data retrieval and `useApi` for interactive actions (POST/PUT).
- **Endpoint Configuration:** Base URL is managed via `VITE_API_URL` environment variable.

---

### 🏗 Component Architecture

- **`src/components/`**: Atomic and complex reusable UI elements.
    - `admin/`: Shared layouts for the Admin Portal.
    - `StatCard/GlassCard`: Core design pillars for analytics display.
    - `SkeletonCard`: Sophisticated loading states for data-heavy views.
    - `Modal/Toast`: Global interactive feedback components.

- **`src/pages/admin/`**: 15+ Advanced management screens.
    - `AdminDashboard`: Real-time KPI aggregation and Kerala network map.
    - `AdminDonations/AdminRequests`: High-performance data tables with expanded detail views.
    - `AdminAudit`: Chronological system event ledger with severity filtering.
    - `AdminInventory`: Stock monitoring across all blood banks in the network.

- **`src/data/`**: Mock data used for frontend-only prototyping and fallback scenarios.

---

### 🎨 Design Language
- **Primary Red:** `#D90025` (HEM∆ Red)
- **Secondary Colors:** Blue (`#3b82f6`), Green (`#22c55e`), Amber (`#f59e0b`).
- **Surface:** Deep charcoal (`#0A0A12`) and translucent glass textures (`#0F0F17` @ 60%).
- **Typography:** Syne (Headings), Satoshi (UI/Data Labels), Inter (Body).

---

### 📍 Assets
- **`public/kerala-map.png`**: Used in the Admin Dashboard for visual network representation.
- **Glassmorphism:** Achieved via CSS `backdrop-filter` and `rgba` color tokens.

---
© 2026 Designed for HEM∆ Kerala Healthcare.
