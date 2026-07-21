const DEFAULT_API_BASE_URL =
  "https://8ce1-105-127-11-129.ngrok-free.app/api";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  try {
    const upstreamResponse = await fetch(`${API_BASE_URL}/doctors/me`, {
      method: "GET",
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
          message: "The doctor profile could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { message: "A valid doctor profile is required." } },
      { status: 400 },
    );
  }

  const payload = body as {
    bio?: unknown;
    specializations?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    phone?: unknown;
    presenceStatus?: unknown;
    yearsOfExperience?: unknown;
    bankName?: unknown;
    bankCode?: unknown;
    bankAccountName?: unknown;
    bankAccountNumber?: unknown;
  };
  const bio = typeof payload.bio === "string" ? payload.bio.trim() : "";
  const firstName =
    typeof payload.firstName === "string" ? payload.firstName.trim() : "";
  const lastName =
    typeof payload.lastName === "string" ? payload.lastName.trim() : "";
  const phone =
    typeof payload.phone === "string" ? payload.phone.trim() : "";
  const presenceStatus =
    typeof payload.presenceStatus === "string"
      ? payload.presenceStatus.trim().toUpperCase()
      : "";
  const yearsOfExperience =
    typeof payload.yearsOfExperience === "number"
      ? Math.max(0, Math.floor(payload.yearsOfExperience))
      : 0;
  const bankName =
    typeof payload.bankName === "string" ? payload.bankName.trim() : "";
  const bankCode =
    typeof payload.bankCode === "string" ? payload.bankCode.trim() : "";
  const bankAccountName =
    typeof payload.bankAccountName === "string"
      ? payload.bankAccountName.trim()
      : "";
  const bankAccountNumber =
    typeof payload.bankAccountNumber === "string"
      ? payload.bankAccountNumber.trim()
      : "";
  const specializations = Array.isArray(payload.specializations)
    ? payload.specializations
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (
    !firstName ||
    !lastName ||
    !phone ||
    specializations.length === 0 ||
    !["AVAILABLE", "BUSY", "OFFLINE"].includes(presenceStatus)
  ) {
    return Response.json(
      {
        statusCode: 400,
        error: {
          message:
            "First name, last name, phone number, presence status, and at least one specialization are required.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(`${API_BASE_URL}/doctors/me`, {
      method: "PATCH",
      headers: {
        Accept: "*/*",
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bio,
        specializations,
        firstName,
        lastName,
        phone,
        presenceStatus,
        yearsOfExperience,
        ...(bankName &&
        bankCode &&
        bankAccountName &&
        bankAccountNumber
          ? {
              bankName,
              bankCode,
              bankAccountName,
              bankAccountNumber,
            }
          : {}),
      }),
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
          message: "The doctor profile could not be updated. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
