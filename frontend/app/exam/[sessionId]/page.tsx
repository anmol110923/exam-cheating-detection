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
      <div>
        <p className="text-sm text-muted">Candidate session {sessionId}</p>
        <h1 className="text-2xl font-semibold">Exam Monitoring</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <video className="aspect-video w-full rounded-lg bg-black object-cover" muted playsInline autoPlay ref={videoRef} />
        <aside className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Device Status</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <p className={cameraReady ? "text-success" : "text-muted"}>{cameraReady ? "Camera and mic ready" : "Waiting for permissions"}</p>
            {error ? <p className="text-danger">{error}</p> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
