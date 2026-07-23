import { API_BASE_URL } from "@/lib/api-base-url";

export const dynamic = "force-dynamic";

function unauthorizedResponse() {
  return Response.json(
    {
      statusCode: 401,
      error: {
        message: "Patient authentication is required. Please log in again.",
        error: "Unauthorized",
        statusCode: 401,
      },
    },
    { status: 401 },
  );
}

function proxyResponse(upstreamResponse: Response, responseBody: string) {
  return new Response(responseBody || null, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type":
        upstreamResponse.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/doctors/${encodeURIComponent(id)}/reviews`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: authorization,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      },
    );
    const responseBody = await upstreamResponse.text();

    return proxyResponse(upstreamResponse, responseBody);
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message: "Doctor reviews could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        statusCode: 400,
        error: {
          message: "Appointment, rating, and comment are required.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/doctors/${encodeURIComponent(id)}/reviews`,
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: authorization,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    const responseBody = await upstreamResponse.text();

    return proxyResponse(upstreamResponse, responseBody);
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message: "Doctor review could not be submitted. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
