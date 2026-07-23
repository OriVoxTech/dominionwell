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

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("multipart/form-data")) {
    return Response.json(
      {
        statusCode: 400,
        error: {
          message: "Doctor application form data is required.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
      { status: 400 },
    );
  }

  try {
    const requestBody = await request.arrayBuffer();
    const upstreamResponse = await fetch(`${API_BASE_URL}/doctor-applications`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": contentType,
        "ngrok-skip-browser-warning": "true",
      },
      body: requestBody,
      cache: "no-store",
    });
    const responseBody = await upstreamResponse.text();

    return proxyResponse(upstreamResponse, responseBody);
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message:
            "Doctor application service could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
