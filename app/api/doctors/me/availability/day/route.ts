const DEFAULT_API_BASE_URL =
  "https://dominionwell-backend-1ksa.onrender.com/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export async function PUT(request: Request) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { message: "A valid availability request is required." } },
      { status: 400 },
    );
  }

  const payload = body as {
    date?: unknown;
    startTimes?: unknown;
    slotDurationMinutes?: unknown;
    timezoneOffsetMinutes?: unknown;
  };
  const date = typeof payload.date === "string" ? payload.date : "";
  const startTimes = Array.isArray(payload.startTimes)
    ? payload.startTimes.filter(
        (time): time is string => typeof time === "string",
      )
    : [];
  const slotDurationMinutes = payload.slotDurationMinutes;
  const timezoneOffsetMinutes = payload.timezoneOffsetMinutes;
  const hasOnlyValidStartTimes =
    startTimes.length > 0 &&
    startTimes.length ===
      (Array.isArray(payload.startTimes) ? payload.startTimes.length : 0) &&
    startTimes.every((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time));

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !hasOnlyValidStartTimes ||
    slotDurationMinutes !== 60 ||
    typeof timezoneOffsetMinutes !== "number" ||
    !Number.isFinite(timezoneOffsetMinutes)
  ) {
    return Response.json(
      {
        statusCode: 400,
        error: {
          message:
            "Provide a valid date, at least one start time in HH:mm format, a 60-minute duration, and a timezone offset.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/doctors/me/availability/day`,
      {
        method: "PUT",
        headers: {
          Accept: "*/*",
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          startTimes,
          slotDurationMinutes,
          timezoneOffsetMinutes,
        }),
        cache: "no-store",
      },
    );
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
          message: "Doctor availability could not be saved. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
