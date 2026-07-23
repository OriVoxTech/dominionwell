import { API_BASE_URL } from "@/lib/api-base-url";

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
