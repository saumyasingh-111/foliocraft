"use client";

import React, { useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";

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
              <div className="flex h-8 w-8 items-center justify-center bg-editorial-charcoal text-editorial-ivory font-serif font-bold text-base">
                F
              </div>
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

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
