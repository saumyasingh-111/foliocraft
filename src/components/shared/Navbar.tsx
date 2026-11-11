"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/firebase/auth-context";
import { ArrowRight, Menu, X, Sparkles, LayoutDashboard, User } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-editorial-border/60 bg-editorial-ivory/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center space-x-2.5">
          <Image
            src="/logo.png"
            alt="FolioCraft"
            width={36}
            height={36}
            className="h-9 w-9 object-contain rounded-sm transition-transform group-hover:scale-105"
            priority
          />
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-tight font-semibold text-editorial-charcoal">
              FolioCraft
            </span>
            <span className="text-[10px] uppercase tracking-widest text-editorial-mocha -mt-1 font-mono">
              Editorial Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center space-x-8 text-sm font-medium text-editorial-charcoal/80 md:flex">
          <Link
            href="/#themes"
            className="transition-colors hover:text-editorial-charcoal hover:underline underline-offset-4 decoration-editorial-mocha"
          >
            Themes
          </Link>
          <Link
            href="/#how-it-works"
            className="transition-colors hover:text-editorial-charcoal hover:underline underline-offset-4 decoration-editorial-mocha"
          >
            How it Works
          </Link>
          <Link
            href="/#features"
            className="transition-colors hover:text-editorial-charcoal hover:underline underline-offset-4 decoration-editorial-mocha"
          >
            Features
          </Link>
          <Link
            href="/#examples"
            className="transition-colors hover:text-editorial-charcoal hover:underline underline-offset-4 decoration-editorial-mocha"
          >
            Showcase
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center space-x-4 md:flex">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-editorial-charcoal hover:bg-editorial-sand/40 border border-editorial-border transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => logout()}
                className="px-3 py-2 text-xs uppercase tracking-wider text-editorial-muted hover:text-editorial-charcoal transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-editorial-charcoal hover:text-editorial-mocha transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="group inline-flex items-center space-x-2 border border-editorial-charcoal bg-editorial-charcoal px-5 py-2.5 text-sm font-medium text-editorial-ivory transition-all hover:bg-editorial-softdark hover:shadow-editorial"
              >
                <span>Create Your Portfolio</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-editorial-charcoal md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-editorial-border bg-editorial-ivory px-6 py-6 md:hidden">
          <div className="flex flex-col space-y-4 text-base font-medium">
            <Link
              href="/#themes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-editorial-charcoal"
            >
              Themes
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-editorial-charcoal"
            >
              How it Works
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-editorial-charcoal"
            >
              Features
            </Link>
            <Link
              href="/#examples"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-editorial-charcoal"
            >
              Showcase
            </Link>

            <div className="pt-4 border-t border-editorial-border flex flex-col space-y-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 text-editorial-ivory"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-center py-2 text-sm text-editorial-muted"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-sm font-medium border border-editorial-border"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 text-editorial-ivory"
                  >
                    <span>Create Your Portfolio</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
