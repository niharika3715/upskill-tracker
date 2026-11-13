import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, btnCls, inputCls } from "@/components/ui";
import { api } from "@/lib/data";
import { useOwnership, usePace, useReflections, useStreak, useWrite } from "@/lib/hooks";

const todayStr = () => new Date().toLocaleDateString("en-CA");

export function PaceCard() {
  const { data: p } = usePace();
  if (!p) return null;
  const tone = p.on_track ? "text-emerald-400" : "text-rose-400";
  return (
    <Card data-testid="pace-card" className="flex flex-wrap items-center gap-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Apply in</p>
        <p className="text-3xl font-extrabold">{p.days_left} days</p>
        <p className="text-xs text-slate-500">{p.apply_date}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">DSA pace / day</p>
        <p className={`text-3xl font-extrabold ${tone}`}>
          {p.actual_per_day} <span className="text-lg text-slate-500">of {p.needed_per_day} needed</span>
        </p>
        <p className="text-xs text-slate-500">{p.remaining} problems left · 7-day average</p>
      </div>
      <p className={`text-sm font-semibold ${tone}`}>{p.on_track ? "On track" : "Behind: do extra today"}</p>
    </Card>
  );
}

export function ConfidenceLog() {
  const { data = [] } = useReflections();
  const save = useWrite(api.saveReflection);
  const mine = data.find((r) => r.day === todayStr());
  const [text, setText] = useState(null);
  const value = text ?? mine?.owned ?? "";
  return (
    <Card data-testid="confidence-log">
      <h3 className="mb-1 font-semibold">Confidence log</h3>
      <p className="mb-3 text-xs text-slate-500">One line: a decision I owned or something I shipped today.</p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ owned: value }, { onSuccess: () => setText(null) });
        }}
      >
        <input data-testid="owned-input" value={value} onChange={(e) => setText(e.target.value)} className={`${inputCls} flex-1`} placeholder="e.g. Proposed Redis as backup cache" />
        <button data-testid="owned-save" className={btnCls}>Save</button>
      </form>
    </Card>
  );
}

export function OwnershipChecklist() {
  const { data: steps = [] } = useOwnership();
  const toggle = useWrite(({ id, done }) => api.updateOwnership(id, { done }));
  return (
    <Card data-testid="ownership-card">
      <h3 className="mb-3 font-semibold">
        Own one module{" "}
        <span className="text-sm text-slate-500">
          {steps.filter((s) => s.done).length}/{steps.length}
        </span>
      </h3>
      {steps.map((s) => (
        <label key={s.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-800 py-2 text-sm last:border-0">
          <input type="checkbox" data-testid="ownership-step" checked={s.done} onChange={(e) => toggle.mutate({ id: s.id, done: e.target.checked })} />
          <span className={s.done ? "text-slate-500 line-through" : ""}>{s.title}</span>
        </label>
      ))}
    </Card>
  );
}

export function SlipBanner() {
  const { data: streak } = useStreak();
  if (!streak || streak.today_done || new Date().getHours() < 12) return null;
  return (
    <div data-testid="slip-banner" className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
      <AlertTriangle size={18} /> Past noon and nothing done today. Start the first DSA problem now.
    </div>
  );
}
