import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Card, Notes, Select, btnCls, inputCls, isoToLocal, localToIso } from "@/components/ui";
import { MOCK_STATUSES, api } from "@/lib/data";
import { useMocks, useWrite } from "@/lib/hooks";

export default function Mocks() {
  const { data: mocks = [] } = useMocks();
  const update = useWrite(({ id, ...body }) => api.updateMock(id, body));
  const remove = useWrite(api.deleteMock);
  const create = useWrite(api.createMock);
  const [form, setForm] = useState({ title: "", kind: "DSA", platform: "Pramp", link: "" });

  const submit = (e) => {
    e.preventDefault();
    create.mutate(form, { onSuccess: () => setForm({ ...form, title: "", link: "" }) });
  };

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input required data-testid="mock-title" placeholder="Mock title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`${inputCls} flex-1`} />
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={inputCls}>
            <option>DSA</option>
            <option>System Design</option>
          </select>
          <input placeholder="Platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={`${inputCls} w-28`} />
          <input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputCls} />
          <button data-testid="add-mock-btn" className={btnCls}>Add mock</button>
        </form>
      </Card>

      <Card>
        {mocks.map((m) => (
          <div key={m.id} className="space-y-2 border-b border-slate-800 py-3 last:border-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex-1">
                {m.link ? (
                  <a href={m.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-emerald-400">
                    {m.title} <ExternalLink size={12} />
                  </a>
                ) : (
                  m.title
                )}
                <span className="ml-2 text-xs text-slate-500">
                  {m.kind} · {m.platform}
                </span>
              </span>
              <input
                type="datetime-local"
                data-testid="mock-schedule"
                value={isoToLocal(m.scheduled_for)}
                onChange={(e) =>
                  update.mutate({ id: m.id, scheduled_for: localToIso(e.target.value), ...(e.target.value && m.status === "Planned" ? { status: "Scheduled" } : {}) })
                }
                className={inputCls}
              />
              <Select testid="mock-status-select" value={m.status} options={MOCK_STATUSES} onChange={(status) => update.mutate({ id: m.id, status })} />
              <button title="Delete" onClick={() => remove.mutate(m.id)} className="text-slate-600 hover:text-rose-400">
                <Trash2 size={16} />
              </button>
            </div>
            <Notes value={m.notes} onSave={(notes) => update.mutate({ id: m.id, notes })} />
          </div>
        ))}
      </Card>
    </div>
  );
}
