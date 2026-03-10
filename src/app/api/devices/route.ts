import type { NextRequest } from "next/server";
import { errorResponse, successResponse, validateApiKey } from "@/lib/auth";
import { getDevices } from "@/lib/db";

/**
 * GET /api/devices
 *
 * Returns a list of all unique device names that have sent logs.
 *
 * Headers:
 *   x-api-key: <your-api-key>
 *
 * Response:
 *   200: { success: true, devices: ["LAPTOP-01", "DESKTOP-02"] }
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
    const devices = await getDevices();

    return successResponse({
      devices,
      count: devices.length,
    });
  } catch (error) {
    console.error("[API /api/devices] Error fetching devices:", error);
    return errorResponse("Internal server error.", 500);
  }
}
