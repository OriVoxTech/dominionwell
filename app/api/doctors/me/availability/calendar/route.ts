const DEFAULT_API_BASE_URL =
  "https://dominionwell-backend-1ksa.onrender.com/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return Response.json(
      { error: { message: "Doctor authentication is required. Please log in again." } },
      { status: 401 },
    );
  }

  const incomingUrl = new URL(request.url);
  const year = incomingUrl.searchParams.get("year");
  const month = incomingUrl.searchParams.get("month");
  const timezoneOffsetMinutes =
    incomingUrl.searchParams.get("timezoneOffsetMinutes") ?? "0";

  if (!year || !month) {
    return Response.json(
      { error: { message: "year and month are required." } },
      { status: 400 },
    );
  }

  const upstreamUrl = new URL(
    `${API_BASE_URL}/doctors/me/availability/calendar`,
  );
  upstreamUrl.searchParams.set("year", year);
  upstreamUrl.searchParams.set("month", month);
  upstreamUrl.searchParams.set("timezoneOffsetMinutes", timezoneOffsetMinutes);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: { Accept: "*/*", Authorization: authorization },
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
      { error: { message: "The availability calendar could not be reached." } },
      { status: 502 },
    );
  }
}
