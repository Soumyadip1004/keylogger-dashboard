import prisma from "@/lib/prisma";

// ============================================================
// Database layer powered by Prisma + Neon PostgreSQL
//
// All public functions keep the same interface as the previous
// JSON file-based implementation so that API routes don't need
// any changes.
// ============================================================

export interface LogEntry {
  id: string;
  device: string;
  data: string;
  ip: string;
  timestamp: string;
}

// ============================================================
// Helpers
// ============================================================

/**
 * Convert a Prisma Log row into the plain LogEntry object that
 * the rest of the app expects (timestamp as ISO string).
 */
function toLogEntry(row: {
  id: string;
  device: string;
  data: string;
  ip: string;
  timestamp: Date;
}): LogEntry {
  return {
    id: row.id,
    device: row.device,
    data: row.data,
    ip: row.ip,
    timestamp: row.timestamp.toISOString(),
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * Add a new log entry to the database.
 */
export async function addLog(
  device: string,
  data: string,
  ip: string,
): Promise<LogEntry> {
  const row = await prisma.log.create({
    data: {
      device,
      data,
      ip,
    },
  });

  return toLogEntry(row);
}

/**
 * Get all log entries, optionally filtered by device name.
 * Results are sorted by timestamp (newest first).
 */
export async function getLogs(device?: string): Promise<LogEntry[]> {
  const rows = await prisma.log.findMany({
    where: device
      ? { device: { equals: device, mode: "insensitive" } }
      : undefined,
    orderBy: { timestamp: "desc" },
  });

  return rows.map(toLogEntry);
}

/**
 * Get log entries within a date range.
 */
export async function getLogsByDateRange(
  startDate: string,
  endDate: string,
  device?: string,
): Promise<LogEntry[]> {
  const rows = await prisma.log.findMany({
    where: {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      ...(device
        ? { device: { equals: device, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { timestamp: "desc" },
  });

  return rows.map(toLogEntry);
}

/**
 * Get a single log entry by ID.
 */
export async function getLogById(id: string): Promise<LogEntry | undefined> {
  const row = await prisma.log.findUnique({ where: { id } });
  return row ? toLogEntry(row) : undefined;
}

/**
 * Delete a single log entry by ID.
 */
export async function deleteLog(id: string): Promise<boolean> {
  try {
    await prisma.log.delete({ where: { id } });
    return true;
  } catch {
    // Record not found
    return false;
  }
}

/**
 * Delete all log entries, optionally filtered by device.
 */
export async function clearLogs(device?: string): Promise<number> {
  const result = await prisma.log.deleteMany({
    where: device
      ? { device: { equals: device, mode: "insensitive" } }
      : undefined,
  });

  return result.count;
}

/**
 * Get a list of all unique device names that have sent logs.
 */
export async function getDevices(): Promise<string[]> {
  const rows = await prisma.log.findMany({
    distinct: ["device"],
    select: { device: true },
    orderBy: { device: "asc" },
  });

  return rows.map((row: { device: string }) => row.device);
}

/**
 * Get summary statistics about the logs.
 */
export async function getStats(): Promise<{
  totalLogs: number;
  totalDevices: number;
  devices: string[];
  oldestLog: string | null;
  newestLog: string | null;
}> {
  const [totalLogs, devices, oldest, newest] = await Promise.all([
    prisma.log.count(),
    getDevices(),
    prisma.log.findFirst({
      orderBy: { timestamp: "asc" },
      select: { timestamp: true },
    }),
    prisma.log.findFirst({
      orderBy: { timestamp: "desc" },
      select: { timestamp: true },
    }),
  ]);

  return {
    totalLogs,
    totalDevices: devices.length,
    devices,
    oldestLog: oldest ? oldest.timestamp.toISOString() : null,
    newestLog: newest ? newest.timestamp.toISOString() : null,
  };
}
