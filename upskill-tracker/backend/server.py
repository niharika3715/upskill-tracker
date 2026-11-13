import os
import sqlite3
import uuid
from contextlib import asynccontextmanager, closing
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Literal, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from seed_data import LC, LLD_PLAYLIST_ID, LLD_VIDEOS, MOCKS_SEED, MOCK_PLAYLIST_ID, MOCK_VIDEOS, PATTERNS, SD_PLAYLIST_ID, SD_VIDEOS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")
DB_PATH = os.environ.get("DB_PATH", str(ROOT_DIR / "tracker.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY, pattern TEXT, number TEXT, title TEXT, difficulty TEXT, url TEXT,
  status TEXT DEFAULT 'Not Started', revise INTEGER DEFAULT 0, notes TEXT DEFAULT '', ord INTEGER, completed_on TEXT);
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY, title TEXT, url TEXT,
  status TEXT DEFAULT 'Not Started', notes TEXT DEFAULT '', ord INTEGER, completed_on TEXT, revise INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS mocks (
  id TEXT PRIMARY KEY, title TEXT, kind TEXT, platform TEXT DEFAULT '', link TEXT DEFAULT '',
  status TEXT DEFAULT 'Planned', scheduled_for TEXT, notes TEXT DEFAULT '', created_at TEXT, completed_on TEXT);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, title TEXT, category TEXT, start_time TEXT, duration_min INTEGER DEFAULT 60,
  notes TEXT DEFAULT '', done INTEGER DEFAULT 0, reminder_sent INTEGER DEFAULT 0, created_at TEXT,
  ref_type TEXT, ref_id TEXT, plan_date TEXT, completed_on TEXT, started_at TEXT);
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY, title TEXT, url TEXT UNIQUE, blurb TEXT,
  status TEXT DEFAULT 'Not Started', notes TEXT DEFAULT '', ord INTEGER);
CREATE TABLE IF NOT EXISTS reflections (
  day TEXT PRIMARY KEY, went_well TEXT DEFAULT '', focus_tomorrow TEXT DEFAULT '', updated_at TEXT);
CREATE TABLE IF NOT EXISTS ownership_steps (
  id TEXT PRIMARY KEY, title TEXT UNIQUE, done INTEGER DEFAULT 0, completed_on TEXT, ord INTEGER);
