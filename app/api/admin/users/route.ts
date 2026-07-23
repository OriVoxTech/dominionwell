import { API_BASE_URL } from "@/lib/api-base-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return Response.json(
      {
        statusCode: 401,
        error: {
          message: "Admin authentication is required. Please log in again.",
          error: "Unauthorized",
          statusCode: 401,
        },
      },
      { status: 401 },
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${API_BASE_URL}/admin/users`);
  upstreamUrl.searchParams.set(
    "role",
    incomingUrl.searchParams.get("role") ?? "DOCTOR",
  );

  const search = incomingUrl.searchParams.get("search")?.trim();
  if (search) upstreamUrl.searchParams.set("search", search);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: authorization,
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
          message: "The doctors service could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
