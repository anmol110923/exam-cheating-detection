"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { CandidateSession } from "@/lib/types";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<CandidateSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listSessions().then(setSessions).catch((err) => setError(err.message));
  }, []);

  return (
    <section className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Candidate Sessions</h1>
          <p className="text-sm text-muted">Live and completed proctoring sessions.</p>
        </div>
        <Link className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white" href="/sessions/new">
          New
        </Link>
      </div>
      {error ? <p className="rounded-md border border-danger bg-white p-4 text-danger">{error}</p> : null}
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Exam</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr className="border-t border-line" key={session.id}>
                <td className="px-4 py-3">
                  <Link className="font-medium text-accent" href={`/sessions/${session.id}`}>
                    {session.candidate_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{session.exam_name ?? session.exam_id}</td>
                <td className="px-4 py-3">{session.status}</td>
                <td className="px-4 py-3">{new Date(session.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
