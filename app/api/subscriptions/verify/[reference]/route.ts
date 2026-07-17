import {
  API_BASE_URL,
  getPatientAuthorization,
  getSubscriptionHeaders,
  proxySubscriptionResponse,
  unauthorizedSubscriptionResponse,
} from "@/app/api/subscriptions/_shared";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const authorization = getPatientAuthorization(request);

  if (!authorization) {
    return unauthorizedSubscriptionResponse();
  }

  const { reference } = await params;
  const encodedReference = encodeURIComponent(reference);
  const upstreamUrl = `${API_BASE_URL}/subscriptions/verify/${encodedReference}`;

  try {
    const getResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: getSubscriptionHeaders(authorization),
      cache: "no-store",
    });
    const getResponseBody = await getResponse.text();

    const backendRejectedGet =
      getResponse.status === 404 &&
      /cannot\s+get/i.test(getResponseBody);

    if (!backendRejectedGet) {
      return proxySubscriptionResponse(getResponse, getResponseBody);
    }

    const postResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        ...getSubscriptionHeaders(authorization),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const postResponseBody = await postResponse.text();

    return proxySubscriptionResponse(postResponse, postResponseBody);
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message: "Payment verification could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
