import { API_BASE_URL } from "@/lib/api-base-url";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return Response.json(
      { error: { message: "A doctor ID is required." } },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/doctors/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: { Accept: "*/*" },
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
          message: "The doctor profile could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
