# 🎨 HEM∆ Frontend Client — React/Vite Application (v1.0.0)

HEM∆ Frontend is a premium, high-performance dark-mode Single Page Application (SPA) designed using React 18, Vite, and Framer Motion. It hosts interactive dashboard portals tailored to Admin, Donor, Hospital, and Blood Bank operators.

---

## 🛠 Tech Stack

* **Build Tooling:** Vite (Fast Refresh, hot-reloading dev server, optimized rollup compiler)
* **View Library:** React 18
* **Animations:** Framer Motion (facilitates custom shimmers, layout transitions, and micro-interactive elements)
* **Visualization:** Recharts (responsive inventory and analytical charts)
* **Navigation:** React Router DOM (Declarative client-side routing with protected route guards)
* **Notifications:** React Hot Toast
* **Icons:** Lucide React

---

## 🏗 Directory Architecture

```
frontend/
├── public/                  # Static assets (Kerala maps, public icons)
├── src/
│   ├── components/          # Reusable UI component library
│   │   ├── admin/           # Admin-specific layouts and sidebars
│   │   ├── bloodbank/       # Blood-badge pills, status badges, and modals
│   │   ├── SkeletonCard.jsx # Shared layout skeleton components (SkeletonTable, SkeletonStats)
│   │   └── NumberStepper.jsx# Standardized stepper controls
│   │
│   ├── context/             # Global Context Providers
│   │   └── AuthContext.jsx  # Active session tracking, token renewal, and credentials
│   │
│   ├── hooks/               # Custom state hooks
│   │   ├── useFetch.js      # Declarative, cacheable HTTP data retrieval hook
│   │   ├── useApi.js        # Declarative mutation runner (POST/PUT/DELETE)
│   │   └── useDebounce.js   # Input debouncer for server query optimizations
│   │
│   ├── pages/               # Dashboard views sorted by portal roles
│   │   ├── admin/           # 10+ panels (Audit, Inventory, Approvals)
│   │   ├── auth/            # Sign-in, sign-up, and verification steps
│   │   ├── bloodbank/       # Stock managers, screening cards, and issues
│   │   ├── donor/           # Schedules, history trackers, and find bank
│   │   └── hospital/        # Patient logs, billings, and request portals
│   │
│   ├── services/            # Axios API connection layers
│   └── utils/               # Formatting, dates, and number formatters
```

---

## 🚦 Local Setup & Run Guide

### 1. Dependency installation
Run from the `frontend` folder:
```bash
npm install
```

### 2. Configure Local environment variables
Create a `.env` file from the template:
```bash
cp .env.example .env
```
Update the API base URL parameter:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Running the client dev server
Start the Vite local environment:
```bash
npm run dev
```
The app will run on `http://localhost:5173`.

### 4. Compiling the Production Bundle
Compile and optimize the build:
```bash
npm run build
```
This writes the static bundle to `./dist/`.

---

## 🎨 Premium Dark-Mode Design System

HEM∆ employs a custom-themed dark UX layout defined via CSS variables:

### Color Tokens
* **HEM∆ Red (Clinical Primary):** `#D90025`
* **Obsidian Core Background:** `#0A0A12`
* **Translucent Surfaces:** `rgba(15,15,23,0.4)` paired with `1px solid rgba(255,255,255,0.06)` borders
* **Active Status Labels:** Green (`#22c55e`), Cooling/Pending (`#f59e0b`), Deferred/Critical (`#D90025`)

### Typography Hierarchy
* **UI Titles:** Syne (Geometric sans with deep weights)
* **Technical Labels & Data:** Satoshi (High monospace alignment)
* **General Prose:** Inter (Clean body font)

---

## ⚡ Custom Skeleton Loader System

To improve Layout Stability and keep Cumulative Layout Shift (CLS) near zero, we use targeted skeleton modules matching actual page layout profiles:

1. **`BBSkeleton` & `BBListSkeleton` ([BBSkeleton.jsx](file:///d:/BMS/frontend/src/components/bloodbank/BBSkeleton.jsx)):**
   * Creates beautiful animated shimmer lines and profile bubbles inside blood bank queues.
2. **`SkeletonStats` ([SkeletonCard.jsx](file:///d:/BMS/frontend/src/components/SkeletonCard.jsx)):**
   * Matches the visual card dimensions of statistical KPI tiles.
3. **`SkeletonTable` ([SkeletonCard.jsx](file:///d:/BMS/frontend/src/components/SkeletonCard.jsx)):**
   * Replicates tabular grids with headers, cell rows, and border-bottom guidelines to prevent content jumps.

---

## 📡 Dynamic State Management (useFetch & useApi)

Rather than heavy Redux configurations, HEM∆ leverages lightweight, declarative hooks:

### 1. Data Querying (`useFetch`)
Handles network requests, local state, error management, and dependency arrays out of the box:
```javascript
const { data, loading, error, refetch } = useFetch(
    donorService.getAppointments,
    queryParams,
    [activeFilter]
);
```

### 2. Form Submissions (`useApi`)
Encapsulates mutations, load state tracking, and error mapping:
```javascript
const { execute: submitRequest, loading: saving } = useApi(hospitalService.createRequest);

const handleSave = async () => {
    await submitRequest(formData);
    toast.success("Request submitted successfully!");
};
```

---

© 2026 Designed for HEM∆ Kerala Healthcare Network.
