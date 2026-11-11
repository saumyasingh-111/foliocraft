"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  LayoutDashboard,
  Compass,
  Settings,
  LogOut,
  ExternalLink,
  PlusCircle,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

function EmailVerificationBanner() {
  const { user, rawUser, sendVerificationEmail, reloadUser } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setMessage(null);
    try {
      await sendVerificationEmail(rawUser);
      setMessage("Verification email sent.");
      setCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend.";
      setMessage(msg);
    } finally {
      setResending(false);
    }
  };

  const handleCheck = async () => {
    if (checking) return;
    setChecking(true);
    setMessage(null);
    try {
      await reloadUser();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="border-b border-amber-300 bg-amber-50/90 text-amber-900 px-6 py-2.5">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-700 flex-shrink-0" />
          <span>
            <strong className="font-medium">Action Required:</strong> Please verify your email ({user.email}) to publish your portfolio.
          </span>
          {message && (
            <span className="font-mono text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              {message}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="underline hover:text-amber-950 disabled:opacity-50 font-medium"
          >
            {resending ? "Sending..." : cooldown > 0 ? `Resend (${cooldown}s)` : "Resend Link"}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="hover:text-amber-950 font-medium"
          >
            {checking ? "Checking..." : "I've Verified"}
          </button>
          <span>•</span>
          <Link
            href="/verify-email"
            className="underline hover:text-amber-950 font-medium"
          >
            Instructions
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-editorial-ivory flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-2 border-editorial-charcoal border-t-transparent rounded-full animate-spin" />
        <span className="font-serif text-sm text-editorial-charcoal/70 tracking-widest uppercase">
          Loading Portfolio Studio...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editorial-ivory flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-editorial-border bg-editorial-ivory/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-12">
          
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="FolioCraft"
                width={32}
                height={32}
                className="h-8 w-8 object-contain rounded-sm"
              />
              <span className="font-serif text-xl tracking-tight font-semibold text-editorial-charcoal hidden sm:inline">
                FolioCraft
              </span>
            </Link>

            <nav className="flex items-center space-x-2 sm:space-x-4 text-xs font-mono uppercase tracking-wider">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-editorial-charcoal text-editorial-ivory"
                    : "text-editorial-charcoal/80 hover:bg-editorial-sand/40"
                }`}
              >
                Portfolios
              </Link>
              <Link
                href="/onboarding"
                className={`px-3 py-1.5 transition-colors ${
                  pathname.startsWith("/onboarding")
                    ? "bg-editorial-charcoal text-editorial-ivory"
                    : "text-editorial-charcoal/80 hover:bg-editorial-sand/40"
                }`}
              >
                Profile Wizard
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-1.5 transition-colors ${
                  pathname === "/settings"
                    ? "bg-editorial-charcoal text-editorial-ivory"
                    : "text-editorial-charcoal/80 hover:bg-editorial-sand/40"
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-editorial-charcoal">
                {user.displayName || user.email}
              </span>
              <span className="text-[10px] font-mono text-editorial-muted">
                {user.email}
              </span>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 text-editorial-muted hover:text-editorial-charcoal border border-editorial-border hover:bg-editorial-sand/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>
      <EmailVerificationBanner />

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
