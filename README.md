# GRAM (v1.0) — Governance Risk & Accountability Monitor

GRAM is a premium, state-of-the-art Government Digital Mission dashboard designed for statewide deployment in Telangana. It promotes village accountability, budget transparency, and AI-led risk audit operations using the official Local Government Directory (LGD) datasets.

---

## 🔗 Repository
- **GitHub Repository:** [https://github.com/sanny1724/MINI-PROJECT-GRAM.git](https://github.com/sanny1724/MINI-PROJECT-GRAM.git)

---

## 🚀 Core Features

### 1. Interactive LGD Directory & Map Search
- **Interactive SVG Map**: High-fidelity zoom path (**State → District → Mandal → Village**) rendering district boundaries and coordinates from official Telangana datasets.
- **Real-Time Autocomplete**: Instant search index of **1 State, 33 Districts, 621 Mandals, and 11,308 Villages**.
- **Risk Indicator Map**: Village map nodes highlighted with dynamic glow patterns indicating high/medium/low development indices.

### 2. Public Village Governance Dashboard
- **Scorecard Audits**: Transparent indicator scores across 5 core domains: *Water*, *Education*, *Health*, *Agriculture*, and *Governance*.
- **Procedural Metrics**: Seeded deterministically using numerical LGD codes, ensuring 100% data coverage without database storage bloat.
- **Budget Transparency**: Real-time breakdown of financial funds allocated vs. funds utilized.
- **Grievance Escalation Portal**: Citizens can log grievances that auto-route to designated administrators.

### 3. Officer & Administrative Console
- **Role-based Authentication**: Secure JWT session portal supporting Panchayat Secretaries, District Collectors, and State Admin.
- **Welfare Schemes Manager**: CRUD portal allowing officers to edit, lookup, register, and track implementation progress of local schemes.
- **Grievance Resolution Desk**: Console displaying pending village reports for action and review.

---

## 🛠️ Technology Stack

### Frontend
- **React (Vite)** with React Router (SPA routing and protected routes).
- **Axios** (API requests with automatic token headers).
- **Tailwind CSS v4** (Utility styles compiled via Vite CSS injection).
- **React Hook Form** (Client-side validation).
- **React Toastify** (Dynamic UI status notifications).
- **Lucide React** (Modern line icons).

### Backend
- **Node.js + Express** (Modular routers).
- **Prisma ORM** (Database client and schema definitions).
- **PostgreSQL** (Production data persistence).
- **JWT Authentication** (JSON Web Tokens signed for 24h sessions).
- **bcrypt** (Secure password hashing).

---

## 📁 Project Structure

```
.
├── backend/
│   ├── data/
│   │   ├── districts.xlsx  # LGD raw district lists
│   │   ├── mandals.xlsx    # LGD raw mandal lists
│   │   └── villages.xlsx   # LGD raw village lists
│   ├── prisma/
│   │   └── schema.prisma  # Prisma database schemas (PostgreSQL)
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js    # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── auth.js    # Sign up and login endpoints
│   │   │   ├── products.js # Scheme CRUD routes (mapped as products)
│   │   │   ├── dashboard.js# Aggregate KPIs & Grievance alerts
│   │   │   ├── settings.js # Panchayat office settings
│   │   │   └── lgd.js     # Public LGD directory & metrics router
│   │   ├── prisma.js      # Global Prisma client exporter
│   │   ├── seed.js        # DB officer seeding script
│   │   ├── seed_lgd.py    # Python seeding script for Excel sheets
│   │   └── server.js      # Express server entry point & CORS configuration
│   ├── package.json       # Express server configurations
│   └── .env               # Backend environment secrets
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── telangana-districts.js # Compiled district SVG path geometries
│   │   ├── components/
│   │   │   └── Layout.jsx # Workspace layout (sidebar + footer)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx # 11-section interactive GIS map portal
│   │   │   ├── PublicDashboard.jsx # Public village scorecards
│   │   │   ├── Dashboard.jsx # Officer KPI cards & stock alerts
│   │   │   ├── Login.jsx  # Toggleable officer login form
│   │   │   ├── Products.jsx # Welfare schemes CRUD table
│   │   │   └── Settings.jsx # LGD office configuration profile
│   │   ├── api.js         # Axios interceptor config
│   │   ├── App.jsx        # Routing coordinator
│   │   ├── index.css      # Custom styling & Tailwind imports
│   │   └── main.jsx       # App mounting
│   ├── package.json       # React client configurations
│   └── vite.config.js     # Vite builder & Tailwind v4 plugin
├── render.yaml            # Render blueprint for backend/Postgres
├── netlify.toml           # Netlify SPA build instructions
└── README.md              # Project documentation
```

---

## 🔑 Demo Seed Credentials

The database contains a preloaded demo Panchayat Secretary profile:
- **Email Address:** `demo@example.com`
- **Password:** `password123`
- **Assigned Village:** Ankapur, Adilabad District (LGD: 569005)

---

## 💻 Local Development Setup

### Step 1: Configure Environment Variables
Copy and rename the environment config file inside `backend/` as `.env`:
```env
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_here
DATABASE_URL="postgresql://user:password@localhost:5432/gram"
```

### Step 2: Spin Up the Backend API
1. Navigate to the `backend/` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Apply the database schemas and generate Prisma Client:
   ```bash
   npx prisma db push
   ```
3. Start the Express API server:
   ```bash
   npm run dev
   ```
The API server will listen on `http://localhost:3001` and automatically seed the database user if empty.

### Step 3: Spin Up the Frontend Client
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Boot the Vite React client:
   ```bash
   npm run dev
   ```
The web app dashboard will open at `http://localhost:5173/`.
