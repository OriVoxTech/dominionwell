const DEFAULT_API_BASE_URL =
  "https://dominionwell-backend-1ksa.onrender.com/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const dynamic = "force-dynamic";

function unauthorizedResponse() {
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

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${API_BASE_URL}/doctors/me/patients`);

  for (const key of ["page", "limit"]) {
    const value = incomingUrl.searchParams.get(key)?.trim();
    if (value) upstreamUrl.searchParams.set(key, value);
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: authorization,
        "ngrok-skip-browser-warning": "true",
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
          message: "Doctor patients could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
