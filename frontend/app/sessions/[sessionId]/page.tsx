"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { CandidateSession, DetectionStatus, Incident } from "@/lib/types";
import { useSessionEvents } from "@/hooks/useSessionEvents";

export default function SessionPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const { connected, events } = useSessionEvents(sessionId);
  const [session, setSession] = useState<CandidateSession | null>(null);
  const [status, setStatus] = useState<DetectionStatus | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSession(sessionId), api.getStatus(sessionId), api.listIncidents(sessionId)])
      .then(([sessionData, statusData, incidentsData]) => {
        setSession(sessionData);
        setStatus(statusData);
        setIncidents(incidentsData);
        setError(null);
      })
      .catch((err) => setError(err.message || "Unable to load session data"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    for (const event of events.slice(0, 1)) {
      if (event.type === "detection.status") {
        setStatus(event.payload as unknown as DetectionStatus);
      }
      if (event.type === "violation.created") {
        setIncidents((current) => [event.payload as unknown as Incident, ...current]);
      }
      if (event.type === "session.started" || event.type === "session.stopped") {
        setSession(event.payload as unknown as CandidateSession);
      }
      if (event.type === "error") {
        const message = event.payload.message;
        setRuntimeError(typeof message === "string" ? message : "Detection worker failed");
        if (event.payload.session) {
          setSession(event.payload.session as CandidateSession);
        }
      }
    }
  }, [events]);

  const violationIncidents = useMemo(() => incidents.filter((incident) => incident.type !== "SESSION_RECORDING"), [incidents]);
  const latestIncident = useMemo(() => violationIncidents[0], [violationIncidents]);

  async function start() {
    setSession(await api.startSession(sessionId));
  }

  async function stop() {
    setSession(await api.stopSession(sessionId));
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.3)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">Session</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{session?.candidate_name ?? "Session"}</h1>
            <p className="mt-2 text-sm text-slate-300">{session?.candidate_id ?? "Candidate details unavailable"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400" onClick={start} type="button">
              Start
            </button>
            <button className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400" onClick={stop} type="button">
              Stop
            </button>
            <Link className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-slate-600 hover:text-white" href={`/sessions/${sessionId}/report`}>
              Report
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-slate-900/80 p-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-300">Session error</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Unable to load session</h2>
          <p className="mt-2 text-sm text-slate-300">{error}</p>
        </div>
      ) : null}

      {runtimeError ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
          {runtimeError}
        </div>
      ) : null}

      {loading && !error ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div className="h-28 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" key={idx} />
          ))}
        </div>
      ) : null}

      {!loading || !!session ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Session" value={session?.status ?? "loading"} />
          <Metric label="Events" value={connected ? "connected" : "offline"} />
          <Metric label="Face" value={status?.face_present ? "present" : "absent"} />
          <Metric label="Violations" value={String(violationIncidents.length)} />
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Monitoring Status</h2>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-sky-200">
              Active
            </span>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <StatusRow label="Exam" value={session?.exam_name ?? session?.exam_id ?? "unknown"} />
            <StatusRow label="Gaze" value={status?.gaze_direction ?? "unknown"} />
            <StatusRow label="Eye ratio" value={status ? status.eye_ratio.toFixed(3) : "unknown"} />
            <StatusRow label="Mouth" value={status?.mouth_moving ? "moving" : "still"} />
            <StatusRow label="Multiple faces" value={status?.multiple_faces ? "yes" : "no"} />
            <StatusRow label="Objects" value={status?.objects_detected ? "detected" : "clear"} />
            <StatusRow label="Updated" value={status ? new Date(status.timestamp).toLocaleTimeString() : "unknown"} />
            <StatusRow label="Connection" value={connected ? "Live" : "Offline"} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-white">Latest Violation</h2>
          {latestIncident ? (
            <div className="mt-4 space-y-3 text-sm">
              <p className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.18em] text-red-300">
                {latestIncident.type}
              </p>
              <p className="text-slate-300">{new Date(latestIncident.timestamp).toLocaleString()}</p>
              <p className="text-slate-200">Severity {latestIncident.severity}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">No violations yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Violation Timeline</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{violationIncidents.length} events</span>
        </div>
        <div className="divide-y divide-slate-800">
          {violationIncidents.length > 0 ? (
            violationIncidents.map((incident) => (
              <div className="grid gap-2 px-5 py-4 text-sm text-slate-200" key={incident.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-white">{incident.type}</span>
                  <span className="text-slate-300">{new Date(incident.timestamp).toLocaleString()}</span>
                </div>
                <span className="text-slate-300">Status: {incident.status}</span>
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-sm text-slate-300">No violation events have been recorded yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
