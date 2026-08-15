"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { api, mediaUrl, reportDownloadUrl } from "@/lib/api";
import type { CandidateSession, Incident, Report } from "@/lib/types";

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<CandidateSession | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.getSession(sessionId), api.listIncidents(sessionId), api.listReports(sessionId)]).then(([sessionData, incidentData, reportData]) => {
      setSession(sessionData);
      setIncidents(incidentData);
      setReports(reportData);
    });
  }, [sessionId]);

  const violationIncidents = incidents.filter((incident) => incident.type !== "SESSION_RECORDING");
  const recordingEvidence = incidents.filter((incident) => incident.type === "SESSION_RECORDING");
  const severityTotal = violationIncidents.reduce((total, incident) => total + incident.severity, 0);

  async function generateReport() {
    setBusy(true);
    try {
      const report = await api.createReport(sessionId);
      setReports((current) => [report, ...current]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm text-muted">Report</p>
        <h1 className="text-2xl font-semibold">{session?.candidate_name ?? "Session report"}</h1>
      </div>
      <div>
        <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white" disabled={busy} onClick={generateReport}>
          {busy ? "Generating" : "Generate report"}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Summary label="Total violations" value={String(violationIncidents.length)} />
        <Summary label="Severity score" value={String(severityTotal)} />
        <Summary label="Session status" value={session?.status ?? "loading"} />
      </div>
      <div className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">Session Evidence</h2>
        </div>
        <div className="divide-y divide-line">
          {recordingEvidence.map((incident) =>
            incident.evidence.map((evidence) => (
              <div className="flex items-center justify-between px-5 py-4 text-sm" key={evidence.id}>
                <div>
                  <p className="font-medium">{evidence.kind}</p>
                  <p className="text-muted">{new Date(evidence.created_at).toLocaleString()}</p>
                </div>
                <a className="rounded-md border border-line px-3 py-2 font-medium" href={mediaUrl(evidence.path)}>
                  Open
                </a>
              </div>
            )),
          )}
        </div>
      </div>
      <div className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">Generated Reports</h2>
        </div>
        <div className="divide-y divide-line">
          {reports.map((report) => (
            <div className="flex items-center justify-between px-5 py-4 text-sm" key={report.id}>
              <div>
                <p className="font-medium">{report.status}</p>
                <p className="text-muted">{new Date(report.created_at).toLocaleString()}</p>
              </div>
              {report.status === "ready" ? (
                <a className="rounded-md border border-line px-3 py-2 font-medium" href={reportDownloadUrl(report.id)}>
                  Open
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">Incidents</h2>
        </div>
        <div className="divide-y divide-line">
          {violationIncidents.map((incident) => (
            <article className="grid gap-2 px-5 py-4 text-sm" key={incident.id}>
              <div className="flex justify-between">
                <strong>{incident.type}</strong>
                <span className="text-muted">{new Date(incident.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-muted">Evidence files: {incident.evidence.length}</p>
              <div className="flex flex-wrap gap-2">
                {incident.evidence.map((evidence) => (
                  <a className="rounded-md border border-line px-3 py-1 text-xs font-medium" href={mediaUrl(evidence.path)} key={evidence.id}>
                    {evidence.kind}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
