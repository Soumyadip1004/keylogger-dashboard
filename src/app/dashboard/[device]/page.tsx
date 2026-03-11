"use client";

import {
  ArrowLeft,
  Clock,
  Globe,
  Keyboard,
  Monitor,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiKeyGate } from "@/components/api-key-gate";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/format";
import { useApiKey } from "@/lib/hooks/use-api-key";
import type { LogEntry } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface DeviceInfo {
  device: string;
  logCount: number;
  latestIp: string | null;
  latestLog: string | null;
  oldestLog: string | null;
}

export default function DeviceLogsPage() {
  const params = useParams<{ device: string }>();
  const router = useRouter();
  const deviceName = decodeURIComponent(params.device);

  const { isReady, login, authHeaders } = useApiKey();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logs for this device
  const fetchLogs = useCallback(async () => {
    if (!authHeaders) return;

    setLoading(true);
    setError(null);

    try {
      const [logsRes, devicesRes] = await Promise.all([
        fetch(`/api/logs?device=${encodeURIComponent(deviceName)}&limit=500`, {
          headers: authHeaders,
        }),
        fetch("/api/devices/details", { headers: authHeaders }),
      ]);

      if (logsRes.status === 401 || devicesRes.status === 401) {
        setError("Invalid API key. Please check and try again.");
        setLoading(false);
        return;
      }

      if (!logsRes.ok || !devicesRes.ok) {
        setError("Failed to fetch data from the server.");
        setLoading(false);
        return;
      }

      const logsData = await logsRes.json();
      const devicesData = await devicesRes.json();

      setLogs(logsData.logs ?? []);

      const match = (devicesData.devices ?? []).find(
        (d: DeviceInfo) => d.device.toLowerCase() === deviceName.toLowerCase(),
      );
      setDeviceInfo(match ?? null);
    } catch (err) {
      console.error("Failed to fetch device logs:", err);
      setError("Network error. Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, deviceName]);

  // Fetch data on mount
  useEffect(() => {
    if (isReady) {
      fetchLogs();
    }
  }, [isReady, fetchLogs]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [isReady, fetchLogs]);

  // Handle clearing all logs for this device
  const handleClearLogs = async () => {
    if (!authHeaders) return;

    if (
      !confirm(
        `Are you sure you want to delete ALL logs for "${deviceName}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/logs?device=${encodeURIComponent(deviceName)}`,
        {
          method: "DELETE",
          headers: authHeaders,
        },
      );

      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to clear device logs:", err);
    }
  };

  // ── API key gate ──────────────────────────────────────────
  if (!isReady) {
    return <ApiKeyGate onSubmit={login} />;
  }

  // ── Main view ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back navigation */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="group mb-4 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Devices
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-3xl text-foreground tracking-tight">
                  {deviceName}
                </h1>
                <p className="mt-0.5 text-muted-foreground text-sm">
                  {deviceInfo
                    ? `${deviceInfo.logCount.toLocaleString()} log entries`
                    : "Loading..."}
                  {deviceInfo?.latestIp && (
                    <span className="ml-2 font-mono text-muted-foreground/70">
                      · {deviceInfo.latestIp}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClearLogs}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Device Stats Row */}
        {deviceInfo && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    {deviceInfo.logCount.toLocaleString()}
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
                    Latest Activity
                  </p>
                  <p className="font-semibold text-foreground text-sm">
                    {deviceInfo.latestLog
                      ? formatTimestamp(deviceInfo.latestLog)
                      : "No logs yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    IP Address
                  </p>
                  <p className="font-mono font-semibold text-foreground text-sm">
                    {deviceInfo.latestIp ?? "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Data Table */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground text-lg">
              Captured Logs
            </h2>
            <p className="text-muted-foreground text-sm">
              All keystroke logs from{" "}
              <span className="font-medium text-foreground">{deviceName}</span>.
              {!loading && (
                <span className="ml-1 text-muted-foreground/60">
                  Auto-refreshes every 10s.
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
