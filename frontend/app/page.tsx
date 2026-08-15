import Link from "next/link";

import { SplineScene } from "@/components/ui/spline";

export default function HomePage() {
  return (
    <section className="relative isolate min-h-[calc(100vh-73px)] overflow-hidden bg-[#020617]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-y-0 right-[-10%] w-[70%] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.22),rgba(15,23,42,0)_55%)]" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at left center, rgba(15,23,42,0.25) 0%, rgba(2,6,23,0.7) 42%, rgba(2,6,23,0.96) 72%, rgba(2,6,23,1) 100%)",
          }}
        />
        <div className="absolute inset-y-0 right-[-6%] w-[58%] translate-x-8 scale-[1.18] [filter:brightness(1.3)_contrast(1.1)]">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="relative z-10 grid gap-6 py-12">
        <div>
          <p className="text-sm font-medium text-accent">Monitoring Console</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold text-white">Exam cheating detection dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Create candidate sessions, start the Python detection runtime, and review live violations from one
            operational workspace.
          </p>
        </div>
        <div className="flex gap-3">
          <Link className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white" href="/sessions/new">
            Create session
          </Link>
          <Link className="rounded-md border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-100" href="/sessions">
            View sessions
          </Link>
        </div>
      </div>
    </section>
  );
}
