# CheckIn

A calm, private check-in app to help track and gradually reduce alcohol consumption — built for one family, not a general audience.

The core idea: check in **before** drinking, not after. That small shift turns a drink into a conscious decision instead of an automatic one. The app then shows weekly progress against a self-set limit, tracks alcohol-free streaks, and gently — never harshly — flags when a check-in would cross the weekly goal.

This is a support tool, not a surveillance tool. It never blocks a log, never shames, and keeps every warning calm and optional.

## Features

- One-tap check-in with an optional note (what led to it — useful for spotting patterns later)
- Weekly progress: days used this week vs. the limit, with a M–S day-of-week indicator
- Monthly calendar view of drinking days with a prev/next month navigator
- Current and longest alcohol-free streaks
- Editable weekly limit and monthly goal, no separate save step (auto-saves on change)
- Gentle warning shown only when a check-in would cross the weekly limit — logging is never blocked
- Light, non-preachy collapsible tips panel

## Tech stack

| Layer | Tech |
|---|---|
| Backend | FastAPI (Python 3.11+), SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Local dev | Docker Compose |
| Deployment | Backend on Render/Railway, frontend on Vercel, managed Postgres |

## Project structure

```
checkin/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app init, CORS, router mounting
│   │   ├── config.py              # env-based settings (pydantic-settings)
│   │   ├── database.py            # SQLAlchemy engine + session dependency
│   │   ├── models/                # ORM models: user, entry, settings
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── routers/               # entries, settings, stats endpoints
│   │   ├── services/              # stats_service (streaks, week/month rollups), warning_service
│   │   └── jobs/                  # daily_rollup (hook for future scheduled jobs)
│   ├── alembic/                   # DB migrations (initial + seed)
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Home: today's date, check-in button, week progress, streak
│   │   ├── month/page.tsx         # Month calendar + at-a-glance stats
│   │   ├── settings/page.tsx      # Inline settings (limit, goal, name)
│   │   └── layout.tsx             # Root layout + bottom nav
│   ├── components/
│   │   ├── CheckInButton.tsx      # 3-phase flow: idle → note → preview → warning → confirm
│   │   ├── WarningModal.tsx       # Calm bottom-sheet warning (coral, never red)
│   │   ├── WeekProgress.tsx       # Progress bar + M–S dots
│   │   ├── StreakCard.tsx         # Current + longest streak
│   │   ├── MonthCalendar.tsx      # Grid calendar with entry dots
│   │   └── TipsPanel.tsx          # Collapsible tips (7 rotating, non-preachy)
│   ├── lib/api.ts                 # Typed fetch wrappers for all endpoints
│   ├── package.json
│   └── .env.local.example
├── docker-compose.yml
└── README.md
```

## Getting started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (for local Postgres) or an existing PostgreSQL instance

### 1. Clone and configure

```bash
git clone <repo-url> checkin
cd checkin
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit `backend/.env`:
```
DATABASE_URL=postgresql://checkin:checkin@localhost:5432/checkin
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Start the database

```bash
docker compose up -d db
```

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head             # creates tables and seeds the default user
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### 4. Frontend

```bash
cd frontend
npm install
# copy and edit .env.local
cp .env.local.example .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 5. Full stack with Docker Compose

```bash
# From the root directory
docker compose up --build
```

This starts Postgres and the backend. Run the frontend locally (step 4) or add a frontend service to docker-compose.yml.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/entries/preview` | Compute what a new check-in would do, without saving |
| POST | `/entries/confirm` | Save the check-in |
| GET | `/entries?month=YYYY-MM` | Entries for calendar view |
| GET | `/stats/week` | Days used this week vs. limit |
| GET | `/stats/month` | This month vs. last month, goal |
| GET | `/stats/streak` | Current and longest alcohol-free streaks |
| GET | `/settings` | Current weekly limit, monthly goal, name |
| PUT | `/settings` | Update limit, goal, or name |
| GET | `/health` | Health check |

Full request/response shapes are documented at `/docs` once the backend is running.

### Warning flow (two-step check-in)

Logging is a two-step call so the frontend can show a warning **before** anything is saved:

1. `POST /entries/preview` → returns `{ week_days_used, weekly_limit, exceeds_limit }`
2. If `exceeds_limit` is true, the UI shows a calm confirmation modal
3. `POST /entries/confirm` → saves the entry, regardless — the app never refuses to log

## Database schema

```sql
users    (id, name, created_at)
settings (id, user_id FK, weekly_limit, monthly_goal, updated_at)
entries  (id, user_id FK, entry_date, entry_time, note, created_at)
```

A single default user row is seeded on first migration (`alembic upgrade head`), so v1 needs no login screen. The `users` table exists for future multi-person support.

**Stats logic:**
- "Days used" = distinct calendar dates with ≥1 entry (not raw entry count)
- Week boundary: Monday–Sunday (ISO)
- Streak = consecutive alcohol-free days ending today; if today already has an entry, the streak counts backward from yesterday (still in-progress)

## Design principles

- Calm over alarming: no red alert banners, no exclamation points, no guilt-based copy
- Logging honesty matters more than logging compliance — never block a check-in
- Streak and progress numbers are the main motivators; keep them visually prominent
- Mobile-first — used from a phone, one-handed, in a few seconds
- Color palette: deep slate/navy background, warm gold primary action, sage green on-track, muted coral warning only

## Deployment

### Backend (Render or Railway)
1. Create a new web service pointing to `backend/`
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add env var: `DATABASE_URL=<your managed postgres URL>`
5. Add env var: `FRONTEND_URL=https://your-vercel-domain.vercel.app`

### Frontend (Vercel)
1. Import the `frontend/` directory
2. Set env var: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com`
3. Deploy

Run `alembic upgrade head` against the production database on the first deploy (happens automatically via the start command above).

## Roadmap ideas (not in v1)

- Multi-user support (already partially modeled via the `users` table)
- Push notification reminders
- Exportable monthly summary (PDF/CSV)
- Pattern insights from the optional note field over time
- Weekly email digest
