import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// ============================================================
// Simple JSON file-based database for keylogger logs
//
// On Vercel (production), the filesystem is read-only except
// for /tmp. We detect the environment and use /tmp/data/ for
// storage in production, and the local data/ directory in dev.
//
// NOTE: /tmp on Vercel is ephemeral — data is lost between
// cold starts. For persistent storage, use a real database
// (e.g., Vercel KV, PostgreSQL, MongoDB).
// ============================================================

export interface LogEntry {
  id: string;
  device: string;
  data: string;
  ip: string;
  timestamp: string;
}

interface Database {
  logs: LogEntry[];
}

// Use /tmp on Vercel (production), local data/ directory in development
const IS_VERCEL = process.env.VERCEL === "1";
const DATA_DIR = IS_VERCEL
  ? path.join("/tmp", "data")
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "logs.json");

/**
 * Ensure the data directory and database file exist.
 */
async function ensureDb(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }

  if (!existsSync(DB_PATH)) {
    const emptyDb: Database = { logs: [] };
    await writeFile(DB_PATH, JSON.stringify(emptyDb, null, 2), "utf-8");
  }
}

/**
 * Read the entire database from disk.
 */
async function readDb(): Promise<Database> {
  await ensureDb();

  try {
    const raw = await readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    // If the file is corrupted, reset it
    const emptyDb: Database = { logs: [] };
    await writeFile(DB_PATH, JSON.stringify(emptyDb, null, 2), "utf-8");
    return emptyDb;
  }
}

/**
 * Write the entire database to disk.
 */
async function writeDb(db: Database): Promise<void> {
  await ensureDb();
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

/**
 * Generate a unique ID for a log entry.
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
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
  const db = await readDb();

  const entry: LogEntry = {
    id: generateId(),
    device,
    data,
    ip,
    timestamp: new Date().toISOString(),
  };

  db.logs.push(entry);
  await writeDb(db);

  return entry;
}

/**
 * Get all log entries, optionally filtered by device name.
 * Results are sorted by timestamp (newest first).
 */
export async function getLogs(device?: string): Promise<LogEntry[]> {
  const db = await readDb();

  let logs = db.logs;

  if (device) {
    logs = logs.filter(
      log => log.device.toLowerCase() === device.toLowerCase(),
    );
  }

  // Sort by timestamp, newest first
  logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return logs;
}

/**
 * Get log entries within a date range.
 */
export async function getLogsByDateRange(
  startDate: string,
  endDate: string,
  device?: string,
): Promise<LogEntry[]> {
  const logs = await getLogs(device);

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return logs.filter(log => {
    const logTime = new Date(log.timestamp).getTime();
    return logTime >= start && logTime <= end;
  });
}

/**
 * Get a single log entry by ID.
 */
export async function getLogById(id: string): Promise<LogEntry | undefined> {
  const db = await readDb();
  return db.logs.find(log => log.id === id);
}

/**
 * Delete a single log entry by ID.
 */
export async function deleteLog(id: string): Promise<boolean> {
  const db = await readDb();

  const index = db.logs.findIndex(log => log.id === id);
  if (index === -1) return false;

  db.logs.splice(index, 1);
  await writeDb(db);

  return true;
}

/**
 * Delete all log entries, optionally filtered by device.
 */
export async function clearLogs(device?: string): Promise<number> {
  const db = await readDb();

  if (device) {
    const before = db.logs.length;
    db.logs = db.logs.filter(
      log => log.device.toLowerCase() !== device.toLowerCase(),
    );
    const deleted = before - db.logs.length;
    await writeDb(db);
    return deleted;
  }

  const deleted = db.logs.length;
  db.logs = [];
  await writeDb(db);
  return deleted;
}

/**
 * Get a list of all unique device names that have sent logs.
 */
export async function getDevices(): Promise<string[]> {
  const db = await readDb();
  const devices = new Set(db.logs.map(log => log.device));
  return Array.from(devices).sort();
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
  const db = await readDb();
  const devices = Array.from(new Set(db.logs.map(log => log.device))).sort();

  const sorted = [...db.logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return {
    totalLogs: db.logs.length,
    totalDevices: devices.length,
    devices,
    oldestLog: sorted.length > 0 ? sorted[0].timestamp : null,
    newestLog: sorted.length > 0 ? sorted[sorted.length - 1].timestamp : null,
  };
}
