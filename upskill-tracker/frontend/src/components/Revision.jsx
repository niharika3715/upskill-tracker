import { Card } from "@/components/ui";
import { ProblemRow } from "@/components/Problems";
import { useProblems } from "@/lib/hooks";

export default function Revision() {
  const { data: problems = [] } = useProblems();
  const deck = problems.filter((p) => p.revise || p.status === "Revise");

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="mb-2 font-semibold">Problems to revise ({deck.length})</h3>
        {deck.length === 0 && <p className="text-sm text-slate-500">Star problems or set status to Revise to build your weekend deck.</p>}
        {deck.map((p) => (
          <ProblemRow key={p.id} p={p} />
        ))}
      </Card>
    </div>
  );
}
