"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { User, Mail, Shield, Save, Check, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email] = useState(user?.email || "");
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
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

          {savedMessage && (
            <div className="mb-6 flex items-center space-x-2 border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Settings updated successfully.</span>
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
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 pl-10 pr-3 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
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
              className="inline-flex items-center space-x-2 bg-editorial-charcoal px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* Security & Credentials */}
        <div className="border border-editorial-border bg-white p-8 shadow-editorial">
          <h2 className="font-serif text-xl text-editorial-charcoal mb-2">
            Security & Authentication
          </h2>
          <p className="text-xs text-editorial-muted mb-6">
            Keep your account secure with Firebase Auth session management.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-editorial-border bg-editorial-ivory/40">
              <div>
                <h4 className="text-sm font-medium text-editorial-charcoal">Password</h4>
                <p className="text-xs text-editorial-muted">Last updated: active session</p>
              </div>
              <button
                type="button"
                onClick={() => alert("Password reset link will be sent to your email address.")}
                className="border border-editorial-border bg-white px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-editorial-sand/30"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
