"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CandidateExamPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.3)]">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">Candidate session</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{sessionId}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="mb-3 flex items-center justify-between px-2 pt-1">
            <div>
              <h2 className="text-lg font-semibold text-white">Live Proctoring Feed</h2>
              <p className="text-sm text-slate-300">Camera and microphone monitoring</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${cameraReady ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border border-amber-500/30 bg-amber-500/10 text-amber-200"}`}>
              {cameraReady ? "Ready" : "Waiting"}
            </span>
          </div>
          <video className="aspect-video w-full rounded-xl bg-black object-cover" muted playsInline autoPlay ref={videoRef} />
        </div>

        <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-white">Device Status</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className={cameraReady ? "text-emerald-300" : "text-slate-300"}>{cameraReady ? "Camera and mic ready" : "Waiting for permissions"}</p>
            </div>
            {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-red-300">{error}</p> : null}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200">
              <div className="flex items-center justify-between">
                <span>Session</span>
                <span className="font-medium text-white">{sessionId}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
