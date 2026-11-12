"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { updateUserDisplayName, sendUserPasswordReset } from "@/lib/firebase/auth";
import { getUserPortfolios, savePortfolio } from "@/lib/db/portfolios";
import { User, Mail, Shield, Save, Check, AlertCircle, KeyRound } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      await updateUserDisplayName(displayName);

      // Keep user's active portfolio in sync
      if (user?.uid) {
        try {
          const portfolios = await getUserPortfolios(user.uid);
          if (portfolios.length > 0) {
            const primary = portfolios[0];
            if (primary.personalInfo.fullName !== displayName.trim()) {
              await savePortfolio({
                ...primary,
                personalInfo: {
                  ...primary.personalInfo,
                  fullName: displayName.trim(),
                },
              });
            }
          }
        } catch (syncErr) {
          console.warn("[Settings] Portfolio sync warning:", syncErr);
        }
      }

      setSuccessMessage("Account profile updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setSendingReset(true);

    try {
      await sendUserPasswordReset(email);
      setSuccessMessage(`A secure password reset email has been sent to ${email}.`);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to send password reset email.");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-12">
      <div className="space-y-2 mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
          Preferences
        </span>
        <h1 className="font-serif text-3xl text-editorial-charcoal">
          Account Settings
        </h1>
        <p className="text-sm text-editorial-charcoal/70 font-sans">
          Manage your account credentials, security preferences, and default profile metadata.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="border border-editorial-border bg-white p-8 shadow-editorial">
          <h2 className="font-serif text-xl text-editorial-charcoal mb-4">
            Personal Information
          </h2>

          {successMessage && (
            <div className="mb-6 flex items-center space-x-2 border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 flex items-center space-x-2 border border-red-300 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Display Name
              </label>
              <div className="mt-1.5 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-editorial-muted">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Email Address
              </label>
              <div className="mt-1.5 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-editorial-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="block w-full border border-editorial-border bg-editorial-sand/20 pl-10 pr-3 py-2.5 text-sm text-editorial-muted cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-[11px] text-editorial-muted">
                Managed via Firebase Authentication.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-editorial-charcoal px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </div>

        {/* Security & Credentials */}
        <div className="border border-editorial-border bg-white p-8 shadow-editorial">
          <h2 className="font-serif text-xl text-editorial-charcoal mb-2">
            Security & Authentication
          </h2>
          <p className="text-xs text-editorial-muted mb-6">
            Keep your account secure with Firebase Auth session management and self-service password recovery.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-editorial-border bg-editorial-ivory/40 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <KeyRound className="h-4 w-4 text-editorial-mocha" />
                  <h4 className="text-sm font-medium text-editorial-charcoal">Password Reset</h4>
                </div>
                <p className="text-xs text-editorial-muted mt-1">
                  Send a password reset verification link to {email || "your registered email address"}.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={sendingReset}
                className="border border-editorial-border bg-white px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-editorial-sand/30 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {sendingReset ? "Sending..." : "Send Reset Email"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
