import { NextResponse, type NextRequest } from "next/server";

interface SessionPayload {
  user?: {
    role?: string;
  } | null;
}

function isRegisteredRole(role: string | undefined): boolean {
  return role === "customer" || role === "vendor" || role === "admin";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isCompleteProfile = pathname === "/complete-profile";
  const isServiceBrowsePath =
    pathname === "/services" ||
    (pathname !== "/services/add" && /^\/services\/[^/]+$/.test(pathname));
  const requiredRole =
    pathname === "/vendor" || pathname.startsWith("/vendor/")
      ? "vendor"
      : pathname === "/customer" || pathname.startsWith("/customer/")
        ? "customer"
        : pathname === "/services/add" || /^\/services\/[^/]+\/edit$/.test(pathname)
          ? "vendor"
          : undefined;

  if (isServiceBrowsePath && !request.headers.get("cookie")) {
    return NextResponse.next();
  }

  const upstream = process.env.AUTH_UPSTREAM_URL ?? "http://localhost:4000";

  let payload: SessionPayload | null;
  try {
    const response = await fetch(new URL("/api/auth/get-session", upstream), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!response.ok) {
      return new NextResponse("Unable to verify your account right now.", { status: 503 });
    }
    payload = (await response.json()) as SessionPayload | null;
  } catch {
    return new NextResponse("Unable to verify your account right now.", { status: 503 });
  }

  const role = payload?.user?.role;
  if (!payload?.user) {
    if (isServiceBrowsePath) return NextResponse.next();

    const signInUrl = new URL("/auth", request.url);
    signInUrl.searchParams.set("mode", "sign-in");
    return NextResponse.redirect(signInUrl);
  }

  if (isCompleteProfile) {
    if (isRegisteredRole(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isServiceBrowsePath && role === "vendor") {
    return NextResponse.redirect(new URL("/vendor", request.url));
  }

  if (!isRegisteredRole(role)) {
    return NextResponse.redirect(new URL("/complete-profile", request.url));
  }

  if (requiredRole && role !== requiredRole) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/vendor/:path*",
    "/customer/:path*",
    "/services",
    "/services/:id",
    "/services/add",
    "/services/:id/edit",
    "/complete-profile",
  ],
};
