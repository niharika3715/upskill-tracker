import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, btnCls, fmtDate, inputCls, localToIso } from "@/components/ui";
import { SESSION_CATEGORIES, api } from "@/lib/data";
import { useSessions, useWrite } from "@/lib/hooks";

const empty = { title: "", category: SESSION_CATEGORIES[0], start: "", duration_min: 60 };

export default function Sessions() {
  const { data: sessions = [] } = useSessions();
  const create = useWrite(api.createSession);
  const update = useWrite(({ id, ...body }) => api.updateSession(id, body));
  const remove = useWrite(api.deleteSession);
  const [f, setF] = useState(empty);
  const [show, setShow] = useState("Pending");
  const visible = sessions.filter((s) => show === "All" || (show === "Done") === s.done);

  const submit = (e) => {
    e.preventDefault();
    const { start, ...rest } = f;
    create.mutate({ ...rest, start_time: localToIso(start), duration_min: Number(f.duration_min) }, { onSuccess: () => setF(empty) });
  };

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input required data-testid="session-title" placeholder="What will you study?" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`${inputCls} flex-1`} />
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls}>
            {SESSION_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input required type="datetime-local" data-testid="session-start" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} className={inputCls} />
          <input type="number" min={5} step={5} value={f.duration_min} onChange={(e) => setF({ ...f, duration_min: e.target.value })} className={`${inputCls} w-20`} title="Minutes" />
          <button data-testid="schedule-session-btn" className={btnCls}>Schedule</button>
        </form>
      </Card>

      <Card>
        <select value={show} onChange={(e) => setShow(e.target.value)} className={`${inputCls} mb-2`}>
          <option value="Pending">Pending</option>
          <option value="Done">Completed</option>
          <option value="All">All</option>
        </select>
        {visible.length === 0 && <p className="text-sm text-slate-500">No sessions.</p>}
        {visible.map((s) => (
          <div key={s.id} className="flex items-center gap-3 border-b border-slate-800 py-3 last:border-0">
            <input type="checkbox" data-testid="session-done" checked={s.done} onChange={(e) => update.mutate({ id: s.id, done: e.target.checked })} />
            <span className={`flex-1 ${s.done ? "text-slate-500 line-through" : ""}`}>
              {s.title} <span className="text-xs text-slate-500">· {s.category} · {s.duration_min}m</span>
            </span>
            <span className="text-sm text-slate-400">{fmtDate(s.start_time)}</span>
            <button title="Delete" onClick={() => remove.mutate(s.id)} className="text-slate-600 hover:text-rose-400">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}