CREATE TABLE IF NOT EXISTS revisions (course TEXT PRIMARY KEY, start_date TEXT);
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1), owner_name TEXT, owner_email TEXT, reminders_enabled INTEGER);
"""

BOOL_COLS = {"revise", "done", "reminder_sent", "reminders_enabled"}

# Daily auto-plan from 7am local time, 30 min each: 2 DSA problems, then 1 LLD video.
# Slots are packed back to back, so the window grows/shrinks with however many items are still pending.
PLAN_START_HOUR = 7
SLOT_MIN = 30
PLAN_PROBLEMS = 2
# Pace gauge target: start applying on this date.
APPLY_DATE = date.fromisoformat(os.environ.get("APPLY_DATE", "2026-12-05"))
PACE_WINDOW_DAYS = 7
# Sat/Sun extra block: 5-7pm = next DSA mock (Pramp) + next system design mock video, 1h each.
WEEKEND_START_HOUR = 17
MOCK_SLOT_MIN = 60
PLAN_VIDEOS = 1
# When a course completes, queue a revision session daily for this many days (starting the day it's detected).
REVISION_DAYS = 3
REVISION_START_HOUR = 20
REVISION_SLOT_MIN = 60
MIGRATIONS = [  # for DBs created before these columns existed
    ("problems", "completed_on", "TEXT"), ("videos", "completed_on", "TEXT"), ("videos", "revise", "INTEGER DEFAULT 0"), ("videos", "kind", "TEXT DEFAULT 'HLD'"),
    ("sessions", "ref_type", "TEXT"), ("sessions", "ref_id", "TEXT"),
    ("reflections", "owned", "TEXT DEFAULT ''"),
    ("sessions", "plan_date", "TEXT"), ("mocks", "completed_on", "TEXT"), ("sessions", "started_at", "TEXT"), ("sessions", "completed_on", "TEXT"),
    ("resources", "custom", "INTEGER DEFAULT 0"),
]


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def today() -> str:
    return date.today().isoformat()


def uid():
    return str(uuid.uuid4())


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def to_dict(row):
    if row is None:
        return None
    d = dict(row)
    d.pop("ord", None)
    for k in BOOL_COLS & d.keys():
        d[k] = bool(d[k])
    return d


def fetch(sql, args=()):
    with closing(connect()) as c:
        return [to_dict(r) for r in c.execute(sql, args).fetchall()]


def fetch_one(sql, args=()):
    rows = fetch(sql, args)
    return rows[0] if rows else None


def update_row(table: str, row_id: str, fields: dict):
    """`table` and field names come from code/pydantic models only, never from user input."""
    if not fields:
        raise HTTPException(400, "No fields")
    sets = ", ".join(f"{k} = ?" for k in fields)
    with closing(connect()) as c, c:
        cur = c.execute(f"UPDATE {table} SET {sets} WHERE id = ?", [*fields.values(), row_id])
        if cur.rowcount == 0:
            raise HTTPException(404, "Not found")
    return fetch_one(f"SELECT * FROM {table} WHERE id = ?", (row_id,))


def delete_row(table: str, row_id: str):
    with closing(connect()) as c, c:
        c.execute(f"DELETE FROM {table} WHERE id = ?", (row_id,))
    return {"ok": True}


def _insert_plan(c, day, hour, slot_min, items):
    start = datetime.now().astimezone().replace(hour=hour, minute=0, second=0, microsecond=0)
    for i, (ref_type, ref_id, title, cat) in enumerate(items):
        c.execute(
            "INSERT INTO sessions (id, title, category, start_time, duration_min, ref_type, ref_id, plan_date, created_at)"
            " VALUES (?,?,?,?,?,?,?,?,?)",
            (uid(), title, cat, (start + timedelta(minutes=slot_min * i)).isoformat(), slot_min,
             ref_type, ref_id, day, now_iso()))


def ensure_revision_plan(c, day):
    """Course fully done (all videos watched / all problems solved) -> revision sessions for REVISION_DAYS days."""
    done = {"System Design": "SELECT COUNT(*) FROM videos WHERE kind = 'HLD' AND status != 'Watched'",
            "DSA": "SELECT COUNT(*) FROM problems WHERE status != 'Solved'",
            "LLD": "SELECT COUNT(*) FROM videos WHERE kind = 'LLD' AND status != 'Watched'"}
    total = {"System Design": "SELECT COUNT(*) FROM videos WHERE kind = 'HLD'", "DSA": "SELECT COUNT(*) FROM problems",
             "LLD": "SELECT COUNT(*) FROM videos WHERE kind = 'LLD'"}
    for course, pending_sql in done.items():
        if c.execute(total[course]).fetchone()[0] and not c.execute(pending_sql).fetchone()[0]:
            c.execute("INSERT OR IGNORE INTO revisions VALUES (?,?)", (course, day))
    for r in c.execute("SELECT course, start_date FROM revisions").fetchall():
        if not 0 <= (date.fromisoformat(day) - date.fromisoformat(r["start_date"])).days < REVISION_DAYS:
            continue
        if not c.execute("SELECT 1 FROM sessions WHERE plan_date = ? AND ref_type = 'revision' AND ref_id = ?",
                         (day, r["course"])).fetchone():
            n = (date.fromisoformat(day) - date.fromisoformat(r["start_date"])).days + 1
            _insert_plan(c, day, REVISION_START_HOUR + list(done).index(r["course"]), REVISION_SLOT_MIN,
                         [("revision", r["course"], f"Revise {r['course']} (day {n}/{REVISION_DAYS})", "Revision")])


def ensure_daily_plan():
    """Once per day, queue the next unsolved problems then the next unwatched video into the 7-8:30am window;
    on weekends also queue the next DSA mock and system design mock video into 5-7pm."""
    day = today()
    with closing(connect()) as c, c:
        c.execute("DELETE FROM sessions WHERE ref_type IS NOT NULL AND done = 0 AND plan_date < ?", (day,))  # stale auto-planned leftovers
        if not c.execute("SELECT 1 FROM sessions WHERE plan_date = ? AND ref_type NOT IN ('mock', 'revision')", (day,)).fetchone():
            items = [("problem", r["id"], f"LeetCode #{r['number']} {r['title']}", "DSA") for r in c.execute(
                "SELECT id, number, title FROM problems WHERE status != 'Solved' ORDER BY ord LIMIT ?", (PLAN_PROBLEMS,))]
            items += [("video", r["id"], f"Watch LLD: {r['title']}", "System Design") for r in c.execute(
                "SELECT id, title FROM videos WHERE kind = 'LLD' AND status != 'Watched' ORDER BY ord LIMIT ?", (PLAN_VIDEOS,))]
            _insert_plan(c, day, PLAN_START_HOUR, SLOT_MIN, items)

        ensure_revision_plan(c, day)

        if date.today().weekday() >= 5 and not c.execute(
                "SELECT 1 FROM sessions WHERE plan_date = ? AND ref_type = 'mock'", (day,)).fetchone():
            pick = lambda where: c.execute(
                f"SELECT id, title FROM mocks WHERE status != 'Done' AND {where} ORDER BY created_at LIMIT 1").fetchone()
            dsa = pick("kind = 'DSA'")
            sd = pick("kind = 'System Design' AND platform = 'YouTube'")
            _insert_plan(c, day, WEEKEND_START_HOUR, MOCK_SLOT_MIN,
                         [("mock", m["id"], f"Mock: {m['title']}", cat) for m, cat in ((dsa, "Mock"), (sd, "Mock")) if m])


def sync_sessions(ref_type: str, ref_id: str, done: bool):
    with closing(connect()) as c, c:
        c.execute("UPDATE sessions SET done = ?, completed_on = ? WHERE ref_type = ? AND ref_id = ?",
                  (int(done), today() if done else None, ref_type, ref_id))


def sync_videos(c):
    """Playlists in seed_data are the source of truth; keeps progress of videos that still exist."""
    for kind, playlist, videos in (("HLD", SD_PLAYLIST_ID, SD_VIDEOS), ("LLD", LLD_PLAYLIST_ID, LLD_VIDEOS)):
        urls = [f"https://www.youtube.com/watch?v={vid}&list={playlist}" for _, vid in videos]
        c.execute(f"DELETE FROM videos WHERE kind = ? AND url NOT IN ({','.join('?' * len(urls))})", [kind, *urls])
        have = {r[0] for r in c.execute("SELECT url FROM videos")}
        for i, ((title, _), url) in enumerate(zip(videos, urls)):
            if url in have:
                c.execute("UPDATE videos SET title = ?, ord = ?, kind = ? WHERE url = ?", (title, i, kind, url))
            else:
                c.execute("INSERT INTO videos (id, title, url, ord, kind) VALUES (?,?,?,?,?)", (uid(), title, url, i, kind))


def sync_mock_videos(c):
    """Mock-interview playlist as individual mocks; matched by video id so existing progress is kept."""
    base = datetime.now(timezone.utc)
    for i, (title, vid) in enumerate(MOCK_VIDEOS):
        link = f"https://www.youtube.com/watch?v={vid}&list={MOCK_PLAYLIST_ID}"
        name = f"{i + 1}. {title}"
        row = c.execute("SELECT id FROM mocks WHERE link LIKE ?", (f"%{vid}%",)).fetchone()
        if row:
            c.execute("UPDATE mocks SET title = ?, link = ? WHERE id = ?", (name, link, row[0]))
        else:
            c.execute("INSERT INTO mocks (id, title, kind, platform, link, created_at) VALUES (?,?,?,?,?,?)",
                      (uid(), name, "System Design", "YouTube", link, (base + timedelta(seconds=i)).isoformat()))


OWNERSHIP_STEPS = [
    "Map one module/flow end to end",
    "Read its recent git history",
    "Write a short design doc",
    "Ask for a feature in it",
]


def sync_ownership(c):
    for i, title in enumerate(OWNERSHIP_STEPS):
        c.execute("INSERT INTO ownership_steps (id, title, ord) VALUES (?,?,?)"
                  " ON CONFLICT(title) DO UPDATE SET ord = excluded.ord", (uid(), title, i))


# Next focus, after DSA + System Design are done.
RESOURCES = [
    ("Project-Based Learning", "https://github.com/practical-tutorials/project-based-learning", "Build real projects, by language"),
    ("Build Your Own X", "https://github.com/codecrafters-io/build-your-own-x", "Recreate databases, Redis, Git, etc. from scratch"),
    ("Low-Level Design", "https://github.com/coding-parrot/Low-Level-Design", "LLD / OOD problems with solutions"),
    ("Tech OA Interview Questions", "https://github.com/perixtar/Tech-OA-Interview-Questions", "Online-assessment question bank"),
    ("System Design Primer", "https://github.com/donnemartin/system-design-primer", "Reference + Anki decks for system design"),
    ("LLD / Machine Coding (Keerti Purswani)", "https://www.youtube.com/playlist?list=PLliXPok7Zonm0trweRA2UeSTTLVYiPzNG", "YouTube playlist: low-level design concepts with code examples"),
    ("BugHunt", "https://trybughunt.com/", "Bug-hunting / debugging practice"),
    ("Buglyst", "https://buglyst.com/", "Bug-hunting / debugging practice"),
]


def sync_resources(c):
    for i, (title, url, blurb) in enumerate(RESOURCES):
        c.execute("INSERT INTO resources (id, title, url, blurb, ord) VALUES (?,?,?,?,?)"
                  " ON CONFLICT(url) DO UPDATE SET title = excluded.title, blurb = excluded.blurb, ord = excluded.ord",
                  (uid(), title, url, blurb, i))


def seed():
    with closing(connect()) as c, c:
        c.executescript(SCHEMA)
        for table, col, decl in MIGRATIONS:
            if col not in {r[1] for r in c.execute(f"PRAGMA table_info({table})")}:
                c.execute(f"ALTER TABLE {table} ADD COLUMN {col} {decl}")
        sync_videos(c)
        sync_mock_videos(c)
        sync_resources(c)
        sync_ownership(c)
        if c.execute("SELECT COUNT(*) FROM problems").fetchone()[0]:
            return
        order = 0
        for pat, probs in PATTERNS:
            for num, title, diff, slug in probs:
                c.execute(
                    "INSERT INTO problems (id, pattern, number, title, difficulty, url, ord) VALUES (?,?,?,?,?,?,?)",
                    (uid(), pat, num, title, diff, f"{LC}{slug}/", order))
                order += 1
        for t, k, p, link in MOCKS_SEED:
            c.execute("INSERT INTO mocks (id, title, kind, platform, link, created_at) VALUES (?,?,?,?,?,?)",
                      (uid(), t, k, p, link, now_iso()))
        c.execute("INSERT OR IGNORE INTO settings VALUES (1, 'Candidate', '', 1)")


@asynccontextmanager
async def lifespan(_):
    seed()
    ensure_daily_plan()
    yield


app = FastAPI(lifespan=lifespan)
api = APIRouter(prefix="/api")


# ---------------- Models ----------------
class ProblemUpdate(BaseModel):
    status: Optional[Literal["Not Started", "Solving", "Solved", "Revise"]] = None
    notes: Optional[str] = None
    revise: Optional[bool] = None


class VideoUpdate(BaseModel):
    status: Optional[Literal["Not Started", "In Progress", "Watched"]] = None
    notes: Optional[str] = None
    revise: Optional[bool] = None


class MockCreate(BaseModel):
    title: str
    kind: str
    platform: str = ""
    link: str = ""
    scheduled_for: Optional[str] = None


class MockUpdate(BaseModel):
    status: Optional[Literal["Planned", "Scheduled", "Done"]] = None
    scheduled_for: Optional[str] = None  # explicit null clears it
    notes: Optional[str] = None


class SessionCreate(BaseModel):
    title: str
    category: str
    start_time: str
    duration_min: int = 60
    notes: str = ""


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    start_time: Optional[str] = None
    duration_min: Optional[int] = None
    notes: Optional[str] = None
    done: Optional[bool] = None


class Settings(BaseModel):
    owner_name: str = "Candidate"
    owner_email: str = ""
    reminders_enabled: bool = True


def patch_fields(body: BaseModel, nullable=()):
    """Fields the client sent; null is dropped unless the column is nullable."""
    return {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None or k in nullable}


# ---------------- Stats ----------------
@api.get("/stats")
def stats():
    problems = fetch("SELECT * FROM problems")
    videos = fetch("SELECT status FROM videos WHERE kind = 'HLD'")
    mocks = fetch("SELECT status FROM mocks")
    solved = lambda rows: sum(p["status"] == "Solved" for p in rows)
    by_diff = {}
    for d in ("Easy", "Medium", "Hard"):
        tot = [p for p in problems if p["difficulty"] == d]
        by_diff[d] = {"solved": solved(tot), "total": len(tot)}
    by_pattern = {}
    for p in problems:
        s = by_pattern.setdefault(p["pattern"], {"solved": 0, "total": 0})
        s["total"] += 1
        s["solved"] += p["status"] == "Solved"
    return {
        "dsa": {"solved": solved(problems), "total": len(problems), "by_difficulty": by_diff,
                "by_pattern": by_pattern, "revise": sum(p["revise"] for p in problems)},
        "system_design": {"watched": sum(v["status"] == "Watched" for v in videos), "total": len(videos)},
        "mocks": {"done": sum(m["status"] == "Done" for m in mocks), "total": len(mocks)},
    }


# ---------------- Pace ----------------
@api.get("/pace")
def pace():
    """DSA problems/day needed to finish by APPLY_DATE vs the average over the last PACE_WINDOW_DAYS days."""
    row = fetch_one("SELECT COUNT(*) total, COALESCE(SUM(status = 'Solved'), 0) solved FROM problems")
    since = (date.today() - timedelta(days=PACE_WINDOW_DAYS - 1)).isoformat()
    recent = fetch_one("SELECT COUNT(*) n FROM problems WHERE completed_on >= ?", (since,))["n"]
    days_left = max((APPLY_DATE - date.today()).days, 0)
    remaining = row["total"] - row["solved"]
    needed = remaining / max(days_left, 1)
    actual = recent / PACE_WINDOW_DAYS
    return {"apply_date": APPLY_DATE.isoformat(), "days_left": days_left, "remaining": remaining,
            "needed_per_day": round(needed, 2), "actual_per_day": round(actual, 2),
            "on_track": remaining == 0 or actual >= needed}


# ---------------- Streak ----------------
@api.get("/streak")
def streak():
    """A day counts if anything was completed that day (problem solved, video watched, session done)."""
    # Auto-planned sessions (ref_type set) mirror a problem/video/mock, so count only manual ones to avoid doubles.
    # Revision sessions have no mirror, so they count too.
    rows = fetch("""SELECT d, COUNT(*) n FROM (
                    SELECT completed_on d FROM problems WHERE completed_on IS NOT NULL
                    UNION ALL SELECT completed_on FROM videos WHERE completed_on IS NOT NULL
                    UNION ALL SELECT completed_on FROM mocks WHERE completed_on IS NOT NULL
                    UNION ALL SELECT completed_on FROM sessions WHERE completed_on IS NOT NULL AND (ref_type IS NULL OR ref_type = 'revision')
                    ) GROUP BY d""")
    counts = {r["d"]: r["n"] for r in rows}
    days = set(counts)
    t = date.today()
    d = t if t.isoformat() in days else t - timedelta(days=1)  # today isn't a miss until it's over
    current = 0
    while d.isoformat() in days:
        current += 1
        d -= timedelta(days=1)
    longest = run = 0
    prev = None
    for s in sorted(days):
        cur = date.fromisoformat(s)
        run = run + 1 if prev and cur - prev == timedelta(days=1) else 1
        longest, prev = max(longest, run), cur
    first = min(days) if days else None
    strip = []
    for i in range(13, -1, -1):
        s = (t - timedelta(days=i)).isoformat()
        state = ("done" if s in days else "today" if s == t.isoformat()
                 else "missed" if first and s > first else "none")
        strip.append({"date": s, "state": state, "count": counts.get(s, 0)})
    return {"current": current, "longest": longest, "today_done": t.isoformat() in days,
            "total_days": len(days), "last_14": strip,
            "total_14": sum(x["count"] for x in strip), "best_day": max(counts.values(), default=0)}


# ---------------- DSA ----------------
@api.get("/problems")
def get_problems():
    return fetch("SELECT * FROM problems ORDER BY ord")


@api.patch("/problems/{pid}")
def update_problem(pid: str, body: ProblemUpdate):
    fields = patch_fields(body)
    if "status" in fields:
        fields["completed_on"] = today() if fields["status"] == "Solved" else None
    row = update_row("problems", pid, fields)
    if "status" in fields:
        sync_sessions("problem", pid, fields["status"] == "Solved")
    return row


# ---------------- System Design ----------------
@api.get("/videos")
def get_videos():
    return fetch("SELECT * FROM videos ORDER BY ord")


@api.patch("/videos/{vid}")
def update_video(vid: str, body: VideoUpdate):
    fields = patch_fields(body)
    if "status" in fields:
        fields["completed_on"] = today() if fields["status"] == "Watched" else None
    row = update_row("videos", vid, fields)
    if "status" in fields:
        sync_sessions("video", vid, fields["status"] == "Watched")
    return row


# ---------------- Next focus resources ----------------
class ResourceUpdate(BaseModel):
    status: Optional[Literal["Not Started", "In Progress", "Done"]] = None
    notes: Optional[str] = None


@api.get("/resources")
def get_resources():
    return fetch("SELECT * FROM resources ORDER BY ord")


class ResourceCreate(BaseModel):
    title: str
    url: str
    blurb: str = ""


@api.post("/resources")
def create_resource(body: ResourceCreate):
    with closing(connect()) as c, c:
        nxt = c.execute("SELECT COALESCE(MAX(ord), -1) + 1 FROM resources").fetchone()[0]
        try:
            c.execute("INSERT INTO resources (id, title, url, blurb, ord, custom) VALUES (?,?,?,?,?,1)",
                      (uid(), body.title.strip(), body.url.strip(), body.blurb.strip(), nxt))
        except sqlite3.IntegrityError:
            raise HTTPException(409, "Link already exists")
    return {"ok": True}


@api.delete("/resources/{rid}")
def delete_resource(rid: str):
    with closing(connect()) as c, c:
        c.execute("DELETE FROM resources WHERE id = ? AND custom = 1", (rid,))
    return {"ok": True}


@api.patch("/resources/{rid}")
def update_resource(rid: str, body: ResourceUpdate):
    return update_row("resources", rid, patch_fields(body))


# ---------------- Mocks ----------------
@api.get("/mocks")
def get_mocks():
    return fetch("SELECT * FROM mocks ORDER BY created_at")


@api.post("/mocks")
def create_mock(body: MockCreate):
    mid = uid()
    with closing(connect()) as c, c:
        c.execute("INSERT INTO mocks (id, title, kind, platform, link, scheduled_for, created_at) VALUES (?,?,?,?,?,?,?)",
                  (mid, body.title, body.kind, body.platform, body.link, body.scheduled_for, now_iso()))
    return fetch_one("SELECT * FROM mocks WHERE id = ?", (mid,))


@api.patch("/mocks/{mid}")
def update_mock(mid: str, body: MockUpdate):
    fields = patch_fields(body, nullable={"scheduled_for"})
    if "status" in fields:
        fields["completed_on"] = today() if fields["status"] == "Done" else None
    row = update_row("mocks", mid, fields)
    if "status" in fields:
        sync_sessions("mock", mid, fields["status"] == "Done")
    return row


@api.delete("/mocks/{mid}")
def delete_mock(mid: str):
    return delete_row("mocks", mid)


# ---------------- Sessions ----------------
@api.get("/sessions")
def get_sessions():
    ensure_daily_plan()
    return fetch("SELECT * FROM sessions ORDER BY start_time")


@api.post("/sessions")
def create_session(body: SessionCreate):
    sid = uid()
    with closing(connect()) as c, c:
        c.execute("INSERT INTO sessions (id, title, category, start_time, duration_min, notes, created_at) VALUES (?,?,?,?,?,?,?)",
                  (sid, body.title, body.category, body.start_time, body.duration_min, body.notes, now_iso()))
    return fetch_one("SELECT * FROM sessions WHERE id = ?", (sid,))


@api.patch("/sessions/{sid}")
def update_session(sid: str, body: SessionUpdate):
    fields = patch_fields(body)
    if "start_time" in fields:
        fields["reminder_sent"] = 0
    if "done" in fields:
        fields["completed_on"] = today() if fields["done"] else None
    row = update_row("sessions", sid, fields)
    if fields.get("done"):  # finishing counts as showing up
        mark_started(sid)
        row = fetch_one("SELECT * FROM sessions WHERE id = ?", (sid,))
    if "done" in fields and row["ref_type"] in ("problem", "video", "mock"):  # completing a planned session completes its video/problem
        table, finished, undone = {"problem": ("problems", "Solved", "Not Started"),
                                   "video": ("videos", "Watched", "Not Started"),
                                   "mock": ("mocks", "Done", "Planned")}[row["ref_type"]]
        update_row(table, row["ref_id"], {"status": finished if fields["done"] else undone,
                                          "completed_on": fields["completed_on"]})
    return row


def mark_started(sid: str):
    with closing(connect()) as c, c:
        c.execute("UPDATE sessions SET started_at = COALESCE(started_at, ?) WHERE id = ?", (now_iso(), sid))


@api.post("/sessions/{sid}/start")
def start_session(sid: str):
    mark_started(sid)
    row = fetch_one("SELECT * FROM sessions WHERE id = ?", (sid,))
    if not row:
        raise HTTPException(404, "Not found")
    return row


@api.delete("/sessions/{sid}")
def delete_session(sid: str):
    return delete_row("sessions", sid)


# ---------------- Settings ----------------
@api.get("/settings")
def get_settings():
    return fetch_one("SELECT owner_name, owner_email, reminders_enabled FROM settings WHERE id = 1")


@api.put("/settings")
def put_settings(body: Settings):
    with closing(connect()) as c, c:
        c.execute("REPLACE INTO settings VALUES (1, ?, ?, ?)",
                  (body.owner_name, body.owner_email, int(body.reminders_enabled)))
    return body.model_dump()


# ---------------- Daily reflections ----------------
class ReflectionIn(BaseModel):
    went_well: Optional[str] = None
    focus_tomorrow: Optional[str] = None
    owned: Optional[str] = None


@api.get("/reflections")
def get_reflections():
    return fetch("SELECT day, went_well, focus_tomorrow, owned FROM reflections ORDER BY day DESC")


@api.put("/reflections/today")
def put_reflection(body: ReflectionIn):
    """Partial upsert: fields not sent keep their saved value (the confidence log and the reflection form share a row)."""
    row = {"went_well": "", "focus_tomorrow": "", "owned": "",
           **(fetch_one("SELECT went_well, focus_tomorrow, owned FROM reflections WHERE day = ?", (today(),)) or {}),
           **body.model_dump(exclude_unset=True)}
    with closing(connect()) as c, c:
        c.execute("REPLACE INTO reflections (day, went_well, focus_tomorrow, owned, updated_at) VALUES (?,?,?,?,?)",
                  (today(), row["went_well"], row["focus_tomorrow"], row["owned"], now_iso()))
    return {"day": today(), **row}


# ---------------- Work ownership checklist ----------------
class OwnershipUpdate(BaseModel):
    done: bool


@api.get("/ownership")
def get_ownership():
    return fetch("SELECT * FROM ownership_steps ORDER BY ord")


@api.patch("/ownership/{oid}")
def update_ownership(oid: str, body: OwnershipUpdate):
    return update_row("ownership_steps", oid, {"done": int(body.done), "completed_on": today() if body.done else None})


# Email reminders (Gmail SMTP + scheduler) intentionally not wired yet.

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
