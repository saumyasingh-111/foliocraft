"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { ArrowRight, Lock, Mail, User, AlertCircle, Sparkles } from "lucide-react";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTheme = searchParams.get("theme");

  const { signup, demoLogin, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await signup(email, password, name);
      const target = preselectedTheme
        ? `/onboarding?theme=${preselectedTheme}`
        : "/onboarding";
      router.push(target);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    demoLogin();
    const target = preselectedTheme
      ? `/onboarding?theme=${preselectedTheme}`
      : "/onboarding";
    router.push(target);
  };

  return (
    <div className="min-h-screen bg-editorial-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center bg-editorial-charcoal text-editorial-ivory font-serif font-bold text-lg">
            F
          </div>
          <span className="font-serif text-2xl tracking-tight font-semibold text-editorial-charcoal">
            FolioCraft
          </span>
        </Link>
        <h2 className="mt-6 font-serif text-3xl font-normal text-editorial-charcoal">
          Begin your portfolio
        </h2>
        <p className="mt-2 text-sm text-editorial-charcoal/70 font-sans">
          Create an account and publish your personal website in minutes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="border border-editorial-border bg-white px-8 py-10 shadow-editorial sm:px-10">
          
          {error && (
            <div className="mb-6 flex items-start space-x-2.5 border border-red-200 bg-red-50/60 p-3.5 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Instant Demo Account Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center space-x-2 border border-editorial-sand bg-editorial-sand/20 py-2.5 px-4 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/40 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-editorial-mocha" />
              <span>Quick Start with Demo Account</span>
            </button>
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-editorial-border" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-mono uppercase tracking-widest text-editorial-muted">
                or create an account
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Full Name
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-editorial-muted">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-editorial-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@morgan.design"
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Password
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-editorial-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full mt-6 flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-4 text-sm font-medium text-editorial-ivory hover:bg-editorial-softdark transition-colors disabled:opacity-50"
            >
              <span>{submitting ? "Creating Account..." : "Continue to Setup"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 border-t border-editorial-border/60 pt-6 text-center">
            <p className="text-xs text-editorial-charcoal/70">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-editorial-charcoal hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-editorial-ivory flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
