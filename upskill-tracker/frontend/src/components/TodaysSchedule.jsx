import { Card } from "@/components/ui";
import { api } from "@/lib/data";
import { useSessions, useWrite } from "@/lib/hooks";

export default function TodaysSchedule() {
  const { data: sessions = [] } = useSessions();
  const start = useWrite(api.startSession);
  const toggle = useWrite(({ id, done }) => api.updateSession(id, { done }));
  const endOfToday = new Date().setHours(23, 59, 59, 999);
  const todays = sessions.filter((x) => new Date(x.start_time) <= endOfToday && new Date(x.start_time) >= new Date().setHours(0, 0, 0, 0));

  return (
    <Card data-testid="todays-schedule">
      <h3 className="mb-3 font-semibold">
        Today's schedule{" "}
        <span className="text-sm text-slate-500">
          {todays.filter((x) => x.done).length}/{todays.length} done
        </span>
      </h3>
      {todays.every((x) => x.done) && (
        <p className="text-sm text-slate-500">{todays.length ? "All done for today." : "Nothing scheduled today."}</p>
      )}
      {todays.filter((x) => !x.done).map((x) => (
        <label key={x.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-800 py-2 text-sm last:border-0">
          <input type="checkbox" data-testid="overview-session-done" checked={x.done} onChange={(e) => toggle.mutate({ id: x.id, done: e.target.checked })} />
          <span className="w-28 font-mono text-xs text-slate-400">
            {new Date(x.start_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            {" – "}
            {new Date(new Date(x.start_time).getTime() + x.duration_min * 60000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
          <span className={`flex-1 ${x.done ? "text-slate-500 line-through" : ""}`}>{x.title}</span>
          <span className="text-xs text-slate-500">{x.category}</span>
          {!x.done && !x.started_at && (
            <button
              type="button"
              data-testid="session-start-btn"
              onClick={(e) => {
                e.preventDefault();
                start.mutate(x.id);
              }}
              className="rounded-md border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-400 hover:bg-emerald-500/10"
            >
              Start
            </button>
          )}
          {!x.done && x.started_at && <span className="text-xs text-blue-400">in progress</span>}
        </label>
      ))}
    </Card>
  );
}
