"use client";

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
    <section className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Create Session</h1>
      <form className="mt-6 grid gap-4 rounded-lg border border-line bg-white p-5" onSubmit={submit}>
        {["candidate_id", "candidate_name", "exam_id", "exam_name"].map((name) => (
          <label className="grid gap-1 text-sm font-medium" key={name}>
            {name.replaceAll("_", " ")}
            <input className="rounded-md border border-line px-3 py-2" name={name} required={name !== "exam_name"} />
          </label>
        ))}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-white" type="submit">
          Create
        </button>
      </form>
    </section>
  );
}
