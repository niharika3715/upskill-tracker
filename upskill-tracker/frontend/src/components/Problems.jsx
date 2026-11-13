import { useMemo, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { DiffBadge, Notes, Select, inputCls } from "@/components/ui";
import { PROBLEM_STATUSES, api } from "@/lib/data";
import { useProblems, useWrite } from "@/lib/hooks";

export function ProblemRow({ p }) {
  const update = useWrite(({ id, ...body }) => api.updateProblem(id, body));
  const set = (body) => update.mutate({ id: p.id, ...body });
  return (
    <div className="space-y-2 border-b border-slate-800 py-3 last:border-0">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-12 font-mono text-xs text-slate-500">#{p.number}</span>
        <a href={p.url} target="_blank" rel="noreferrer" className="flex flex-1 items-center gap-1 hover:text-emerald-400">
          {p.title} <ExternalLink size={12} />
        </a>
        <DiffBadge d={p.difficulty} />
        <Select testid="problem-status-select" value={p.status} options={PROBLEM_STATUSES} onChange={(status) => set({ status })} />
        <button
          data-testid="problem-revise-toggle"
          title="Flag for weekend revision"
          onClick={() => set({ revise: !p.revise })}
          className={p.revise ? "text-amber-400" : "text-slate-600"}
        >
          <Star size={18} fill={p.revise ? "currentColor" : "none"} />
        </button>
      </div>
      <Notes value={p.notes} onSave={(notes) => set({ notes })} />
    </div>
  );
}

export default function Problems() {
  const { data: problems = [] } = useProblems();
  const [q, setQ] = useState("");
  const [pattern, setPattern] = useState("");
  const [diff, setDiff] = useState("");
  const [status, setStatus] = useState("Not Started");

  const patterns = useMemo(() => [...new Set(problems.map((p) => p.pattern))], [problems]);
  const groups = useMemo(() => {
    const filtered = problems.filter(
      (p) =>
        (!pattern || p.pattern === pattern) &&
        (!diff || p.difficulty === diff) &&
        (!status || p.status === status) &&
        (!q || `${p.number} ${p.title}`.toLowerCase().includes(q.toLowerCase())),
    );
    return patterns.map((pat) => [pat, filtered.filter((p) => p.pattern === pat)]).filter(([, l]) => l.length);
  }, [problems, patterns, pattern, diff, status, q]);

  const filter = (value, set, label, opts) => (
    <select value={value} onChange={(e) => set(e.target.value)} className={inputCls}>
      <option value="">{label}</option>
      {opts.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <input data-testid="problem-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={inputCls} />
        {filter(pattern, setPattern, "All patterns", patterns)}
        {filter(diff, setDiff, "All difficulties", ["Easy", "Medium", "Hard"])}
        {filter(status, setStatus, "All statuses", PROBLEM_STATUSES)}
      </div>
      {groups.map(([pat, list]) => (
        <section key={pat} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="mb-2 font-semibold">
            {pat}{" "}
            <span className="text-sm text-slate-500">
              {list.filter((p) => p.status === "Solved").length}/{list.length}
            </span>
          </h3>
          {list.map((p) => (
            <ProblemRow key={p.id} p={p} />
          ))}
        </section>
      ))}
    </div>
  );
}
