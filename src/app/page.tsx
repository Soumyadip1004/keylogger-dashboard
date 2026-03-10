import { ArrowRight, BarChart3, Keyboard, Shield, Wifi } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Keylogger Dashboard — Remote Keystroke Monitoring",
  description:
    "A centralized dashboard for monitoring and viewing captured keystrokes from connected devices over the network.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm tracking-tight">
              Keylogger Dashboard
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
          >
            Open Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 font-medium text-muted-foreground text-xs">
            <Shield className="h-3 w-3" />
            Educational &amp; Authorized Use Only
          </div>
          <h1 className="max-w-3xl font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            Remote Keystroke{" "}
            <span className="text-primary">Monitoring Dashboard</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-8">
            A centralized web dashboard that receives, stores, and displays
            captured keystrokes from connected Python keylogger clients over the
            network — built for cybersecurity learning and awareness.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-6 font-medium text-sm transition-colors hover:bg-muted"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-bold text-2xl tracking-tight sm:text-3xl">
                How It Works
              </h2>
              <p className="mt-2 text-muted-foreground">
                Three simple steps — capture, transmit, and monitor.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Keyboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">1. Capture</h3>
                <p className="text-muted-foreground text-sm leading-6">
                  The Python keylogger client runs on the target machine and
                  captures every keystroke, translating special keys into
                  readable tags like{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    [ENTER]
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    [BACKSPACE]
                  </code>
                  .
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Wifi className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">2. Transmit</h3>
                <p className="text-muted-foreground text-sm leading-6">
                  Every few seconds, the client sends captured keystrokes to
                  this dashboard via a secure HTTP POST request with API key
                  authentication — works from anywhere on the internet.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">3. Monitor</h3>
                <p className="text-muted-foreground text-sm leading-6">
                  Open the dashboard from any browser to view all captured logs
                  in a sortable, filterable data table — organized by device, IP
                  address, and timestamp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="border-t py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-bold text-2xl tracking-tight sm:text-3xl">
                API Endpoints
              </h2>
              <p className="mt-2 text-muted-foreground">
                RESTful API routes that power the keylogger system.
              </p>
            </div>

            <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Endpoint</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded bg-green-500/10 px-2 py-0.5 font-semibold text-green-700 text-xs dark:text-green-400">
                        POST
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">/api/logs</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Receive keystrokes from client
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-700 text-xs dark:text-blue-400">
                        GET
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">/api/logs</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Fetch all logs with filters
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded bg-red-500/10 px-2 py-0.5 font-semibold text-red-700 text-xs dark:text-red-400">
                        DELETE
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">/api/logs</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Clear all or device-specific logs
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-700 text-xs dark:text-blue-400">
                        GET
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      /api/devices
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      List all connected devices
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-700 text-xs dark:text-blue-400">
                        GET
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">/api/stats</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Dashboard summary statistics
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="border-t bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <Shield className="mx-auto mb-3 h-6 w-6 text-destructive" />
              <h3 className="mb-2 font-semibold text-destructive text-sm">
                Legal Disclaimer
              </h3>
              <p className="text-muted-foreground text-xs leading-5">
                This software is intended for{" "}
                <strong>educational and authorized use only</strong>. Using a
                keylogger on a system you do not own or without explicit written
                authorization is illegal in most jurisdictions. The authors are
                not responsible for any misuse of this software. Always obtain
                proper consent before monitoring any system.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Keyboard className="h-3.5 w-3.5" />
            Keylogger Dashboard — ICSS Internship Project
          </div>
          <p className="text-muted-foreground text-xs">
            Educational Purpose Only
          </p>
        </div>
      </footer>
    </div>
  );
}
