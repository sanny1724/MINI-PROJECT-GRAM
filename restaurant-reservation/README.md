# GourmetTable - Restaurant Reservation Management System

A production-ready, full-stack Restaurant Seating & Reservation Management System built with React (Vite), Node.js, Express, MongoDB, and Tailwind CSS. It features JWT security, role-based controls, and a custom capacity-aware table allocation engine.

---

## 🚀 Key Features

- **Intelligent Table Allocation**: Customers provide guest counts, and the system automatically matches the smallest suitable active table.
- **Double Booking Guard**: Slot overlaps (calculated down to conflict minutes) are blocked in real-time.
- **Dynamic Cockpit Dashboard**: 
  - **Admin**: Track today's bookings count, current available tables, all-time cancelled counts, and registered customers. Scopes ledger records via date selection.
  - **Customer**: Manage current active sessions, cancel reservations, review previous visits, and submit new reservations.
- **Table Registry Control**: Create, update seat sizes, toggle active status, and hard delete tables with confirmation dialogs.
- **Zero-Setup Seeding**: Quick database bootstrap script to load 1 Admin account and 15 default tables.

---

## 🛠️ Technology Stack

### Backend
- **Node.js + Express.js** (REST API)
- **MongoDB + Mongoose** (Data schemas & model constraints)
- **JWT (JSON Web Tokens)** (Session authentications)
- **bcryptjs** (Hashing keys)
- **express-validator** (Request parameters validations)
- **Helmet & CORS** (Security headers)
- **express-rate-limit** (DOS throttling)

### Frontend
- **React (Vite SPA)**
- **React Router DOM v6** (Authentication route guards)
- **Axios** (API requests with automatic token headers)
- **Tailwind CSS v3** (Custom copper brand layout design)
- **React Hook Form** (Form validations)
- **React Toastify** (System notifications)
- **Lucide React** (Modern line iconography)

---

## 📁 Project Structure

