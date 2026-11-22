import type { NextRequest } from "next/server";

const UPSTREAM = (process.env.AUTH_UPSTREAM_URL ?? "http://localhost:4000").replace(/\/+$/, "");
const APP_ORIGIN = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

/** Forward requests from Next.js to the Express backend server with cookies and headers intact. */
export async function proxyToExpress(request: NextRequest): Promise<Response> {
  const incoming = new URL(request.url);
  const target = `${UPSTREAM}${incoming.pathname}${incoming.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const name = key.toLowerCase();
    if (
      name === "host" ||
      name === "content-length" ||
      name === "connection" ||
      name === "content-encoding" ||
      name === "transfer-encoding" ||
      name === "accept-encoding"
    ) {
      return;
    }
    headers.set(key, value);
  });

  // Better Auth & CORS validation on Express
  headers.set("origin", APP_ORIGIN);
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      ...(hasBody ? { duplex: "half" as const } : {}),
      cache: "no-store",
      redirect: "manual",
    });
  } catch (error) {
    console.error("[matrimap:proxy] Express backend request failed", error);
    return Response.json({ error: "The service is temporarily unavailable. Please try again." }, { status: 502 });
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const name = key.toLowerCase();
    if (
      name === "content-encoding" ||
      name === "content-length" ||
      name === "transfer-encoding" ||
      name === "connection" ||
      name === "set-cookie"
    ) {
      return;
    }
    responseHeaders.set(key, value);
  });

  for (const cookie of upstream.headers.getSetCookie?.() ?? []) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
