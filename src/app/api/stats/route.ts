import type { NextRequest } from "next/server";
import { errorResponse, successResponse, validateApiKey } from "@/lib/auth";
import { getStats } from "@/lib/db";

/**
 * GET /api/stats
 *
 * Returns summary statistics about the keylogger logs.
 * Requires a valid API key in the `x-api-key` header.
 *
 * Response:
 * {
 *   success: true,
 *   stats: {
 *     totalLogs: number,
 *     totalDevices: number,
 *     devices: string[],
 *     oldestLog: string | null,
 *     newestLog: string | null
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return errorResponse("Unauthorized. Invalid or missing API key.", 401);
  }

  try {
    const stats = await getStats();

    return successResponse({ stats });
  } catch (error) {
    console.error("[API /api/stats] Failed to fetch stats:", error);
    return errorResponse("Internal server error.", 500);
  }
}
