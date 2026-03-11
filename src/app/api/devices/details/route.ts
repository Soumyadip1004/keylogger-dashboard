import type { NextRequest } from "next/server";
import { errorResponse, successResponse, validateApiKey } from "@/lib/auth";
import { getDeviceDetails } from "@/lib/db";

/**
 * GET /api/devices/details
 *
 * Returns enriched details for every unique device:
 * log count, latest IP, newest and oldest log timestamps.
 *
 * Headers:
 *   x-api-key: <your-api-key>
 *
 * Response:
 *   200: {
 *     success: true,
 *     devices: [
 *       {
 *         device: "LAPTOP-01",
 *         logCount: 142,
 *         latestIp: "203.0.113.42",
 *         latestLog: "2025-06-20T14:30:00.000Z",
 *         oldestLog: "2025-06-01T08:00:00.000Z"
 *       },
 *       ...
 *     ],
 *     count: 2
 *   }
 *   401: { success: false, error: "Unauthorized" }
 *   500: { success: false, error: "Internal server error" }
 */
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return errorResponse(
      "Unauthorized. Provide a valid x-api-key header.",
      401,
    );
  }

  try {
    const devices = await getDeviceDetails();

    return successResponse({
      devices,
      count: devices.length,
    });
  } catch (error) {
    console.error(
      "[API /api/devices/details] Error fetching device details:",
      error,
    );
    return errorResponse("Internal server error.", 500);
  }
}
