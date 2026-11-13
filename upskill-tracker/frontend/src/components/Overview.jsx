import { Card, Progress } from "@/components/ui";
import { Flame } from "lucide-react";
import TodaysSchedule from "@/components/TodaysSchedule";
import { ConfidenceLog, OwnershipChecklist, PaceCard, SlipBanner } from "@/components/TodayPanels";
import { useStats, useStreak } from "@/lib/hooks";

export default function Overview() {
  const { data: s } = useStats();
  const { data: streak } = useStreak();
  if (!s) return <p className="text-slate-400">Loading…</p>;

  const tiles = [
    ["DSA solved", s.dsa.solved, s.dsa.total],
    ["System design watched", s.system_design.watched, s.system_design.total],
    ["Mocks done", s.mocks.done, s.mocks.total],
  ];

  return (
    <div className="space-y-6">
      <SlipBanner />
      <div className="grid gap-4 xl:grid-cols-2">
        <PaceCard />
        {streak && <StreakCard streak={streak} />}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map(([label, v, t]) => (
          <Card key={label} className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
              <p className="my-2 text-3xl font-extrabold">
                {v}
                <span className="text-lg text-slate-500"> / {t}</span>
              </p>
              <Progress value={v} total={t} />
            </div>
            <Ring pct={t ? Math.round((v / t) * 100) : 0} />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">By pattern</h3>
          <div className="space-y-3">
            {Object.entries(s.dsa.by_pattern).map(([p, v]) => (
              <div key={p}>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{p}</span>
                  <span>
                    {v.solved}/{v.total}
                  </span>
                </div>
                <Progress value={v.solved} total={v.total} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-1 font-semibold">Difficulty</h3>
            <div className="flex gap-6 text-sm text-slate-300">
              {Object.entries(s.dsa.by_difficulty).map(([d, v]) => (
                <span key={d}>
                  {d}: {v.solved}/{v.total}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-amber-400">{s.dsa.revise} flagged for revision</p>
          </Card>
          <TodaysSchedule />
          <ConfidenceLog />
          <OwnershipChecklist />
        </div>
      </div>
    </div>
  );
}

function Ring({ pct }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0">
      <circle cx="38" cy="38" r={r} fill="none" strokeWidth="7" className="stroke-slate-800" />
      <circle cx="38" cy="38" r={r} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-emerald-400" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 38 38)" />
      <text x="38" y="43" textAnchor="middle" className="fill-slate-100 text-[15px] font-bold">{pct}%</text>
    </svg>
  );
}

const DAY_STYLE = {
  done: "bg-emerald-500 border-emerald-400",
  missed: "bg-rose-500/30 border-rose-500/60",
  today: "border-amber-400 border-dashed bg-transparent",
  none: "bg-slate-800/50 border-slate-800",
};

function StreakCard({ streak }) {
  return (
    <Card data-testid="streak-card" className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3">
        <Flame size={36} className={streak.current ? "text-amber-400" : "text-slate-600"} />
        <div>
          <p className="text-3xl font-extrabold">{streak.current} day streak</p>
          <p className="text-xs text-slate-400">
            Longest {streak.longest} · {streak.total_days} active days ·{" "}
            {streak.today_done ? "today done ✓" : "complete something today to keep it"}
          </p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {streak.last_14.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} completed`}
            className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold ${DAY_STYLE[d.state]}`}
          >
            {d.count || ""}
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-500">
        <p>
          {streak.total_14} done in 14 days · {(streak.total_14 / 14).toFixed(1)}/day · best day {streak.best_day}
        </p>
        <p>number = items completed · red = missed · dashed = today</p>
      </div>
    </Card>
  );
}
