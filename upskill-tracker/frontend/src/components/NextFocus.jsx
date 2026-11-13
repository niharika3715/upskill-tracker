import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Card, Notes, Select, btnCls, inputCls } from "@/components/ui";
import { RESOURCE_STATUSES, api } from "@/lib/data";
import { useResources, useWrite } from "@/lib/hooks";

const empty = { title: "", url: "", blurb: "" };

export default function NextFocus() {
  const { data: items = [] } = useResources();
  const update = useWrite(({ id, ...body }) => api.updateResource(id, body));
  const create = useWrite(api.createResource);
  const remove = useWrite(api.deleteResource);
  const [f, setF] = useState(empty);
  const [open, setOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    create.mutate(f, { onSuccess: () => { setF(empty); setOpen(false); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Pick these up once DSA and System Design are done.</p>
        <button onClick={() => setOpen(!open)} className={`${btnCls} flex items-center gap-1`}>
          <Plus size={14} /> Add
        </button>
      </div>
      {open && (
        <Card>
          <form onSubmit={submit} className="flex flex-wrap gap-2">
            <input required placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} />
            <input required type="url" placeholder="Link" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} className={`${inputCls} min-w-64 flex-1`} />
            <input placeholder="Description" value={f.blurb} onChange={(e) => setF({ ...f, blurb: e.target.value })} className={`${inputCls} min-w-64 flex-1`} />
            <button className={btnCls}>Save</button>
          </form>
          {create.isError && <p className="mt-2 text-xs text-rose-400">{create.error?.response?.data?.detail || "Failed to add"}</p>}
        </Card>
      )}
      <Card>
        {items.map((r, i) => (
          <div key={r.id} className="space-y-2 border-b border-slate-800 py-3 last:border-0">
            <div className="flex items-center gap-3">
              <span className="w-8 font-mono text-xs text-slate-500">{i + 1}</span>
              <div className="flex-1">
                <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-400">
                  {r.title} <ExternalLink size={12} />
                </a>
                <p className="text-xs text-slate-500">{r.blurb}</p>
              </div>
              {r.custom ? (
                <button title="Delete" onClick={() => remove.mutate(r.id)} className="text-slate-600 hover:text-rose-400">
                  <Trash2 size={16} />
                </button>
              ) : null}
              <Select testid="resource-status-select" value={r.status} options={RESOURCE_STATUSES} onChange={(status) => update.mutate({ id: r.id, status })} />
            </div>
            <Notes value={r.notes} onSave={(notes) => update.mutate({ id: r.id, notes })} />
          </div>
        ))}
      </Card>
    </div>
  );
}
