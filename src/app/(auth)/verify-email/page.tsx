"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { verifyEmailActionCode } from "@/lib/firebase/auth";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Send,
  Sparkles,
  ShieldCheck,
  Compass,
} from "lucide-react";

type VerificationStatus =
  | "checking"
  | "verifying"
  | "verified"
  | "already_verified"
  | "expired"
  | "invalid"
  | "pending";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, rawUser, reloadUser, sendVerificationEmail } = useAuth();

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");
  const emailParam = searchParams.get("email");

  const [status, setStatus] = useState<VerificationStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  // Resend cooldown timer (60 seconds)
  const [cooldown, setCooldown] = useState<number>(0);
  const [resending, setResending] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Main evaluation effect
  useEffect(() => {
    let isMounted = true;

    async function evaluateState() {
      // 1. If an oobCode is present in the URL, verify it immediately
      if (oobCode) {
        setStatus("verifying");
        try {
          const res = await verifyEmailActionCode(oobCode);
          if (!isMounted) return;

          if (res.success) {
            setVerifiedEmail(res.email || null);
            setStatus("verified");
            // If user has an active session, refresh it in AuthContext
            try {
              await reloadUser();
            } catch {
              // Ignore session reload error if unauthenticated
            }
          } else {
            // If verification failed because the code was already consumed, but current user is verified
            if (res.code === "auth/invalid-action-code" && user?.emailVerified) {
              setStatus("already_verified");
              return;
            }

            setErrorMessage(res.error || "Unable to verify email.");
            if (res.code === "auth/expired-action-code") {
              setStatus("expired");
            } else {
              setStatus("invalid");
            }
          }
        } catch (err: unknown) {
          if (!isMounted) return;
          const msg = err instanceof Error ? err.message : "Failed to verify email code.";
          setErrorMessage(msg);
          setStatus("invalid");
        }
        return;
      }

      // 2. If user is already verified and no oobCode was supplied
      if (user?.emailVerified) {
        setStatus("already_verified");
        return;
      }

      // 3. Otherwise, show the pending instructions view
      setStatus("pending");
    }

    evaluateState();

    return () => {
      isMounted = false;
    };
  }, [oobCode, mode, user?.emailVerified]);

  // Handle Resend Verification Email
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendSuccess(null);
    setErrorMessage(null);

    try {
      await sendVerificationEmail(rawUser);
      setResendSuccess("A new verification link has been sent to your email.");
      setCooldown(60);
    } catch (err: unknown) {
      console.error("[VerifyEmail] Resend error:", err);
      const msg = err instanceof Error ? err.message : "Failed to resend verification email.";
      setErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  // Handle manual "Check Status" button
  const handleCheckStatus = async () => {
    if (checkingStatus) return;
    setCheckingStatus(true);
    setErrorMessage(null);

    try {
      await reloadUser();
      if (rawUser?.emailVerified || user?.emailVerified) {
        setStatus("verified");
      } else {
        setResendSuccess("Verification pending. Please ensure you clicked the link in your email.");
      }
    } catch (err: unknown) {
      console.error("[VerifyEmail] Check status error:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const displayEmail =
    verifiedEmail ||
    user?.email ||
    emailParam ||
    (rawUser ? rawUser.email : null) ||
    "your email address";

  return (
    <div className="min-h-screen bg-editorial-ivory flex flex-col justify-center py-16 sm:py-24 px-4 sm:px-6 lg:px-8 selection:bg-editorial-sand selection:text-editorial-charcoal">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center space-x-2.5 group transition-transform active:scale-95"
        >
          <Image
            src="/logo.png"
            alt="FolioCraft"
            width={40}
            height={40}
            className="h-10 w-10 object-contain rounded-sm shadow-xs transition-opacity group-hover:opacity-90"
            priority
          />
          <span className="font-serif text-2xl tracking-tight font-semibold text-editorial-charcoal">
            FolioCraft
          </span>
        </Link>
        <p className="mt-1 text-xs font-mono uppercase tracking-widest text-editorial-muted">
          Portfolio Studio & Publishing
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="border border-editorial-border bg-white px-8 py-10 sm:px-12 shadow-editorial transition-all duration-300">

          {/* ================================================================= */}
          {/* STATE 0: INITIAL CHECKING */}
          {/* ================================================================= */}
          {status === "checking" && (
            <div className="text-center py-10 space-y-4">
              <div className="h-8 w-8 border-2 border-editorial-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-serif text-editorial-charcoal tracking-wide">
                Consulting verification status...
              </p>
            </div>
          )}

          {/* ================================================================= */}
          {/* STATE 1: PROCESSING VERIFICATION (Verifying action code) */}
          {/* ================================================================= */}
          {status === "verifying" && (
            <div className="text-center py-10 space-y-5 animate-fade-in">
              <div className="relative mx-auto h-14 w-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-editorial-border animate-ping opacity-30" />
                <div className="h-12 w-12 rounded-full border-2 border-editorial-charcoal border-t-transparent animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl font-normal text-editorial-charcoal tracking-tight">
                  Confirming your credentials
                </h2>
                <p className="text-xs text-editorial-charcoal/70 font-sans max-w-sm mx-auto leading-relaxed">
                  Connecting with FolioCraft security services to validate your access token...
                </p>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STATE 2: EMAIL SUCCESSFULLY VERIFIED (Requested Success Screen) */}
          {/* ================================================================= */}
          {status === "verified" && (
            <div className="text-center space-y-7 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
                <CheckCircle2 className="h-8 w-8 stroke-[1.75]" />
              </div>

              <div className="space-y-2.5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-editorial-ivory border border-editorial-border text-[10px] font-mono uppercase tracking-wider text-editorial-charcoal">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  <span>Account Verified</span>
                </div>
                <h2 className="font-serif text-3xl font-normal text-editorial-charcoal tracking-tight">
                  Your creative space is ready.
                </h2>
                <p className="text-sm text-editorial-charcoal/80 leading-relaxed font-sans max-w-md mx-auto pt-1">
                  Welcome to FolioCraft. Your email address{" "}
                  <span className="font-semibold text-editorial-charcoal">{displayEmail}</span>{" "}
                  has been verified. You now have full authorization to design, personalize, and publish your personal portfolio to the world.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-5 text-xs font-mono uppercase tracking-widest text-editorial-ivory hover:bg-editorial-softdark transition-all duration-200 shadow-xs"
                >
                  <span>Continue to Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/onboarding"
                  className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal/70 hover:text-editorial-charcoal hover:underline pt-1 transition-colors"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Configure portfolio profile & theme</span>
                </Link>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STATE 3: VERIFICATION LINK EXPIRED */}
          {/* ================================================================= */}
          {status === "expired" && (
            <div className="text-center space-y-7 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
                <Clock className="h-8 w-8 stroke-[1.75]" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-normal text-editorial-charcoal tracking-tight">
                  Verification Link Expired
                </h2>
                <p className="text-sm text-editorial-charcoal/75 leading-relaxed font-sans max-w-sm mx-auto">
                  For your protection, security tokens expire after a limited period. Request a fresh verification link below to activate your account.
                </p>
              </div>

              {resendSuccess && (
                <div className="border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 flex items-center space-x-2 text-left">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {errorMessage && (
                <div className="border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-center space-x-2 text-left">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {rawUser ? (
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || cooldown > 0}
                    className="w-full flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-5 text-xs font-mono uppercase tracking-widest text-editorial-ivory hover:bg-editorial-softdark transition-colors disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>
                      {resending
                        ? "Dispatching..."
                        : cooldown > 0
                        ? `Resend in ${cooldown}s`
                        : "Send Fresh Verification Link"}
                    </span>
                  </button>
                  <Link
                    href="/dashboard"
                    className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal/70 hover:text-editorial-charcoal hover:underline pt-2"
                  >
                    Return to Studio
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-5 text-xs font-mono uppercase tracking-widest text-editorial-ivory hover:bg-editorial-softdark transition-colors"
                  >
                    <span>Sign In to Request Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/"
                    className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal/70 hover:text-editorial-charcoal hover:underline pt-2"
                  >
                    Return to FolioCraft Home
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* STATE 4: INVALID VERIFICATION LINK */}
          {/* ================================================================= */}
          {status === "invalid" && (
            <div className="text-center space-y-7 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-700 border border-stone-200 shadow-xs">
                <AlertCircle className="h-8 w-8 stroke-[1.75]" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-normal text-editorial-charcoal tracking-tight">
                  Invalid Verification Link
                </h2>
                <p className="text-sm text-editorial-charcoal/75 leading-relaxed font-sans max-w-sm mx-auto">
                  {errorMessage ||
                    "This verification link is invalid or has already been used to confirm an account. If you have already verified, you can sign in directly."}
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-5 text-xs font-mono uppercase tracking-widest text-editorial-ivory hover:bg-editorial-softdark transition-colors"
                >
                  <span>Go to Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal/70 hover:text-editorial-charcoal hover:underline pt-1"
                >
                  Sign in with another account
                </Link>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STATE 5: EMAIL ALREADY VERIFIED */}
          {/* ================================================================= */}
          {status === "already_verified" && (
            <div className="text-center space-y-7 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-editorial-ivory text-editorial-charcoal border border-editorial-border shadow-xs">
                <ShieldCheck className="h-8 w-8 text-editorial-charcoal stroke-[1.75]" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-normal text-editorial-charcoal tracking-tight">
                  Account Already Verified
                </h2>
                <p className="text-sm text-editorial-charcoal/75 leading-relaxed font-sans max-w-sm mx-auto">
                  Your address <span className="font-semibold text-editorial-charcoal">{displayEmail}</span> is already active and verified. You have full access to create, edit, and publish your personal portfolio.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-5 text-xs font-mono uppercase tracking-widest text-editorial-ivory hover:bg-editorial-softdark transition-colors"
                >
                  <span>Open Studio Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/onboarding"
                  className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal/70 hover:text-editorial-charcoal hover:underline pt-1"
                >
                  Launch Profile Wizard
                </Link>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* BONUS STATE: PENDING INBOX VIEW (Arriving post-signup) */}
          {/* ================================================================= */}
          {status === "pending" && (
            <div className="space-y-7 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-editorial-ivory text-editorial-charcoal border border-editorial-border shadow-xs">
                  <Mail className="h-7 w-7 stroke-[1.75]" />
                </div>
                <h2 className="font-serif text-2xl font-normal text-editorial-charcoal tracking-tight">
                  Verify your email
                </h2>
                <p className="text-sm text-editorial-charcoal/75 font-sans leading-relaxed">
                  We have dispatched a confirmation link to:
                </p>
                <div className="font-mono text-xs font-semibold bg-editorial-ivory px-3.5 py-1.5 border border-editorial-border inline-block rounded-sm text-editorial-charcoal">
                  {displayEmail}
                </div>
              </div>

              {/* Feedback banners */}
              {resendSuccess && (
                <div className="border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {errorMessage && (
                <div className="border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-800 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Editorial step card */}
              <div className="border border-editorial-border/70 bg-editorial-ivory/30 p-4 space-y-2 text-xs text-editorial-charcoal/80 font-sans">
                <p className="font-semibold text-editorial-charcoal uppercase tracking-wider font-mono text-[10px]">
                  Next Steps:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-editorial-charcoal/80">
                  <li>Open your inbox and check for an email from <span className="font-semibold text-editorial-charcoal">FolioCraft</span>.</li>
                  <li>Click the activation link to confirm your ownership.</li>
                  <li>Return to this window or click below once completed.</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={checkingStatus}
                  className="w-full flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-5 text-xs font-mono uppercase tracking-widest text-editorial-ivory hover:bg-editorial-softdark transition-colors disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${checkingStatus ? "animate-spin" : ""}`} />
                  <span>{checkingStatus ? "Checking status..." : "I've Clicked the Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="w-full flex items-center justify-center space-x-2 border border-editorial-border bg-white py-2.5 px-4 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-ivory/50 transition-colors disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  <span>
                    {resending
                      ? "Dispatching..."
                      : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Resend Verification Email"}
                  </span>
                </button>
              </div>

              <div className="pt-4 border-t border-editorial-border/60 flex items-center justify-between text-xs text-editorial-charcoal/70">
                <Link
                  href="/dashboard"
                  className="hover:text-editorial-charcoal hover:underline"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/login"
                  className="hover:text-editorial-charcoal hover:underline"
                >
                  Sign in with another email
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Minimal Footer Note */}
        <p className="mt-6 text-center text-[11px] font-mono text-editorial-muted">
          FolioCraft &bull; Independent Creative Portfolio System
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-editorial-ivory flex items-center justify-center font-mono text-xs uppercase tracking-widest text-editorial-muted">
          Loading Verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
