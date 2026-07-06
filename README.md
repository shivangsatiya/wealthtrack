# WealthTrack – Financial Habit Builder & Wealth Growth Tracker

A full-stack MERN web application to help users build financial habits, track income/expenses, manage savings goals, and monitor net worth growth.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 (Vite) + Bootstrap 5       |
| Backend    | Node.js + Express.js                |
| Database   | MongoDB (Mongoose)                  |
| Auth       | JWT + bcryptjs                      |
| Charts     | Chart.js + react-chartjs-2          |
| Deployment | Render (backend + frontend static)  |

---

## Pages

| Route        | Page               | Access     |
|--------------|--------------------|------------|
| `/login`     | Login              | Public     |
| `/register`  | Register           | Public     |
| `/`          | Dashboard          | User       |
| `/expenses`  | Expense Tracker    | User       |
| `/habits`    | Habit Tracker      | User       |
| `/goals`     | Savings Goals      | User       |
| `/analytics` | Wealth Analytics   | User       |
| `/profile`   | Profile            | User       |
| `/admin`     | Admin Panel        | Admin only |

---

## Local Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd wealthtrack

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### 2. Backend Environment

Create `backend/.env`:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/wealthtrack
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Environment

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Run

```bash
# Terminal 1 – backend
cd backend && npm run dev

# Terminal 2 – frontend
cd frontend && npm run dev
```

Visit: `http://localhost:5173`

---

## Creating an Admin User

After registering normally, update the user role in MongoDB Atlas:

```js
// In MongoDB Atlas shell or Compass
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## Render Deployment

### Option A – Using render.yaml (recommended)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create both services
5. Set environment variables:
   - `MONGO_URI` → your MongoDB Atlas connection string
   - `CLIENT_URL` → your frontend Render URL (e.g. `https://wealthtrack.onrender.com`)
   - `VITE_API_URL` → your backend Render URL + `/api` (e.g. `https://wealthtrack-api.onrender.com/api`)

### Option B – Manual setup

**Backend:**
- New Web Service → Node → `backend/` directory
- Build: `npm install`
- Start: `npm start`
- Add env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`

**Frontend:**
- New Static Site → `frontend/` directory
- Build: `npm install && npm run build`
- Publish: `dist`
- Add env var: `VITE_API_URL`
- Add rewrite rule: `/* → /index.html`

---

## Project Structure

```
wealthtrack/
├── backend/
│   ├── models/          # User, Transaction, Habit, Goal, Wealth
│   ├── routes/          # auth, transactions, habits, goals, wealth, admin, profile
│   ├── middleware/       # JWT auth, admin guard
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── context/     # AuthContext (global user state)
│   │   ├── pages/       # All 8 pages
│   │   ├── components/  # Sidebar
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env.example
├── render.yaml
└── README.md
```

---

## Features

- **Auth** – Register, login, JWT-protected routes
- **Dashboard** – Income/expense line chart, category doughnut, recent transactions, goals preview
- **Expense Tracker** – Add income/expenses with categories, filters by month/type, monthly summary
- **Habit Tracker** – Create habits, mark daily completion, auto streak calculation
- **Savings Goals** – Set goals with deadlines, add contributions, track % completion
- **Wealth Analytics** – Net worth = assets − liabilities, history chart, asset allocation doughnut
- **Profile** – Edit personal info, occupation, monthly income
- **Admin Panel** – User management (suspend/activate), platform KPIs, recent registrations

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Transactions
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/transactions` | Get all (filterable) |
| POST | `/api/transactions` | Add transaction |
| DELETE | `/api/transactions/:id` | Delete |
| GET | `/api/transactions/summary` | Monthly summary by year |
| GET | `/api/transactions/category-breakdown` | Expense breakdown by category |

### Habits
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/habits` | Get all active habits |
| POST | `/api/habits` | Create habit |
| POST | `/api/habits/:id/complete` | Mark complete (streak logic) |
| DELETE | `/api/habits/:id` | Soft delete |

### Goals
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create goal |
| POST | `/api/goals/:id/contribute` | Add contribution |
| DELETE | `/api/goals/:id` | Delete goal |

### Wealth
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/wealth` | Get wealth profile |
| POST | `/api/wealth/asset` | Add asset |
| DELETE | `/api/wealth/asset/:id` | Remove asset |
| POST | `/api/wealth/liability` | Add liability |
| DELETE | `/api/wealth/liability/:id` | Remove liability |

### Admin (admin only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Platform stats |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id/toggle` | Suspend/activate user |
| GET | `/api/admin/activity` | Monthly activity |
