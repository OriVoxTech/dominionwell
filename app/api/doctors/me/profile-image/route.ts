import { API_BASE_URL } from "@/lib/api-base-url";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return Response.json(
      {
        statusCode: 401,
        error: {
          message: "Doctor authentication is required. Please log in again.",
          error: "Unauthorized",
          statusCode: 401,
        },
      },
      { status: 401 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: { message: "A profile image file is required." } },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/doctors/me/profile-image`,
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: authorization,
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
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
          message: "The profile image could not be uploaded. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
