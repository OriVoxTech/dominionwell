const DEFAULT_API_BASE_URL =
  "https://8ce1-105-127-11-129.ngrok-free.app/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/doctor-applications/specialties`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
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
          message:
            "Doctor application specialties could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
