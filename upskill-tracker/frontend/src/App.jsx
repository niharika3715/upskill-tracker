import { useState } from "react";
import { BookOpenCheck, Boxes, Briefcase, CalendarClock, Code2, LayoutDashboard, Server, Sparkles, Target, Video } from "lucide-react";
import Mocks from "@/components/Mocks";
import Popups from "@/components/Popups";
import Overview from "@/components/Overview";
import Problems from "@/components/Problems";
import Reflections from "@/components/Reflections";
import NextFocus from "@/components/NextFocus";
import ResumeProjects from "@/components/ResumeProjects";
import Revision from "@/components/Revision";
import Sessions from "@/components/Sessions";
import Videos from "@/components/Videos";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, View: Overview },
  { id: "sessions", label: "Scheduler", icon: CalendarClock, View: Sessions },
  { id: "reflect", label: "Reflections", icon: BookOpenCheck, Boxes, View: Reflections },
  { id: "dsa", label: "DSA Patterns", icon: Code2, View: Problems },
  { id: "sd", label: "HLD", icon: Server, View: Videos },
  { id: "lld", label: "LLD", icon: Boxes, View: () => <Videos kind="LLD" /> },
  { id: "next", label: "Next Focus", icon: Target, View: NextFocus },
  { id: "mocks", label: "Mocks", icon: Video, View: Mocks },
  { id: "revise", label: "Weekend Revision", icon: Sparkles, View: Revision },
  { id: "resumeprojects", label: "Resume Projects", icon: Briefcase, View: ResumeProjects },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const { label, View } = TABS.find((t) => t.id === tab);

  return (
    <div className="flex min-h-screen">
      <nav className="w-56 shrink-0 border-r border-slate-800 p-4">
        <h1 className="mb-6 text-lg font-extrabold text-emerald-400">Upskill Tracker</h1>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            data-testid={`tab-${id}`}
            onClick={() => setTab(id)}
            className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
              tab === id ? "bg-emerald-500/15 text-emerald-400" : "text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>
      <main className="flex-1 p-8">
        <h2 className="mb-6 text-2xl font-bold">{label}</h2>
        <View />
      </main>
      <Popups />
    </div>
  );
}
