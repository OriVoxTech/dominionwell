import {
  API_BASE_URL,
  getPatientAuthorization,
  getSubscriptionHeaders,
  proxySubscriptionResponse,
  unauthorizedSubscriptionResponse,
} from "@/app/api/subscriptions/_shared";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = getPatientAuthorization(request);

  if (!authorization) {
    return unauthorizedSubscriptionResponse();
  }

  try {
    const upstreamResponse = await fetch(`${API_BASE_URL}/subscriptions/me`, {
      method: "GET",
      headers: getSubscriptionHeaders(authorization),
      cache: "no-store",
    });
    const responseBody = await upstreamResponse.text();

    return proxySubscriptionResponse(upstreamResponse, responseBody);
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message: "Your subscription could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
