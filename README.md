# Gatekeep — Visitor Pass Management System

A full MERN-stack application for managing visitor check-ins, approvals, and
front-desk operations across three roles: **Administrator**, **Receptionist**,
and **Employee**.

```
visitor-pass-system/
├── backend/     Express + MongoDB (Mongoose) REST API, JWT auth, RBAC
└── frontend/    React (Vite) SPA, role-based dashboards
```

---

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either:
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended for deployment)

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/visitor_pass_system` |
| `JWT_SECRET` | Long random string used to sign auth tokens | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Token lifetime | `8h` |
| `CLIENT_ORIGIN` | Frontend URL, for CORS | `http://localhost:5173` |

Seed the database with one login per role:

```bash
npm run seed
```

This creates:

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@company.com` | `Admin@123` |
| Receptionist | `receptionist@company.com` | `Reception@123` |
| Employee | `john.employee@company.com` | `Employee@123` |

Start the API:

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

The API runs at `http://localhost:5000/api`. Health check: `GET /api/health`.

---

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` if your API isn't on the default port:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173` and log in with any of the seeded accounts above.

Production build:

```bash
npm run build   # outputs to frontend/dist
npm run preview # serve the production build locally
```

---

## 4. Deploying

- **Backend** → Render, Railway, or any Node host. Set the same environment
  variables as above (point `MONGO_URI` at an Atlas cluster, and set
  `CLIENT_ORIGIN` to your deployed frontend URL).
- **Frontend** → Vercel or Netlify. Set `VITE_API_URL` to your deployed
  backend's `/api` URL as a build-time environment variable.

---

## 5. Roles & Permissions

| Feature | Admin | Receptionist | Employee |
|---|:---:|:---:|:---:|
| View dashboard | ✅ | ✅ | ✅ |
| Manage employees | ✅ | — | — |
| Manage user accounts | ✅ | — | — |
| Register / check in / check out visitors | — | ✅ | — |
| Approve / reject visitor requests | — | — | ✅ (own requests) |
| View visitor reports & activity history | ✅ | own actions via desk | own requests |

Every backend route is protected by `protect` (valid JWT) and `authorize(...roles)`
middleware — the frontend nav only *hides* what a role can't do; the API is the
actual enforcement point.

---

## 6. Business Rules Implemented

All ten rules are enforced server-side in `backend/controllers/visitorController.js`:

1. A visitor cannot have more than one **active** visit (pending/approved/checked-in) at a time.
2. No duplicate registration for the same visitor on the same date.
3. Visit date can't be before today.
4. For same-day registrations, arrival time can't be before the current time.
5. An employee can't have more than 3 requests **pending** at once.
6. Check-in requires prior approval.
7. A checked-in visitor can't be checked in again until checked out.
8. Check-out time must be after check-in time.
9. Rejected requests can never be checked in.
10. Cancelled visits are excluded from active visitor lists (`excludeCancelled=true` query param).

---

## 7. API Documentation

Base URL: `/api`. All routes except `/auth/login` require
`Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` | Any | Current logged-in user |

### Users (accounts)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all user accounts |
| POST | `/users` | Admin | Create account `{ name, email, password, role, employeeProfile? }` |
| PATCH | `/users/:id` | Admin | Update `{ name?, isActive?, password? }` |
| DELETE | `/users/:id` | Admin | Delete an account |

### Employees
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/employees?search=&department=&isActive=` | Any authenticated | List/search employees |
| GET | `/employees/:id` | Any authenticated | Get one employee |
| POST | `/employees` | Admin | Create `{ name, email, phone, department, designation }` |
| PATCH | `/employees/:id` | Admin | Update any field, incl. `isActive` |
| DELETE | `/employees/:id` | Admin | Delete an employee |

### Visitors (core workflow)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/visitors?visitorName=&employeeName=&visitDate=&status=&from=&to=&excludeCancelled=` | Any (employee sees only their own) | Search/filter visit requests |
| GET | `/visitors/:id` | Any | Get one visit request |
| GET | `/visitors/:id/activity` | Any | Activity log for one request |
| POST | `/visitors` | Receptionist, Admin | Register a visitor (Rules 1–5 enforced) |
| PATCH | `/visitors/:id/approve` | Employee (own), Admin | `{ remarks? }` |
| PATCH | `/visitors/:id/reject` | Employee (own), Admin | `{ remarks? }` |
| PATCH | `/visitors/:id/checkin` | Receptionist, Admin | Rules 6, 7, 9 enforced |
| PATCH | `/visitors/:id/checkout` | Receptionist, Admin | Rule 8 enforced |
| PATCH | `/visitors/:id/cancel` | Receptionist, Admin | `{ remarks? }`, Rule 10 |

### Dashboard & Reports
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | Any | Role-specific summary counts |
| GET | `/reports/summary?range=today\|week\|custom&from=&to=` | Admin, Receptionist | Visit counts by status and department |
| GET | `/reports/activity?from=&to=&action=` | Admin | Global activity feed (last 500 entries) |

---

## 8. Project Structure Notes

- **Backend**: MVC-style — `models/` (Mongoose schemas), `controllers/`
  (business logic incl. all 10 rules), `routes/` (thin, just wiring +
  middleware), `middleware/auth.js` (JWT verify + role gate).
- **Frontend**: pages are grouped per role under `src/pages/{admin,receptionist,employee}`,
  with shared building blocks (`VisitorTable`, `VisitorFilters`, `StatusBadge`,
  `Modal`, `Button`) in `src/components`. `AuthContext` holds the session;
  `axios.js` attaches the JWT and redirects to `/login` on 401.
