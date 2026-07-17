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

  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(`${API_BASE_URL}/subscriptions/payments`);
  upstreamUrl.searchParams.set("page", requestUrl.searchParams.get("page") ?? "1");
  upstreamUrl.searchParams.set("limit", requestUrl.searchParams.get("limit") ?? "20");

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
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
          message: "Payment history could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
