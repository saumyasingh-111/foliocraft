"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { ArrowRight, Lock, Mail, User, AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTheme = searchParams.get("theme");

  const {
    signup,
    isConfigured,
    missingConfig,
    completeProfileRecovery,
    sendVerificationEmail,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [canRecoverProfile, setCanRecoverProfile] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate submissions

    if (!email.trim() || !password || !name.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!isConfigured) {
      setError(
        "Authentication service is not configured. Please configure your Firebase environment variables."
      );
      return;
    }

    setError(null);
    setCanRecoverProfile(false);
    setSubmitting(true);

    try {
      const result = await signup(email, password, name);
      try {
        await sendVerificationEmail(result.user);
      } catch (vErr) {
        console.warn("[Signup] Verification email auto-send failed:", vErr);
      }

      const target = `/verify-email?pending=true&email=${encodeURIComponent(email.trim())}${
        preselectedTheme ? `&theme=${encodeURIComponent(preselectedTheme)}` : ""
      }`;
      router.push(target);
    } catch (err: unknown) {
      console.error("[Signup Error Caught]:", err);
      const msg = err instanceof Error ? err.message : "Failed to create account.";
      setError(msg);

      // Check if user account was created in Auth but Firestore initialization failed
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "auth/profile-creation-failed"
      ) {
        setCanRecoverProfile(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecoverProfile = async () => {
    if (recovering) return;
    setRecovering(true);
    setError(null);

    try {
      await completeProfileRecovery(name);
      const target = preselectedTheme
        ? `/onboarding?theme=${preselectedTheme}`
        : "/onboarding";
      router.push(target);
    } catch (err: unknown) {
      console.error("[Profile Recovery Error]:", err);
      const msg = err instanceof Error ? err.message : "Profile setup recovery failed.";
      setError(msg);
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5">
          <Image
            src="/logo.png"
            alt="FolioCraft"
            width={40}
            height={40}
            className="h-10 w-10 object-contain rounded-sm"
            priority
          />
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
          
          {/* Missing Configuration Notice */}
          {!isConfigured && (
            <div className="mb-6 border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-700 flex-shrink-0" />
                <span>Authentication Service Not Configured</span>
              </div>
              <p className="leading-relaxed">
                Firebase credentials are missing from your environment. To enable real account creation, configure the following variables in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code>:
              </p>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-amber-800">
                {missingConfig.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mb-6 border border-red-200 bg-red-50/80 p-4 text-xs text-red-800 space-y-2">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>

              {/* Profile Recovery Action if Auth was provisioned but Firestore failed */}
              {canRecoverProfile && (
                <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                  <span className="text-[11px] text-red-700">Account verified in Auth.</span>
                  <button
                    type="button"
                    onClick={handleRecoverProfile}
                    disabled={recovering}
                    className="inline-flex items-center space-x-1.5 border border-red-800 bg-red-800 text-white px-3 py-1 text-xs font-mono uppercase tracking-wider hover:bg-red-900 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${recovering ? "animate-spin" : ""}`} />
                    <span>{recovering ? "Connecting..." : "Complete Profile Setup"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

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
                  disabled={submitting}
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none transition-colors disabled:opacity-60"
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
                  placeholder="name@example.com"
                  disabled={submitting}
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none transition-colors disabled:opacity-60"
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
                  disabled={submitting}
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none transition-colors disabled:opacity-60"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-4 text-sm font-medium text-editorial-ivory hover:bg-editorial-softdark transition-colors disabled:opacity-60"
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
    <Suspense fallback={<div className="min-h-screen bg-editorial-ivory flex items-center justify-center font-mono text-xs">Loading Signup...</div>}>
      <SignupContent />
    </Suspense>
  );
}
