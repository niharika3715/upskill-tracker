import { Badge, Card } from "@/components/ui";

const PROJECTS = [
  {
    title: "LLM gateway and load harness",
    stack: "Java / Spring Boot",
    points: [
      "Proxy service for LLM calls",
      "Retries, rate limiting, circuit breaker, response cache",
      "Per-request cost and latency metrics",
      "Load-test with existing NFR approach; publish p50/p99",
    ],
    why: "Strongest backend signal: production engineering around AI.",
  },
  {
    title: "MCP ops/triage agent",
    stack: "MCP server + agent",
    points: [
      "MCP server exposing logs, deploy status, metrics",
      "Agent using it, with tool schemas, timeouts, idempotency",
      "Audit log of every tool call",
    ],
    why: "Shows safe integration of AI into backend systems.",
  },
  {
    title: "RAG service",
    stack: "Postgres/pgvector or Elasticsearch",
    points: [
      "Ingestion pipeline with queues and idempotent indexing",
      "Retrieval API with observability",
      "Eval set reporting recall@k",
    ],
    why: "Treat as a backend system, not a notebook.",
  },
];

export default function ResumeProjects() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Target projects for backend-with-AI roles, in build order.</p>
      {PROJECTS.map((p, i) => (
        <Card key={p.title} className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 font-mono text-xs text-slate-500">{i + 1}</span>
            <h3 className="flex-1 font-semibold">{p.title}</h3>
            <Badge>{p.stack}</Badge>
          </div>
          <ul className="list-disc space-y-1 pl-12 text-sm text-slate-300">
            {p.points.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="pl-11 text-xs text-slate-500">{p.why}</p>
        </Card>
      ))}
    </div>
  );
}
