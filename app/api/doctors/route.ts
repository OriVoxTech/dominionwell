import { API_BASE_URL } from "@/lib/api-base-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const page = requestUrl.searchParams.get("page") ?? "1";
  const limit = requestUrl.searchParams.get("limit") ?? "20";
  const search = requestUrl.searchParams.get("search")?.trim();
  const specialization = requestUrl.searchParams
    .get("specialization")
    ?.trim();
  const upstreamUrl = new URL(`${API_BASE_URL}/doctors`);

  upstreamUrl.searchParams.set("page", page);
  upstreamUrl.searchParams.set("limit", limit);
  if (search) upstreamUrl.searchParams.set("search", search);
  if (specialization) {
    upstreamUrl.searchParams.set("specialization", specialization);
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
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
          message: "The doctor directory could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
