import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM = (process.env.AUTH_UPSTREAM_URL ?? "http://localhost:4000").replace(/\/+$/, "");
const APP_ORIGIN = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

/** Forward Better Auth requests to the Express server that owns the handler. */
async function proxy(request: NextRequest): Promise<Response> {
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

  // Better Auth validates the origin against `trustedOrigins` on the server.
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
      // undici requires this when a streaming body is supplied.
      ...(hasBody ? { duplex: "half" as const } : {}),
      cache: "no-store",
      redirect: "manual",
    });
  } catch (error) {
    console.error("[matrimap:auth-proxy] Authentication request failed", error);
    return Response.json({ error: "Sign-in is temporarily unavailable. Please try again." }, { status: 502 });
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

  // Forward every cookie individually — folding Set-Cookie breaks sessions.
  for (const cookie of upstream.headers.getSetCookie?.() ?? []) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
