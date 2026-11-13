import { useEffect, useState } from "react";
import { ReflectionForm } from "@/components/Reflections";
import { useMocks, useProblems, useReflections, useSessions, useStreak, useVideos } from "@/lib/hooks";

const GRACE_MS = 5 * 60 * 1000; // "on time" = started within 5 min of the scheduled start

const POPUPS = {
  comeback: {
    title: "YOUR COMEBACK STARTS NOW.",
    body: "One missed day doesn't erase your progress. Don't waste energy feeling guilty about yesterday. Show up today and keep building.",
    cta: "Let's go",
  },
  beyond: {
    title: "LEVEL UP! YOU WENT BEYOND THE PLAN. ⚡",
    body: "You didn't just meet the standard. You raised it. Extra effort compounds, but remember: consistency beats burnout. Come back tomorrow just as strong.",
    cta: "Keep going",
  },
  complete: {
    title: "MISSION COMPLETE. 🏆",
    body: "You kept the promise you made to yourself. Another day of building real interview skills. Take a breath. You earned this.",
    cta: "Done for today",
  },
  ontime: {
    title: "YOU SHOWED UP. THAT'S THE WIN. 🔥",
    body: "Every time you show up on time, you're becoming the engineer you want to be. Future you is counting on today's you.",
    cta: "Let's do this",
  },
  late: {
    title: "HEY. YOUR FUTURE SELF IS WAITING.",
    body: "You said you wanted to become interview-ready. You don't need a perfect day. You just need to start. Even 20 focused minutes count.",
    cta: "Start now",
  },
};
const PRIORITY = ["comeback", "beyond", "complete", "reflect", "ontime", "late"];

const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local
const storeKey = () => `popups:${todayStr()}`;
const shownToday = () => JSON.parse(localStorage.getItem(storeKey()) || "[]");
const markShown = (...keys) => localStorage.setItem(storeKey(), JSON.stringify([...new Set([...shownToday(), ...keys])]));

export default function Popups() {
  const sessions = useSessions();
  const streak = useStreak();
  const problems = useProblems();
  const videos = useVideos();
  const mocks = useMocks();
  const reflections = useReflections();
  const [now, setNow] = useState(Date.now());
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if ([sessions, streak, problems, videos, mocks, reflections].some((q) => !q.data) || current) return;
    const day = todayStr();
    const todays = sessions.data.filter((s) => new Date(s.start_time).toLocaleDateString("en-CA") === day);
    const planned = new Set(todays.map((s) => s.ref_id).filter(Boolean));
    const extra = [...problems.data, ...videos.data, ...mocks.data].filter((x) => x.completed_on === day && !planned.has(x.id)).length;
    const planDone = todays.length > 0 && todays.every((s) => s.done);
    const earliest = todays.length ? Math.min(...todays.map((s) => new Date(s.start_time).getTime())) : null;
    const comeback = streak.data.last_14.at(-2)?.state === "missed";

    const eligible = {
      comeback,
      beyond: planDone && extra > 0,
      complete: planDone,
      reflect: planDone && !reflections.data.some((r) => r.day === day),
      ontime: todays.some((s) => s.started_at && new Date(s.started_at) <= new Date(s.start_time).getTime() + GRACE_MS),
      late:
        earliest !== null && now > earliest + GRACE_MS && !todays.some((s) => s.started_at || s.done) && !comeback,
    };
    const shown = shownToday();
    const next = PRIORITY.find((k) => eligible[k] && !shown.includes(k));
    if (next) {
      // one celebration per moment: beyond covers complete
      markShown(next, ...(next === "beyond" ? ["complete"] : []));
      setCurrent(next);
    }
  }, [sessions.data, streak.data, problems.data, videos.data, mocks.data, reflections.data, now, current]);

  if (!current) return null;
  if (current === "reflect")
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" data-testid="popup-reflect" onClick={() => setCurrent(null)}>
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-slate-900 p-8">
          <h2 className="mb-4 text-xl font-extrabold text-emerald-400">Wrap up today</h2>
          <ReflectionForm onSaved={() => setCurrent(null)} />
        </div>
      </div>
    );
  const p = POPUPS[current];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" data-testid="popup-overlay" onClick={() => setCurrent(null)}>
      <div
        data-testid={`popup-${current}`}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md rounded-2xl border border-emerald-500/40 bg-slate-900 p-8 shadow-[0_0_60px_rgba(16,185,129,0.15)]"
      >
        <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-emerald-400">{p.title}</h2>
        <p className="mb-6 leading-relaxed text-slate-300">{p.body}</p>
        <button
          data-testid="popup-dismiss"
          onClick={() => setCurrent(null)}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:brightness-110 active:scale-[0.98]"
        >
          {p.cta}
        </button>
      </div>
    </div>
  );
}
