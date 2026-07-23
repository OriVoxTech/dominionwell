import { API_BASE_URL } from "@/lib/api-base-url";

const ALLOWED_ACTIONS = new Set(["approve", "reject"]);

export const dynamic = "force-dynamic";

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
  let requestBody: unknown;

  if (!ALLOWED_ACTIONS.has(action)) {
    return Response.json(
      {
        statusCode: 400,
        error: {
          message: "Unsupported doctor application action.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
      { status: 400 },
    );
  }

  if (action === "reject") {
    try {
      requestBody = await request.json();
    } catch {
      return Response.json(
        {
          statusCode: 400,
          error: {
            message: "A rejection reason is required.",
            error: "Bad Request",
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }
  }

  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/admin/doctor-applications/${encodeURIComponent(id)}/${action}`,
      {
        method: "PATCH",
        headers: {
          Accept: "*/*",
          Authorization: authorization,
          ...(action === "reject" ? { "Content-Type": "application/json" } : {}),
          "ngrok-skip-browser-warning": "true",
        },
        ...(action === "reject" ? { body: JSON.stringify(requestBody) } : {}),
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
          message:
            "Doctor application status could not be updated. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
