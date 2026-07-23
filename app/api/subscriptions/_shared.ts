export { API_BASE_URL } from "@/lib/api-base-url";

export function getPatientAuthorization(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization;
}

export function unauthorizedSubscriptionResponse() {
  return Response.json(
    {
      statusCode: 401,
      error: {
        message: "Patient authentication is required. Please log in again.",
        error: "Unauthorized",
        statusCode: 401,
      },
    },
    { status: 401 },
  );
}

export function proxySubscriptionResponse(
  upstreamResponse: Response,
  responseBody: string,
) {
  return new Response(responseBody || null, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type":
        upstreamResponse.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function getSubscriptionHeaders(authorization: string) {
  return {
    Accept: "*/*",
    Authorization: authorization,
    "ngrok-skip-browser-warning": "true",
  };
}
