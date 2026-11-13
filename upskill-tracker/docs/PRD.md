# PrepForge — Interview Prep Tracker (PRD)

## Original Problem Statement
User is preparing for coding interviews using: a LeetCode problem sheet, a System Design YouTube playlist, a System Design mock video, and Pramp DSA mocks. Problem: LeetCode has no pattern-based division, and there's no single place to study + track DSA and System Design together, go through mocks, and revise on weekends. Wants a tracker with email reminders 5 minutes before study time.

## Architecture
- **Frontend** (`frontend/`): Vite + React 19 + Tailwind v4. Single-page, 6 tabs (Overview, Scheduler, DSA Patterns, System Design, Mocks, Weekend Revision), dark mode. Components in `src/components/`, API client in `src/lib/data.js`.
- **Backend** (`backend/`): FastAPI + SQLite (`backend/tracker.db`, created on first start). All routes under `/api`. Playlists/problems seeded from `backend/seed_data.py`.
- **Daily plan**: auto-created per day. 7-9pm: 3 system design videos + 1 DSA problem. Sat/Sun also 5-7pm: next Pramp DSA mock + next system design mock video.
- **Streak + popups**: streak from completed items per day (`/api/streak`); motivational popups in `Popups.jsx`.
- **Notifications**: not implemented yet (planned: Telegram/phone call 5 min before sessions).

## How to Run (local)
Prerequisites: Python 3.10+, Node 20+ (`brew install node`). No database server needed.

**1. Backend** (terminal 1, port 8000)
```
cd backend
python3 -m venv .venv                 # first time only
.venv/bin/pip install -r requirements.txt   # first time only
.venv/bin/uvicorn server:app --reload --port 8000
```
API docs: http://localhost:8000/docs

**2. Frontend** (terminal 2, port 5173)
```
cd frontend
npm install                           # first time only
npm run dev
```
Open **http://localhost:5173** (the backend only allows CORS from this origin; override with `CORS_ORIGINS`).

**Config** (optional): `frontend/.env` -> `VITE_BACKEND_URL` (default `http://localhost:8000`); `backend/.env` -> `DB_PATH`, `CORS_ORIGINS`.

**Data**: all progress lives in `backend/tracker.db`. Back it up with `cp backend/tracker.db ~/tracker-backup.db`. Stopping the servers loses nothing. Deleting the file resets everything.

**Troubleshooting**: "address already in use" means a server is already running (`lsof -i :8000` / `:5173`). Data missing on a different port (e.g. 5174) is a CORS block; use 5173.

## User Persona
Single user (no auth), a candidate grinding DSA + System Design for interviews.

## Core Requirements (static)
- Pattern-grouped DSA tracker (49 placeholder problems; to be replaced with the real LeetCode sheet) with status + revise flag + LeetCode links
- System Design playlist tracker (14 videos)
- Mock interview tracker (Pramp DSA + system design) with CRUD + scheduling
- Study session scheduler with email reminder 5 min before
- Weekend revision deck (starred / "Revise" problems)
- Overview dashboard (progress ring, per-pattern bars, upcoming sessions)

## Implemented (2026-06)
- All of the above, end-to-end tested (100% backend + frontend). Email send + cron reminder verified real.

## Backlog
- P1: Daily study streak tracking + heatmap
- P1: Notes per problem (field exists in backend, no UI yet)
- P2: Custom patterns / add own problems
- P2: Data export/import backup
- P2: Weekly email digest of progress

## Notes
- Cron runs every 5 min in preview; deployed apps discard crons faster than 15 min, so in production reminders fire on a ~15-min cadence (set a session a bit earlier if exact-5-min precision is needed in prod).
