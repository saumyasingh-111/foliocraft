import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Base domain config (e.g. "ourplatform.com" or "localhost:3000")
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";

  // Clean host (remove port in non-localhost or standard port)
  const currentHost = hostname.replace(`:${url.port}`, "");

  // Prevent rewriting for Next.js internal files, api routes, and static assets
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Canonical shorthand path alias: /p/[username] -> /portfolio/[username]
  if (url.pathname.startsWith("/p/")) {
    const slug = url.pathname.replace("/p/", "");
    return NextResponse.rewrite(new URL(`/portfolio/${slug}`, request.url));
  }

  // Subdomain detection (e.g. "alex-morgan.ourplatform.com" or "alex-morgan.localhost")
  // Check if currentHost ends with the base domain and has a subdomain prefix
  const isLocalhost = hostname.includes("localhost");
  const baseDomainClean = appDomain.split(":")[0];

  let subdomain: string | null = null;

  if (isLocalhost) {
    const parts = currentHost.split(".");
    // e.g. "alex-morgan.localhost" -> parts = ["alex-morgan", "localhost"]
    if (parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "www") {
      subdomain = parts[0];
    }
  } else {
    // Production wildcard subdomain: e.g. "alex.ourplatform.com"
    if (currentHost.endsWith(baseDomainClean)) {
      const prefix = currentHost.replace(`.${baseDomainClean}`, "");
      if (prefix && prefix !== baseDomainClean && prefix !== "www") {
        subdomain = prefix;
      }
    }
  }

  // If a valid subdomain was detected, rewrite internal path to /portfolio/[subdomain]
  if (subdomain && !url.pathname.startsWith("/portfolio")) {
    return NextResponse.rewrite(new URL(`/portfolio/${subdomain}${url.pathname}`, request.url));
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
     * - images / public files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
