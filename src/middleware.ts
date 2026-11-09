import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Reserved platform routes that should NEVER be rewritten to portfolio subdomains
const RESERVED_PLATFORM_ROUTES = [
  "/login",
  "/signup",
  "/reset-password",
  "/dashboard",
  "/onboarding",
  "/settings",
  "/editor",
  "/portfolio",
  "/api",
];

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const hostname = request.headers.get("host") || "";

  // 1. Skip Next.js internals, static files, and assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Canonical shorthand path alias: /p/[username] -> /portfolio/[username]
  if (pathname.startsWith("/p/")) {
    const slug = pathname.replace("/p/", "").trim();
    if (slug) {
      return NextResponse.rewrite(new URL(`/portfolio/${slug}`, request.url));
    }
  }

  // 3. Platform routes must always resolve directly to themselves
  const isPlatformRoute = RESERVED_PLATFORM_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );
  if (isPlatformRoute) {
    return NextResponse.next();
  }

  // 4. Subdomain Resolution
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";
  // Remove port for domain comparisons
  const hostWithoutPort = hostname.split(":")[0].toLowerCase();
  const baseDomainWithoutPort = appDomain.split(":")[0].toLowerCase();

  // Ignore raw IP addresses like 127.0.0.1 or ::1
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostWithoutPort) || hostWithoutPort === "::1";
  if (isIpAddress) {
    return NextResponse.next();
  }

  let subdomain: string | null = null;

  // Localhost subdomain: e.g. "alex-morgan.localhost"
  if (hostWithoutPort.endsWith(".localhost")) {
    const candidate = hostWithoutPort.replace(".localhost", "").trim();
    if (candidate && candidate !== "www" && candidate !== "localhost") {
      subdomain = candidate;
    }
  } else if (
    baseDomainWithoutPort !== "localhost" &&
    hostWithoutPort.endsWith("." + baseDomainWithoutPort)
  ) {
    // Production wildcard subdomain: e.g. "alex-morgan.ourplatform.com"
    const candidate = hostWithoutPort.replace("." + baseDomainWithoutPort, "").trim();
    if (candidate && candidate !== "www" && candidate !== baseDomainWithoutPort) {
      subdomain = candidate;
    }
  }

  // If a valid subdomain was detected, rewrite root or subpaths to the public portfolio
  if (subdomain && !pathname.startsWith("/portfolio")) {
    return NextResponse.rewrite(new URL(`/portfolio/${subdomain}${pathname === "/" ? "" : pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
