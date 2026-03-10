import type { NextRequest } from "next/server";

/**
 * Validate the API key from the request headers.
 *
 * The Python keylogger client must send the API key in the `x-api-key` header.
 * The key is compared against the `API_KEY` environment variable.
 *
 * @param request - The incoming Next.js request object.
 * @returns `true` if the API key is valid, `false` otherwise.
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return false;
  }

  const serverKey = process.env.API_KEY;

  if (!serverKey) {
    console.error(
      "[AUTH] API_KEY is not set in environment variables. Check your .env.local file.",
    );
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (apiKey.length !== serverKey.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < apiKey.length; i++) {
    mismatch |= apiKey.charCodeAt(i) ^ serverKey.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Extract the client IP address from the request.
 * Checks common proxy headers first, then falls back to the request IP.
 *
 * @param request - The incoming Next.js request object.
 * @returns The client's IP address as a string.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; the first one is the client
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Create a standardized JSON error response.
 *
 * @param message - The error message.
 * @param status - The HTTP status code.
 * @returns A Response object with the error message as JSON.
 */
export function errorResponse(message: string, status: number): Response {
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

/**
 * Create a standardized JSON success response.
 *
 * @param data - The response data payload.
 * @param status - The HTTP status code (default: 200).
 * @returns A Response object with the data as JSON.
 */
export function successResponse(
  data: Record<string, unknown>,
  status = 200,
): Response {
  return Response.json(
    {
      success: true,
      ...data,
    },
    { status },
  );
}
