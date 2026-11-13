import { DIFF, STATUS } from "@/lib/data";

export const Card = ({ className = "", ...p }) => (
  <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-5 ${className}`} {...p} />
);

export const Badge = ({ children, tone }) => (
  <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${tone}`}>{children}</span>
);

export const DiffBadge = ({ d }) => <Badge tone={DIFF[d]}>{d}</Badge>;

export const Select = ({ value, options, onChange, testid }) => (
  <select
    data-testid={testid}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`rounded-md border px-2 py-1 text-xs ${STATUS[value] || "border-slate-700 bg-slate-800"} bg-slate-900`}
  >
    {options.map((o) => (
      <option key={o} value={o} className="bg-slate-900 text-slate-200">
        {o}
      </option>
    ))}
  </select>
);

export const Progress = ({ value, total }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
    <div
      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all"
      style={{ width: `${total ? (value / total) * 100 : 0}%` }}
    />
  </div>
);

export const inputCls =
  "rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500";
export const btnCls =
  "rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:brightness-110 active:scale-[0.98]";

// Notes box that saves on blur.
export function Notes({ value, onSave }) {
  return (
    <textarea
      defaultValue={value}
      placeholder="Notes…"
      rows={2}
      onBlur={(e) => e.target.value !== value && onSave(e.target.value)}
      className={`${inputCls} w-full`}
    />
  );
}

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "");

// datetime-local value -> ISO with offset
export const localToIso = (v) => (v ? new Date(v).toISOString() : null);
// ISO -> datetime-local value
export const isoToLocal = (iso) =>
  iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
