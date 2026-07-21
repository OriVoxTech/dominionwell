const DEFAULT_API_BASE_URL =
  "https://8ce1-105-127-11-129.ngrok-free.app/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

const APPOINTMENT_STATUSES = new Set([
  "BOOKED",
  "CANCELLED",
  "COMPLETED",
  "VERIFIED",
]);

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return Response.json(
      {
        statusCode: 401,
        error: {
          message: "Doctor authentication is required. Please log in again.",
          error: "Unauthorized",
          statusCode: 401,
        },
      },
      { status: 401 },
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${API_BASE_URL}/appointments/doctor`);
  const status = incomingUrl.searchParams.get("status")?.toUpperCase();
  const page = incomingUrl.searchParams.get("page") ?? "1";
  const limit = incomingUrl.searchParams.get("limit") ?? "20";

  if (status && APPOINTMENT_STATUSES.has(status)) {
    upstreamUrl.searchParams.set("status", status);
  }
  upstreamUrl.searchParams.set("page", page);
  upstreamUrl.searchParams.set("limit", limit);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: authorization,
      },
      cache: "no-store",
    });
    const responseBody = await upstreamResponse.text();

    return new Response(responseBody || null, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type":
          upstreamResponse.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message: "Doctor appointments could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
