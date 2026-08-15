import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Exam Proctoring",
  description: "AI powered exam monitoring dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-line bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <a className="text-lg font-semibold tracking-normal" href="/">
                Exam Proctoring
              </a>
              <nav className="flex items-center gap-4 text-sm text-muted">
                <a href="/sessions">Sessions</a>
                <a href="/sessions/new">New Session</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
