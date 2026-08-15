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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSession(sessionId), api.listIncidents(sessionId), api.listReports(sessionId)])
      .then(([sessionData, incidentData, reportData]) => {
        setSession(sessionData);
        setIncidents(incidentData);
        setReports(reportData);
        setError(null);
      })
      .catch((err) => setError(err.message || "Unable to load report data"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const violationIncidents = incidents.filter((incident) => incident.type !== "SESSION_RECORDING");
  const recordingEvidence = incidents.filter((incident) => incident.type === "SESSION_RECORDING");
  const severityTotal = violationIncidents.reduce((total, incident) => total + incident.severity, 0);

  async function generateReport() {
    setBusy(true);
    try {
      const report = await api.createReport(sessionId);
      setReports((current) => [report, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.3)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">Report</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{session?.candidate_name ?? "Session report"}</h1>
            <p className="mt-2 text-sm text-slate-300">{session?.exam_name ?? session?.exam_id ?? "Candidate report"}</p>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={generateReport}
            type="button"
          >
            {busy ? "Generating..." : "Generate report"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-slate-900/80 p-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-300">Report error</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Unable to load report</h2>
          <p className="mt-2 text-sm text-slate-300">{error}</p>
        </div>
      ) : null}

      {loading && !error ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div className="h-28 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" key={idx} />
          ))}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Summary label="Total violations" value={String(violationIncidents.length)} />
          <Summary label="Severity score" value={String(severityTotal)} />
          <Summary label="Session status" value={session?.status ?? "loading"} />
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="border-b border-slate-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Session Evidence</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {recordingEvidence.length > 0 ? (
                recordingEvidence.map((incident) =>
                  incident.evidence.map((evidence) => (
                    <div className="flex items-center justify-between gap-4 px-5 py-4 text-sm text-slate-200" key={evidence.id}>
                      <div>
                        <p className="font-medium text-white">{evidence.kind}</p>
                        <p className="text-slate-300">{new Date(evidence.created_at).toLocaleString()}</p>
                      </div>
                      <a className="rounded-lg border border-slate-700 px-3 py-2 font-medium text-slate-100 transition hover:border-sky-400 hover:text-sky-200" href={mediaUrl(evidence.path)}>
                        Open
                      </a>
                    </div>
                  )),
                )
              ) : (
                <div className="px-5 py-6 text-sm text-slate-300">No recording evidence available for this session.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="border-b border-slate-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Generated Reports</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div className="flex items-center justify-between gap-4 px-5 py-4 text-sm text-slate-200" key={report.id}>
                    <div>
                      <p className="font-medium text-white">{report.status}</p>
                      <p className="text-slate-300">{new Date(report.created_at).toLocaleString()}</p>
                    </div>
                    {report.status === "ready" ? (
                      <a className="rounded-lg border border-slate-700 px-3 py-2 font-medium text-slate-100 transition hover:border-sky-400 hover:text-sky-200" href={reportDownloadUrl(report.id)}>
                        Open
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="px-5 py-6 text-sm text-slate-300">No reports have been generated yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="border-b border-slate-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Detected Incidents</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {violationIncidents.length > 0 ? (
                violationIncidents.map((incident) => (
                  <article className="grid gap-2 px-5 py-4 text-sm text-slate-200" key={incident.id}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <strong className="text-white">{incident.type}</strong>
                      <span className="text-slate-300">{new Date(incident.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300">Evidence files: {incident.evidence.length}</p>
                    <div className="flex flex-wrap gap-2">
                      {incident.evidence.map((evidence) => (
                        <a className="rounded-md border border-slate-700 px-3 py-1 text-xs font-medium text-slate-100 transition hover:border-sky-400 hover:text-sky-200" href={mediaUrl(evidence.path)} key={evidence.id}>
                          {evidence.kind}
                        </a>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="px-5 py-6 text-sm text-slate-300">No detected incidents have been raised.</div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
