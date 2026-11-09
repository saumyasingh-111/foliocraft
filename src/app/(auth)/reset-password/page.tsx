"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
  const { resetPassword, isConfigured, missingConfig } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!isConfigured) {
      setError(
        "Authentication service is not configured. Please configure your Firebase environment variables."
      );
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Reset password
        </h2>
        <p className="mt-2 text-sm text-editorial-charcoal/70 font-sans">
          We’ll email you instructions to restore access
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
                Firebase credentials are missing from your environment. To enable password recovery, configure the following variables in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code>:
              </p>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-amber-800">
                {missingConfig.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </div>
          )}

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl text-editorial-charcoal">
                Instructions dispatched
              </h3>
              <p className="text-sm text-editorial-charcoal/80">
                If an account exists for <span className="font-semibold">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start space-x-2 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

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
                    className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 flex items-center justify-center space-x-2 bg-editorial-charcoal py-3 px-4 text-sm font-medium text-editorial-ivory hover:bg-editorial-softdark transition-colors disabled:opacity-50"
              >
                <span>{submitting ? "Sending..." : "Send Reset Link"}</span>
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 text-xs text-editorial-muted hover:text-editorial-charcoal"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
