const DEFAULT_API_BASE_URL =
  "https://8ce1-105-127-11-129.ngrok-free.app/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const dynamic = "force-dynamic";

function getAuthorization(request: Request) {
  return request.headers.get("authorization");
}

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

export async function GET(request: Request) {
  const authorization = getAuthorization(request);

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  try {
    const upstreamResponse = await fetch(`${API_BASE_URL}/patients/me`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: authorization,
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });
    const responseBody = await upstreamResponse.text();

    return proxyResponse(upstreamResponse, responseBody);
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message: "The patient profile could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request) {
  const authorization = getAuthorization(request);

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { message: "A valid patient profile is required." } },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(`${API_BASE_URL}/patients/me`, {
      method: "PATCH",
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

    return proxyResponse(upstreamResponse, responseBody);
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message: "The patient profile could not be updated. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
