/**
 * Centralized URL & Domain Utility for FolioCraft
 *
 * Handles deterministic resolution of application base URLs across:
 * 1. Explicit production/custom domain configuration (NEXT_PUBLIC_APP_URL)
 * 2. Vercel deployment runtime variables (NEXT_PUBLIC_VERCEL_URL, VERCEL_URL)
 * 3. Client-side browser runtime (window.location.origin for live domains)
 * 4. Local development fallbacks (http://localhost:3000)
 *
 * Guarantees that public links, dashboard badges, share actions, and SEO metadata
 * never present localhost in production.
 */

const FALLBACK_PRODUCTION_DOMAIN = "foliocraft-jade.vercel.app";

/**
 * Checks whether a given string corresponds to a local development address.
 */
function isLocalAddress(str: string): boolean {
  const lower = str.toLowerCase();
  return (
    lower.includes("localhost") ||
    lower.includes("127.0.0.1") ||
    lower.includes("0.0.0.0") ||
    lower.includes("::1")
  );
}

/**
 * Normalizes a URL string by trimming whitespace, ensuring HTTPS/HTTP protocol,
 * and removing any trailing slashes.
 */
function sanitizeBaseUrl(rawUrl: string): string {
  let cleaned = rawUrl.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

/**
 * Resolves the root application base URL (with protocol).
 * Examples:
 * - Production: "https://foliocraft-jade.vercel.app"
 * - Custom domain: "https://foliocraft.com"
 * - Local development: "http://localhost:3000"
 */
export function getAppBaseUrl(): string {
  const isProd = process.env.NODE_ENV === "production";

  // 1. Explicit environment variable configured by owner (e.g. in Vercel or .env.local)
  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envAppUrl && envAppUrl.trim()) {
    // If in production, prevent accidental leakage of localhost URLs
    if (isProd && isLocalAddress(envAppUrl)) {
      console.warn(
        `[URL Utility] Warning: NEXT_PUBLIC_APP_URL is set to local address "${envAppUrl}" in production. Falling back to production domain.`
      );
    } else {
      return sanitizeBaseUrl(envAppUrl);
    }
  }

  // 2. Vercel deployment URL (automatically set on Vercel preview & production)
  const vercelUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.trim()) {
    return sanitizeBaseUrl(vercelUrl);
  }

  // 3. Client-side window check: if user is browsing a real remote domain, use it
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.trim();
    if (!isLocalAddress(origin)) {
      return sanitizeBaseUrl(origin);
    }

    // In local development browser, respect the local origin (with port)
    if (!isProd) {
      return sanitizeBaseUrl(origin);
    }
  }

  // 4. In development environment, fallback to localhost:3000
  if (!isProd) {
    return "http://localhost:3000";
  }

  // 5. Default production fallback for server rendering when no env var is set
  return `https://${FALLBACK_PRODUCTION_DOMAIN}`;
}

/**
 * Resolves the naked domain / host (without protocol or trailing slashes).
 * Useful for middleware subdomain parsing and domain matching.
 * Examples: "foliocraft-jade.vercel.app", "foliocraft.com", "localhost:3000"
 */
export function getAppDomain(): string {
  const envDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
  if (envDomain && envDomain.trim()) {
    return envDomain.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }

  const baseUrl = getAppBaseUrl();
  return baseUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

/**
 * Returns the canonical relative route path for a user's portfolio.
 * Example: "/portfolio/alex-morgan"
 */
export function getPortfolioPath(username: string): string {
  const slug = (username || "").trim();
  return `/portfolio/${encodeURIComponent(slug)}`;
}

/**
 * Generates the fully-qualified public HTTPS URL for a published portfolio.
 * Example: "https://foliocraft-jade.vercel.app/portfolio/alex-morgan"
 */
export function getPortfolioUrl(username: string): string {
  const base = getAppBaseUrl();
  const path = getPortfolioPath(username);
  return `${base}${path}`;
}

/**
 * Generates an internal preview URL for local testing during development.
 * In development, returns the local origin URL (e.g. "http://localhost:3000/portfolio/alex-morgan").
 * In production, returns the canonical published portfolio URL.
 */
export function getLocalPreviewUrl(username: string): string {
  if (process.env.NODE_ENV === "production") {
    return getPortfolioUrl(username);
  }
  const path = getPortfolioPath(username);
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return `http://localhost:3000${path}`;
}

/**
 * Generates a clean display version of the portfolio URL for UI headers, inputs, and cards.
 * Strips the "https://" or "http://" scheme.
 * Example: "foliocraft-jade.vercel.app/portfolio/alex-morgan"
 */
export function getDisplayPortfolioUrl(username: string): string {
  const fullUrl = getPortfolioUrl(username);
  return fullUrl.replace(/^https?:\/\//i, "");
}
