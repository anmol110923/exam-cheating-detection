"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { api } from "@/lib/api";

export default function NewSessionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const session = await api.createSession({
        candidate_id: String(form.get("candidate_id")),
        candidate_name: String(form.get("candidate_name")),
        exam_id: String(form.get("exam_id")),
        exam_name: String(form.get("exam_name"))
      });
      router.push(`/sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create session");
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.3)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">Setup</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Create Session</h1>
          </div>
          <Link className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:text-white" href="/sessions">
            Cancel
          </Link>
        </div>
        <p className="mt-3 max-w-xl text-sm text-slate-300">Create a monitored exam session for a candidate and begin collecting live detection signals.</p>

        <form className="mt-6 grid gap-5" onSubmit={submit}>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["candidate_id", "Candidate ID"],
              ["candidate_name", "Candidate Name"],
              ["exam_id", "Exam ID"],
              ["exam_name", "Exam Name (optional)"]
            ].map(([name, label]) => (
              <label className="grid gap-2 text-sm font-medium text-slate-200" key={name}>
                <span>{label}</span>
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  name={name}
                  placeholder={label}
                  required={name !== "exam_name"}
                />
              </label>
            ))}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-5">
            <Link className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:text-white" href="/sessions">
              Back to sessions
            </Link>
            <button className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-400" type="submit">
              Create Session
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
