# PLAN: Implement Current UI with MongoDB Backend

## 1. Project Overview

**Current State:** A React (Vite + TailwindCSS v4) School Equipment Management ("Quản lý Thiết bị") app with:
- 8 pages: Dashboard, Equipment, Categories, Borrow, Maintenance, Inventory, Reports, Settings
- All data is **hardcoded mock data** in `src/app/data/mock-data.ts`
- No backend, no database, no authentication
- Existing UI components using Radix UI, Recharts, Lucide icons, React Router v7

**Goal:** Replace mock data with a real **MongoDB** backend, keeping the current UI intact.

---

## 2. User Review Required

### Architecture Decision
This plan proposes a MERN stack approach (MongoDB + Express.js backend API + existing React frontend). The backend runs as a separate Express server with Mongoose ODM.

### Breaking Change
The `supabase/` directory will be deprecated. If you have any Supabase dependencies, they will be removed.

### MongoDB Hosting
You need a MongoDB instance. Options:
1. **Local MongoDB** — Install via `brew install mongodb-community` (dev only)
2. **MongoDB Atlas** (FREE tier) — Cloud-hosted, production-ready
3. **Docker** — `docker run -d -p 27017:27017 mongo:7`

**Which do you prefer?**

---

## 3. Proposed Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client (React)                │
│  Vite + TailwindCSS + React Router v7           │
│  ┌────────────────────────────────────────────┐  │
│  │ src/app/services/api.ts  (Axios/Fetch)     │  │
│  │ src/app/hooks/useEquipment.ts etc.         │  │
│  │ src/app/context/AuthContext.tsx             │  │
│  └────────────────────────────────────────────┘  │
│          ↓ HTTP REST API (localhost:5000)         │
├─────────────────────────────────────────────────┤
│               Backend (Express.js)               │
│  ┌────────────────────────────────────────────┐  │
│  │ server/                                    │  │
│  │  ├── index.ts          (entry point)       │  │
│  │  ├── config/db.ts      (MongoDB conn)      │  │
│  │  ├── models/           (Mongoose schemas)  │  │
│  │  ├── routes/           (Express routers)   │  │
│  │  ├── controllers/      (Business logic)    │  │
│  │  ├── middleware/        (auth, error)       │  │
│  │  └── seed.ts           (seed mock data)    │  │
│  └────────────────────────────────────────────┘  │
│          ↓ Mongoose ODM                          │
├─────────────────────────────────────────────────┤
│              MongoDB (port 27017)                │
│  Database: quanlythietbi                         │
│  Collections: equipment, categories, locations,  │
│  suppliers, borrow_requests, maintenance,        │
│  inventory_sessions, users, audit_logs           │
└─────────────────────────────────────────────────┘
```

---

## 4. MongoDB Schema Design

### 4.1 `equipment` Collection

```javascript
{
  _id: ObjectId,
  name: String,           // "Máy chiếu Epson EB-X51"
  code: String,           // "MC-001" (unique, indexed)
  category: ObjectId,     // ref → categories
  location: ObjectId,     // ref → locations
  status: String,         // enum: available | in-use | maintenance | disposed
  supplier: ObjectId,     // ref → suppliers
  purchaseDate: Date,
  value: Number,          // VND
  assignedTo: String,     // optional
  qrCode: String,         // auto-generated
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 `categories` Collection

```javascript
{
  _id: ObjectId,
  name: String,           // "Máy chiếu"
  description: String,
  createdAt: Date
}
// Note: `count` will be a virtual field via aggregation
```

### 4.3 `locations` Collection

```javascript
{
  _id: ObjectId,
  name: String,           // "Tòa nhà A"
  rooms: Number,
  createdAt: Date
}
// `equipment` count = aggregated from equipment collection
```

### 4.4 `suppliers` Collection

```javascript
{
  _id: ObjectId,
  name: String,           // "Epson Vietnam"
  contact: String,        // email
  phone: String,
  address: String,
  createdAt: Date
}
```

### 4.5 `borrow_requests` Collection

```javascript
{
  _id: ObjectId,
  equipment: ObjectId,    // ref → equipment
  borrower: ObjectId,     // ref → users
  borrowDate: Date,
  returnDate: Date,
  actualReturnDate: Date, // null until returned
  status: String,         // enum: pending | approved | returned | overdue | rejected
  approvedBy: ObjectId,   // ref → users
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.6 `maintenance_records` Collection

```javascript
{
  _id: ObjectId,
  equipment: ObjectId,    // ref → equipment
  type: String,           // enum: repair | inspection | calibration
  date: Date,
  cost: Number,
  status: String,         // enum: scheduled | in-progress | completed
  technician: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.7 `disposal_requests` Collection

```javascript
{
  _id: ObjectId,
  equipment: ObjectId,    // ref → equipment
  reason: String,
  originalValue: Number,
  residualValue: Number,
  status: String,         // enum: pending | approved | completed
  approvedBy: ObjectId,   // ref → users
  createdAt: Date,
  updatedAt: Date
}
```

### 4.8 `inventory_sessions` Collection

```javascript
{
  _id: ObjectId,
  name: String,           // "Kiểm kê Quý 1/2026"
  date: Date,
  location: String,       // "Toàn trường"
  totalItems: Number,
  checkedItems: Number,
  matchedItems: Number,
  mismatchedItems: Number,
  status: String,         // enum: in-progress | completed
  progress: Number,       // 0-100
  items: [{               // embedded subdocuments
    equipment: ObjectId,
    checkedAt: Date,
    matched: Boolean,
    notes: String
  }],
  createdAt: Date
}
```

### 4.9 `users` Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,          // unique, indexed
  password: String,       // bcrypt hashed
  role: String,           // enum: admin | warehouse | lecturer | director
  department: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.10 `audit_logs` Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,         // ref → users
  action: String,         // "Thêm thiết bị", "Duyệt mượn"
  detail: String,
  ipAddress: String,
  createdAt: Date         // TTL index for auto-cleanup
}
```

---

## 5. REST API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout (invalidate token) |
| GET | `/api/auth/me` | Get current user |

### Equipment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/equipment` | List all (with filters, pagination) |
| GET | `/api/equipment/:id` | Get single equipment |
| POST | `/api/equipment` | Create new |
| PUT | `/api/equipment/:id` | Update |
| DELETE | `/api/equipment/:id` | Soft delete |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all (with equipment count) |
| POST | `/api/categories` | Create |
| PUT | `/api/categories/:id` | Update |
| DELETE | `/api/categories/:id` | Delete |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | List all (with equipment count) |
| POST | `/api/locations` | Create |
| PUT | `/api/locations/:id` | Update |
| DELETE | `/api/locations/:id` | Delete |

### Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List all |
| POST | `/api/suppliers` | Create |
| PUT | `/api/suppliers/:id` | Update |
| DELETE | `/api/suppliers/:id` | Delete |

### Borrow Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/borrows` | List all (with filters) |
| POST | `/api/borrows` | Create request |
| PUT | `/api/borrows/:id` | Update |
| PATCH | `/api/borrows/:id/approve` | Approve request |
| PATCH | `/api/borrows/:id/reject` | Reject request |
| PATCH | `/api/borrows/:id/return` | Mark as returned |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/maintenance` | List all |
| POST | `/api/maintenance` | Create |
| PUT | `/api/maintenance/:id` | Update |

### Disposal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/disposals` | List all |
| POST | `/api/disposals` | Create request |
| PATCH | `/api/disposals/:id/approve` | Approve |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List sessions |
| POST | `/api/inventory` | Create session |
| PATCH | `/api/inventory/:id/check` | Check item |

### Dashboard / Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/overview` | Dashboard stats |
| GET | `/api/stats/monthly` | Monthly borrow/return |
| GET | `/api/stats/categories` | Category distribution |

### Users & Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (admin) |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| GET | `/api/audit-logs` | List audit logs |

---

## 6. Proposed Changes

### Backend (NEW - `server/` directory)

#### [NEW] server/package.json
- Express.js + TypeScript backend dependencies
- Dependencies: `express`, `mongoose`, `cors`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `express-validator`
- Dev deps: `tsx`, `@types/*`, `nodemon`

#### [NEW] server/tsconfig.json
- TypeScript config for Node.js backend

#### [NEW] server/src/index.ts
- Express app entry point, middleware setup, route mounting

#### [NEW] server/src/config/db.ts
- MongoDB connection with Mongoose, connection error handling

#### [NEW] server/src/models/*.ts
- 10 Mongoose models matching schema design above

#### [NEW] server/src/routes/*.ts
- Express routers for each resource

#### [NEW] server/src/controllers/*.ts
- Business logic handlers

#### [NEW] server/src/middleware/auth.ts
- JWT authentication middleware + role-based access control

#### [NEW] server/src/middleware/errorHandler.ts
- Global error handler

#### [NEW] server/src/seed.ts
- Seed script to populate MongoDB with existing mock data

#### [NEW] server/.env.example
- Environment variable template

---

### Frontend Modifications

#### [NEW] src/app/services/api.ts
- Centralized API client with base URL config, auth token, error handling

#### [NEW] src/app/hooks/useEquipment.ts
- Custom hook for equipment CRUD with loading/error states

#### [NEW] src/app/hooks/useBorrows.ts
- Custom hook for borrow request management

#### [NEW] src/app/hooks/useCategories.ts
- Custom hook for categories, locations, suppliers

#### [NEW] src/app/hooks/useMaintenance.ts
- Custom hook for maintenance records

#### [NEW] src/app/hooks/useStats.ts
- Custom hook for dashboard statistics

#### [NEW] src/app/hooks/useAuth.ts
- Authentication hook

#### [NEW] src/app/context/AuthContext.tsx
- Auth state management with React Context

#### [NEW] src/app/pages/LoginPage.tsx
- Login page UI

#### [MODIFY] DashboardPage.tsx
- Replace mock data imports with `useStats()` hook + loading skeletons

#### [MODIFY] EquipmentPage.tsx
- Replace mock data with `useEquipment()` hook, wire CRUD to API

#### [MODIFY] BorrowPage.tsx
- Replace mock data with `useBorrows()` hook, wire approve/reject/return

#### [MODIFY] MaintenancePage.tsx
- Replace mock data with `useMaintenance()` hook

#### [MODIFY] CategoriesPage.tsx
- Replace mock data with `useCategories()` hook, wire CRUD

#### [MODIFY] InventoryPage.tsx
- Replace mock data with API calls

#### [MODIFY] ReportsPage.tsx
- Replace mock data with `useStats()` hook

#### [MODIFY] SettingsPage.tsx
- Replace mock data with API calls

#### [MODIFY] routes.ts
- Add login route + auth guard (protected routes)

#### [MODIFY] App.tsx
- Wrap with `AuthProvider`

---

## 7. Implementation Phases

### Phase 1: Backend Foundation (Server Setup)
1. Initialize `server/` with package.json and TypeScript
2. Create Express entry point with CORS, JSON parsing
3. Set up MongoDB connection with Mongoose
4. Create all Mongoose models

### Phase 2: API Endpoints
1. Auth routes (login, me, logout)
2. Equipment CRUD
3. Categories/Locations/Suppliers CRUD
4. Borrow requests with status workflow
5. Maintenance records
6. Disposal requests
7. Inventory sessions
8. Dashboard stats aggregation
9. Users & audit logs

### Phase 3: Seed Data
1. Create seed script mapping existing mock data to MongoDB
2. Run seed to populate database

### Phase 4: Frontend Data Layer
1. Create API service layer
2. Create custom hooks for each resource
3. Create auth context

### Phase 5: Connect Pages to API
1. Dashboard → `useStats()`
2. Equipment → `useEquipment()` (CRUD)
3. Categories → `useCategories()` (CRUD)
4. Borrow → `useBorrows()` (with actions)
5. Maintenance → `useMaintenance()`
6. Inventory → API calls
7. Reports → `useStats()`
8. Settings → API calls

### Phase 6: Authentication
1. Add LoginPage
2. Add route guards
3. Add AuthContext provider

### Phase 7: Polish
1. Loading skeletons for all data pages
2. Error handling & toast notifications
3. Form validation
4. Pagination support

---

## 8. Open Questions

**Q1: MongoDB Hosting Preference?**
- Local MongoDB (brew/Docker)
- MongoDB Atlas (cloud, free tier available)
- Docker Compose (both backend + mongo together)

**Q2: Authentication Scope?**
- **MVP:** Simple JWT login only (no registration, admin creates users)
- **Full:** Registration, password reset, role management
- **Skip Auth:** No auth for now, add later

**Q3: Do you want to keep the `supabase/` directory?**
- If yes, we'll keep it but not use it
- If no, we'll remove it

**Q4: API Client preference?**
- **Fetch API** (no extra dependency)
- **Axios** (more features, interceptors)

---

## 9. Verification Plan

### Automated Tests
- Backend: Run seed script → verify all collections populated
- API: Test each endpoint with `curl` or Postman-like requests
- Frontend: Verify each page loads data from API (no mock data imports remaining)

### Manual Verification
1. Start MongoDB → Start backend → Start frontend
2. Dashboard: Verify stats are real aggregated data
3. Equipment: Add, edit, delete equipment → verify persistence
4. Borrow: Create request → Approve → Return flow
5. All pages: Verify no hardcoded data remains

### Lint & Build Check
```bash
# Backend
cd server && npm run build

# Frontend
cd .. && npm run build
```

---

## 10. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS v4 |
| Routing | React Router v7 |
| Backend | Express.js + TypeScript |
| Database | MongoDB 7+ |
| ODM | Mongoose 8 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| API Client | Fetch API / Axios |
| Dev Tools | tsx, nodemon |

---

## 11. File Tree (After Implementation)

```
quanlythietbi/
├── server/                          ← NEW backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env                         ← gitignored
│   └── src/
│       ├── index.ts
│       ├── config/
│       │   └── db.ts
│       ├── models/
│       │   ├── Equipment.ts
│       │   ├── Category.ts
│       │   ├── Location.ts
│       │   ├── Supplier.ts
│       │   ├── BorrowRequest.ts
│       │   ├── MaintenanceRecord.ts
│       │   ├── DisposalRequest.ts
│       │   ├── InventorySession.ts
│       │   ├── User.ts
│       │   └── AuditLog.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── equipment.ts
│       │   ├── categories.ts
│       │   ├── locations.ts
│       │   ├── suppliers.ts
│       │   ├── borrows.ts
│       │   ├── maintenance.ts
│       │   ├── disposals.ts
│       │   ├── inventory.ts
│       │   ├── stats.ts
│       │   └── users.ts
│       ├── controllers/
│       │   └── ... (matching routes)
│       ├── middleware/
│       │   ├── auth.ts
│       │   └── errorHandler.ts
│       └── seed.ts
├── src/                             ← MODIFIED frontend
│   └── app/
│       ├── services/
│       │   └── api.ts               ← NEW
│       ├── hooks/
│       │   ├── useEquipment.ts      ← NEW
│       │   ├── useBorrows.ts        ← NEW
│       │   ├── useCategories.ts     ← NEW
│       │   ├── useMaintenance.ts    ← NEW
│       │   ├── useStats.ts          ← NEW
│       │   └── useAuth.ts           ← NEW
│       ├── context/
│       │   └── AuthContext.tsx       ← NEW
│       ├── pages/
│       │   ├── LoginPage.tsx         ← NEW
│       │   └── ... (modified pages)
│       ├── data/
│       │   └── mock-data.ts          ← DEPRECATED (kept for reference)
│       └── ...
└── ...
```
