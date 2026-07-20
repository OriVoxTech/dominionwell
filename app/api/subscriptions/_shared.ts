const DEFAULT_API_BASE_URL =
  "https://4794-102-88-55-59.ngrok-free.app/api";

export const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

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