```
restaurant-reservation/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx      # Admin guard
│   │   │   ├── ProtectedRoute.jsx  # Customer guard
│   │   │   ├── Navbar.jsx          # Dynamic Header
│   │   │   ├── ReservationCard.jsx # Seating ledger card
│   │   │   └── ReservationForm.jsx # Booking inputs validation
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx     # Session provider
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Landing page
│   │   │   ├── Login.jsx           # User login forms
│   │   │   ├── Register.jsx        # Account registration
│   │   │   ├── Dashboard.jsx       # Workspace director
│   │   │   ├── CustomerDashboard.jsx# Customer log metrics
│   │   │   ├── AdminDashboard.jsx  # Admin cockpit metrics
│   │   │   ├── CreateReservation.jsx# Booking forms page
│   │   │   ├── Reservations.jsx    # Seating log listings
│   │   │   ├── ManageTables.jsx    # Table CRUD cockpit
│   │   │   ├── Profile.jsx         # User identity profile
│   │   │   └── NotFound.jsx        # 404 client handler
│   │   ├── services/
│   │   │   └── api.js              # Axios instance
│   │   ├── App.jsx                 # Routing config
│   │   ├── index.css               # CSS styling variables
│   │   └── main.jsx                # React mount point
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/
│   │   └── db.js                   # Mongoose configuration
│   ├── controllers/
│   │   ├── adminController.js      # Statistics & log logs
│   │   ├── authController.js       # Register, login, profiles
│   │   ├── reservationController.js# Customer booking logs
│   │   └── tableController.js      # Seating configurations
│   ├── middlewares/
│   │   ├── auth.js                 # Authentication verify
│   │   ├── error.js                # Centralized error handler
│   │   └── validation.js           # express-validator constraints
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Table.js                # Table schema
│   │   └── Reservation.js          # Reservation schema
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── reservationRoutes.js
│   │   └── tableRoutes.js
│   ├── seed/
│   │   └── seeder.js               # Auto-setup seeder
│   ├── services/
│   │   └── reservationService.js   # Allocation algorithm
│   ├── utils/
│   │   └── timeHelper.js           # Minute conversion & overlaps
│   ├── app.js                      # Express middleware
│   ├── server.js                   # Node.js bootstrap entry
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## ⚡ Reservation Logic & Seating Algorithm

### Capacity Matching
When a reservation request is received (with `guestCount`, `reservationDate`, `startTime`, and `endTime` parameters):
1. **Find Candidate Tables**: Fetch active tables (`isActive: true`) where table capacity is greater than or equal to the requested guest count (`capacity >= guestCount`).
2. **Ascending Optimization**: Sort these candidates by `capacity` ascending. This ensures the customer is assigned to the smallest table that can host them, leaving larger tables open for larger parties.
3. **Collision Detection**: For each candidate table, check for overlapping bookings on the target date.
4. **Allocation**: Assign the first table in the sorted list that has no slot conflicts. If no table is conflict-free, return: `"No tables available for selected slot"`.

### Time Overlap Logic
Times are converted to minutes from midnight (`HH:MM` $\to$ `Hours * 60 + Minutes`). Two booking slots `[start1, end1]` and `[start2, end2]` overlap if:
$$\text{start1} < \text{end2} \quad \text{AND} \quad \text{end1} > \text{start2}$$
Adjacent bookings (e.g. `10:00 - 11:00` and `11:00 - 12:00`) do **not** overlap because the end of the first slot matches the start of the second, allowing back-to-back table seatings.

---

## 🔑 REST API Routes

### Authentication
- `POST /api/auth/register` - Create customer account.
- `POST /api/auth/login` - Authenticate account and retrieve JWT session.
- `GET /api/auth/profile` - Verify current logged-in identity profile.

### Reservations
- `POST /api/reservations` - Book a table slot (automatic table allocation).
- `GET /api/reservations/my` - Fetch booking logs of logged-in customer.
- `DELETE /api/reservations/:id` - Cancel a reservation (releases table).

### Admin Tools
- `GET /api/admin/reservations` - List all reservations.
- `GET /api/admin/reservations/date/:date` - Scopes reservations list by date (YYYY-MM-DD).
- `PUT /api/admin/reservations/:id` - Edit any booking detail (re-allocates table).
- `DELETE /api/admin/reservations/:id` - Hard deletes a booking from database.
- `GET /api/admin/dashboard/stats` - Fetch real-time dashboard aggregates.

### Seating Tables
- `GET /api/tables` - Fetch list of all tables.
- `POST /api/tables` - Create a table (Admin only).
- `PUT /api/tables/:id` - Modify table capacity or isActive flag (Admin only).
- `DELETE /api/tables/:id` - Delete table from collection (Admin only).

---

## 💻 Local Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Local or Atlas cloud cluster)

### Step 1: Configure Backend Environment
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Create `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` values (e.g. `MONGODB_URI` and `JWT_SECRET`).

### Step 2: Seed the Database
Seed the database with 1 Admin account, 1 Demo Customer account, and 15 dining tables:
```bash
npm run seed
```
**Default Credentials:**
- **Admin**: `admin@gmail.com` / `Admin@123`
- **Customer**: `customer@gmail.com` / `Customer@123`

### Step 3: Run the Services
1. **Start Backend Server** (runs on port 5000):
   ```bash
   cd server
   npm run dev
   ```
2. **Start Frontend Client** (runs on port 5173):
   ```bash
   cd client
   npm run dev
   ```

Open `http://localhost:5173` in your browser.

---

## ☁️ Cloud Deployment

### Backend (Render)
1. Set up a Web Service on Render linking your repository.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://...` (Atlas Connection String)
   - `JWT_SECRET` = `your_production_secret_key`
   - `CLIENT_URL` = `https://your-frontend-vercel-domain.vercel.app`

### Frontend (Vercel)
1. Create a Project on Vercel and import your client folder.
2. Root Directory: `client`
3. Framework Preset: `Vite`
4. Configure Build Command: `npm run build`
5. Configure Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-render-domain.onrender.com/api`
