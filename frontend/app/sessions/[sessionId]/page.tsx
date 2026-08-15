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

  useEffect(() => {
    Promise.all([api.getSession(sessionId), api.getStatus(sessionId), api.listIncidents(sessionId)])
      .then(([sessionData, statusData, incidentsData]) => {
        setSession(sessionData);
        setStatus(statusData);
        setIncidents(incidentsData);
      })
      .catch((err) => setError(err.message));
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{session?.candidate_id}</p>
          <h1 className="text-2xl font-semibold">{session?.candidate_name ?? "Session"}</h1>
          <p className="text-sm text-muted">{session?.exam_name ?? session?.exam_id}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md bg-success px-4 py-2 text-sm font-medium text-white" onClick={start}>
            Start
          </button>
          <button className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white" onClick={stop}>
            Stop
          </button>
          <Link className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium" href={`/sessions/${sessionId}/report`}>
            Report
          </Link>
        </div>
      </div>

      {error ? <p className="rounded-md border border-danger bg-white p-4 text-danger">{error}</p> : null}
      {runtimeError ? <p className="rounded-md border border-danger bg-white p-4 text-danger">{runtimeError}</p> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Session" value={session?.status ?? "loading"} />
        <Metric label="Events" value={connected ? "connected" : "offline"} />
        <Metric label="Face" value={status?.face_present ? "present" : "absent"} />
        <Metric label="Violations" value={String(violationIncidents.length)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Detection Status</h2>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <StatusRow label="Gaze" value={status?.gaze_direction ?? "unknown"} />
            <StatusRow label="Eye ratio" value={status ? status.eye_ratio.toFixed(3) : "unknown"} />
            <StatusRow label="Mouth" value={status?.mouth_moving ? "moving" : "still"} />
            <StatusRow label="Multiple faces" value={status?.multiple_faces ? "yes" : "no"} />
            <StatusRow label="Objects" value={status?.objects_detected ? "detected" : "clear"} />
            <StatusRow label="Updated" value={status ? new Date(status.timestamp).toLocaleTimeString() : "unknown"} />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Latest Violation</h2>
          {latestIncident ? (
            <div className="mt-4 text-sm">
              <p className="font-medium text-danger">{latestIncident.type}</p>
              <p className="text-muted">{new Date(latestIncident.timestamp).toLocaleString()}</p>
              <p className="mt-2">Severity {latestIncident.severity}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No violations yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">Violation Timeline</h2>
        </div>
        <div className="divide-y divide-line">
          {violationIncidents.map((incident) => (
            <div className="grid gap-1 px-5 py-4 text-sm" key={incident.id}>
              <div className="flex justify-between gap-3">
                <span className="font-medium">{incident.type}</span>
                <span className="text-muted">{new Date(incident.timestamp).toLocaleString()}</span>
              </div>
              <span className="text-muted">Status: {incident.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-surface px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
