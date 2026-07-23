import { API_BASE_URL } from "@/lib/api-base-url";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const dynamic = "force-dynamic";

function unauthorizedResponse() {
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

function getFileName(documentId: string) {
  return documentId.split("/").at(-1) || "doctor-application-document";
}

function proxyFileResponse(upstreamResponse: Response, body: ArrayBuffer, fileName: string) {
  return new Response(body, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type":
        upstreamResponse.headers.get("content-type") ??
        "application/octet-stream",
      "Content-Disposition":
        upstreamResponse.headers.get("content-disposition") ??
        `inline; filename="${fileName.replaceAll('"', "")}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string[] }> },
) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  const { documentId: documentIdSegments } = await params;
  const documentId = documentIdSegments.join("/");
  const encodedDocumentId = documentIdSegments.map(encodeURIComponent).join("/");
  const fileName = getFileName(documentId);
  const candidateUrls = [
    `${API_BASE_URL}/admin/doctor-applications/documents/${encodedDocumentId}`,
    `${API_BASE_URL}/doctor-applications/documents/${encodedDocumentId}`,
    `${API_BASE_URL}/files/${encodedDocumentId}`,
    `${API_BASE_URL}/uploads/${encodedDocumentId}`,
    `${API_ORIGIN}/files/${encodedDocumentId}`,
    `${API_ORIGIN}/uploads/${encodedDocumentId}`,
    `${API_BASE_URL}/${encodedDocumentId}`,
    `${API_ORIGIN}/${encodedDocumentId}`,
  ];

  try {
    for (const url of candidateUrls) {
      const upstreamResponse = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: authorization,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      if (upstreamResponse.ok) {
        const body = await upstreamResponse.arrayBuffer();
        return proxyFileResponse(upstreamResponse, body, fileName);
      }
    }

    return Response.json(
      {
        statusCode: 404,
        error: {
          message: "Doctor application document could not be found.",
          error: "Not Found",
          statusCode: 404,
        },
      },
      { status: 404 },
    );
  } catch {
    return Response.json(
      {
        statusCode: 502,
        error: {
          message:
            "Doctor application document could not be reached. Please try again.",
          error: "Bad Gateway",
          statusCode: 502,
        },
      },
      { status: 502 },
    );
  }
}
