import { useState } from "react";
import { Card, btnCls, inputCls } from "@/components/ui";
import { api } from "@/lib/data";
import { useReflections, useWrite } from "@/lib/hooks";

const todayStr = () => new Date().toLocaleDateString("en-CA");

export function ReflectionForm({ onSaved }) {
  const { data = [] } = useReflections();
  const save = useWrite(api.saveReflection);
  const mine = data.find((r) => r.day === todayStr());
  const [f, setF] = useState({ went_well: mine?.went_well ?? "", focus_tomorrow: mine?.focus_tomorrow ?? "" });
  const field = (k, label) => (
    <label className="block text-sm text-slate-300">
      {label}
      <textarea required rows={2} data-testid={`reflection-${k}`} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={`${inputCls} mt-1 w-full`} />
    </label>
  );
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(f, { onSuccess: onSaved });
      }}
    >
      {field("went_well", "What did I do well today?")}
      {field("focus_tomorrow", "What should I focus on tomorrow?")}
      <button data-testid="reflection-save" className={btnCls}>Save</button>
    </form>
  );
}

export default function Reflections() {
  const { data = [] } = useReflections();
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="mb-3 font-semibold">Today</h3>
        <ReflectionForm />
      </Card>
      {data.map((r) => (
        <Card key={r.day} data-testid="reflection-entry">
          <p className="mb-2 font-mono text-xs text-slate-500">{r.day}</p>
          <p className="text-sm"><span className="text-emerald-400">Did well:</span> {r.went_well}</p>
          <p className="text-sm"><span className="text-amber-400">Focus next:</span> {r.focus_tomorrow}</p>
          {r.owned && <p className="text-sm"><span className="text-indigo-400">Owned:</span> {r.owned}</p>}
        </Card>
      ))}
    </div>
  );
}
