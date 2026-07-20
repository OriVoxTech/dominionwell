const DEFAULT_API_BASE_URL =
  "https://4794-102-88-55-59.ngrok-free.app/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
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

  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: { message: "A valid calendar date is required." } },
      { status: 400 },
    );
  }

  const requestUrl = new URL(request.url);
  const timezoneOffsetMinutes =
    requestUrl.searchParams.get("timezoneOffsetMinutes") ?? "0";

  try {
    const upstreamUrl = new URL(
      `${API_BASE_URL}/doctors/me/availability/day/${encodeURIComponent(date)}`,
    );
    upstreamUrl.searchParams.set(
      "timezoneOffsetMinutes",
      timezoneOffsetMinutes,
    );

    const upstreamResponse = await fetch(upstreamUrl, {
      method: "DELETE",
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
          message: "The day's availability could not be cleared. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
