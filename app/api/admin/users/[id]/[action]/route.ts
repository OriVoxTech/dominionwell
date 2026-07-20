const DEFAULT_API_BASE_URL =
  "https://4794-102-88-55-59.ngrok-free.app/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

const ALLOWED_ACTIONS = new Set(["deactivate", "restore"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
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

  const { id, action } = await params;
  if (!ALLOWED_ACTIONS.has(action)) {
    return Response.json(
      {
        statusCode: 400,
        error: {
          message: "Invalid user status action.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
      { status: 400 },
    );
  }

  const upstreamUrl = `${API_BASE_URL}/admin/users/${encodeURIComponent(id)}/${action}`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "PATCH",
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
          message: "The user status could not be updated. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
