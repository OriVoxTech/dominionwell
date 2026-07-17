import {
  API_BASE_URL,
  getPatientAuthorization,
  getSubscriptionHeaders,
  proxySubscriptionResponse,
  unauthorizedSubscriptionResponse,
} from "@/app/api/subscriptions/_shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = getPatientAuthorization(request);

  if (!authorization) {
    return unauthorizedSubscriptionResponse();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { message: "A subscription plan is required." } },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(
      `${API_BASE_URL}/subscriptions/initialize`,
      {
        method: "POST",
        headers: {
          ...getSubscriptionHeaders(authorization),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    const responseBody = await upstreamResponse.text();

    return proxySubscriptionResponse(upstreamResponse, responseBody);
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message: "Subscription checkout could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
