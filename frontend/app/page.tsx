import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-accent">Monitoring Console</p>
        <h1 className="mt-2 text-3xl font-semibold">Exam cheating detection dashboard</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Create candidate sessions, start the Python detection runtime, and review live violations from one
          operational workspace.
        </p>
      </div>
      <div className="flex gap-3">
        <Link className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white" href="/sessions/new">
          Create session
        </Link>
        <Link className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium" href="/sessions">
          View sessions
        </Link>
      </div>
    </section>
  );
}
