"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { CandidateSession } from "@/lib/types";

const statusStyles: Record<string, string> = {
  created: "bg-slate-800 text-slate-200 ring-1 ring-inset ring-slate-700",
  running: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  stopping: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30",
  completed: "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/30",
  failed: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/30"
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<CandidateSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .listSessions()
      .then(setSessions)
      .catch((err) => setError(err.message || "Failed to fetch sessions"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.2)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">Monitoring</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Candidate Sessions</h1>
          <p className="mt-2 text-sm text-slate-300">Live and completed proctoring sessions across the active exam fleet.</p>
        </div>
        <Link className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-400" href="/sessions/new">
          New Session
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-slate-900/80 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-300">Runtime issue</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Unable to load sessions</h2>
              <p className="mt-1 text-sm text-slate-300">The session list could not be retrieved right now. Please try again.</p>
              <p className="mt-3 text-sm text-red-300">{error}</p>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:border-sky-400 hover:text-sky-200"
              onClick={loadSessions}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {loading && !error ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div className="grid grid-cols-[1.5fr_1.5fr_0.8fr_1.2fr] gap-3 animate-pulse" key={idx}>
                <div className="h-11 rounded-lg bg-slate-800" />
                <div className="h-11 rounded-lg bg-slate-800" />
                <div className="h-11 rounded-lg bg-slate-800" />
                <div className="h-11 rounded-lg bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!loading && !error && sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
          <h2 className="text-xl font-semibold text-white">No active sessions</h2>
          <p className="mt-2 text-sm text-slate-300">There are no candidate sessions yet. Create one to begin monitoring.</p>
          <Link className="mt-5 inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-400" href="/sessions/new">
            Create session
          </Link>
        </div>
      ) : null}

      {!loading && !error && sessions.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-[0_0_0_1px_rgba(15,23,42,0.3)]">
          <table className="w-full border-collapse text-sm text-slate-200">
            <thead className="bg-slate-800/80 text-left text-xs uppercase tracking-[0.18em] text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Exam</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr className="border-t border-slate-800 transition-colors hover:bg-slate-800/40" key={session.id}>
                  <td className="px-4 py-4">
                    <Link className="font-medium text-sky-300 transition hover:text-sky-200" href={`/sessions/${session.id}`}>
                      {session.candidate_name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-slate-200">{session.exam_name ?? session.exam_id}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[session.status] ?? statusStyles.created}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{new Date(session.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
