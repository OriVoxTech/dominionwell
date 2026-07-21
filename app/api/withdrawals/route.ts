const DEFAULT_API_BASE_URL =
  "https://8ce1-105-127-11-129.ngrok-free.app/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
      {
        statusCode: 400,
        error: {
          message: "Doctor and withdrawal amount are required.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(`${API_BASE_URL}/withdrawals`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Authorization: authorization,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
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
          message:
            "Withdrawal request could not reach the server. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
