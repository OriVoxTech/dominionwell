const DEFAULT_API_BASE_URL =
  "https://4794-102-88-55-59.ngrok-free.app/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return Response.json(
      { error: { message: "A doctor ID is required." } },
      { status: 400 },
    );
  }

  const authorization = request.headers.get("authorization");
  const headers: HeadersInit = {
    Accept: "*/*",
    "ngrok-skip-browser-warning": "true",
  };

  if (authorization?.startsWith("Bearer ")) {
    headers.Authorization = authorization;
  }

  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/doctors/${encodeURIComponent(id)}/availability`,
      {
        method: "GET",
        headers,
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
          message: "Doctor availability could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
