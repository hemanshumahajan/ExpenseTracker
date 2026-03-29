# Xpense Tracker

Full-stack expense tracking app — ASP.NET Core 8 backend + React frontend.

```
expense-tracker/
├── backend/    ← ASP.NET Core 8 Web API  (MySQL via EF Core)
└── frontend/   ← React 18  (Recharts, React Router)
```

---

## Local Development

### Backend
```bash
cd backend
# Edit appsettings.json with your local MySQL credentials
dotnet restore
dotnet ef migrations add InitialCreate   # first time only
dotnet run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
cp .env.example .env          # set REACT_APP_API_URL=http://localhost:8080/api
npm install
npm start
# Runs on http://localhost:3000
```

---

## Deploy to Railway (Free tier)

### 1 — Backend service
1. Push this repo to GitHub.
2. On [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
3. Select the repo and set **Root Directory** to `backend`.
4. Railway auto-detects the `Dockerfile` and builds it.
5. Add a **MySQL** plugin inside Railway (one click). Railway injects:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`
   
   `Program.cs` reads these automatically — no extra env vars needed.
6. Railway also injects `PORT`; the app binds to it automatically.
7. Note the public URL Railway gives you, e.g. `https://xpense-api.up.railway.app`.

### 2 — Frontend service (or use Vercel/Netlify for free)
#### Option A — Railway
1. **New Service → GitHub repo**, Root Directory = `frontend`.
2. Add env var: `REACT_APP_API_URL=https://<your-backend>.up.railway.app/api`
3. Build command: `npm run build`   Start command: `npx serve -s build -l $PORT`

#### Option B — Vercel (recommended, generous free tier)
```bash
cd frontend
npx vercel
# Set REACT_APP_API_URL in Vercel dashboard → Settings → Environment Variables
```

---

## API Reference

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/dashboard        | 7-day summary + charts   |
| GET    | /api/category         | List all categories      |
| POST   | /api/category         | Create category          |
| PUT    | /api/category/{id}    | Update category          |
| DELETE | /api/category/{id}    | Delete category          |
| GET    | /api/transaction      | List all transactions    |
| POST   | /api/transaction      | Create transaction       |
| PUT    | /api/transaction/{id} | Update transaction       |
| DELETE | /api/transaction/{id} | Delete transaction       |
