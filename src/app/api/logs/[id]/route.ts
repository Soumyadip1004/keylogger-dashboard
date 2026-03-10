import type { NextRequest } from "next/server";
import { errorResponse, successResponse, validateApiKey } from "@/lib/auth";
import { deleteLog, getLogById } from "@/lib/db";

// ============================================================
// GET /api/logs/[id] — Fetch a single log entry by ID
// ============================================================
//
// Headers:
//   x-api-key: <your-api-key>
//
// Response:
//   200: { success: true, log: { id, device, data, ip, timestamp } }
//   401: { success: false, error: "Unauthorized" }
//   404: { success: false, error: "Log entry not found" }
//   500: { success: false, error: "Internal server error" }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateApiKey(request)) {
    return errorResponse("Unauthorized. Invalid or missing API key.", 401);
  }

  const { id } = await params;

  try {
    const log = await getLogById(id);

    if (!log) {
      return errorResponse(`Log entry with id '${id}' not found.`, 404);
    }

    return successResponse({ log });
  } catch (error) {
    console.error(`[API GET /api/logs/${id}] Error:`, error);
    return errorResponse("Internal server error.", 500);
  }
}

// ============================================================
// DELETE /api/logs/[id] — Delete a single log entry by ID
// ============================================================
//
// Headers:
//   x-api-key: <your-api-key>
//
// Response:
//   200: { success: true, message: "Log entry deleted." }
//   401: { success: false, error: "Unauthorized" }
//   404: { success: false, error: "Log entry not found" }
//   500: { success: false, error: "Internal server error" }

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateApiKey(request)) {
    return errorResponse("Unauthorized. Invalid or missing API key.", 401);
  }

  const { id } = await params;

  try {
    const deleted = await deleteLog(id);

    if (!deleted) {
      return errorResponse(`Log entry with id '${id}' not found.`, 404);
    }

    return successResponse({
      message: `Log entry '${id}' deleted successfully.`,
    });
  } catch (error) {
    console.error(`[API DELETE /api/logs/${id}] Error:`, error);
    return errorResponse("Internal server error.", 500);
  }
}
