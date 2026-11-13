import { useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { Card, Notes, Select, inputCls } from "@/components/ui";
import { VIDEO_STATUSES, api } from "@/lib/data";
import { useVideos, useWrite } from "@/lib/hooks";

export default function Videos({ kind = "HLD" }) {
  const { data: all = [] } = useVideos();
  const videos = all.filter((v) => v.kind === kind);
  const update = useWrite(({ id, ...body }) => api.updateVideo(id, body));
  const [status, setStatus] = useState("Not Started");

  return (
    <Card>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} mb-2`}>
        <option value="">All statuses</option>
        {VIDEO_STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
        <option value="Revise">Revise</option>
      </select>
      {videos.map((v, i) => ({ v, i })).filter(({ v }) => !status || (status === "Revise" ? v.revise : v.status === status)).map(({ v, i }) => (
        <div key={v.id} className="space-y-2 border-b border-slate-800 py-3 last:border-0">
          <div className="flex items-center gap-3">
            <span className="w-8 font-mono text-xs text-slate-500">{i + 1}</span>
            <a href={v.url} target="_blank" rel="noreferrer" className="flex flex-1 items-center gap-1 hover:text-emerald-400">
              {v.title} <ExternalLink size={12} />
            </a>
            <button
              title="Flag for revision"
              onClick={() => update.mutate({ id: v.id, revise: !v.revise })}
              className={v.revise ? "text-amber-400" : "text-slate-600"}
            >
              <Star size={18} fill={v.revise ? "currentColor" : "none"} />
            </button>
            <Select
              testid="video-status-select"
              value={v.status}
              options={VIDEO_STATUSES}
              onChange={(status) => update.mutate({ id: v.id, status })}
            />
          </div>
          <Notes value={v.notes} onSave={(notes) => update.mutate({ id: v.id, notes })} />
        </div>
      ))}
    </Card>
  );
}
