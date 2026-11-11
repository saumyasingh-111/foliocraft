"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getClientAuth,
  getClientDb,
  isFirebaseConfigured,
  getMissingFirebaseConfig,
} from "./client";
import {
  signInUser,
  signUpUser,
  signOutUser,
  sendUserPasswordReset,
  retryProfileSetup,
  SignUpResult,
} from "./auth";
import { createOrUpdateUserProfile, getUserProfile } from "./firestore";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  rawUser: FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  missingConfig: string[];
  login: (email: string, pass: string) => Promise<FirebaseUser>;
  signup: (email: string, pass: string, name?: string) => Promise<SignUpResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeProfileRecovery: (name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map Firebase error codes to human-readable guidance
export function mapFirebaseAuthError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: string }).code;
    const message = (error as { message?: string }).message || "";
    console.error("[FirebaseAuth Error Code]:", code, message);

    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/email-already-in-use":
        return "An account with this email address already exists. Please sign in instead.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      case "auth/user-disabled":
        return "This user account has been disabled. Please contact support.";
      case "auth/too-many-requests":
        return "Access temporarily disabled due to multiple failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network request failed. Please check your internet connection.";
      case "auth/permission-denied":
        return "Database permission denied. Please verify your Firestore security rules in Firebase Console.";
      case "auth/configuration-not-found":
        return "Firebase Authentication is not configured or Email/Password provider is disabled. In Firebase Console, open Build > Authentication > Sign-in method, click Email/Password, enable it, and click Save.";
      case "auth/profile-creation-failed":
        return message;
      default:
        return message || "An unexpected authentication error occurred. Please try again.";
    }
  }

  console.error("[FirebaseAuth Unknown Error]:", error);
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected authentication error occurred. Please try again.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [rawUser, setRawUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const missingConfig = getMissingFirebaseConfig();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const auth = getClientAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser: FirebaseUser | null) => {
        setRawUser(fbUser);
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            photoURL: fbUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("[FirebaseAuth] Observer state error:", error);
        setUser(null);
        setRawUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<FirebaseUser> => {
    const credUser = await signInUser(email, pass);
    setRawUser(credUser);
    setUser({
      uid: credUser.uid,
      email: credUser.email,
      displayName: credUser.displayName || credUser.email?.split("@")[0] || "User",
      photoURL: credUser.photoURL,
    });
    return credUser;
  };

  const signup = async (email: string, pass: string, name?: string): Promise<SignUpResult> => {
    const result = await signUpUser(email, pass, name || "");
    setRawUser(result.user);
    setUser({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || name || "User",
      photoURL: null,
    });
    return result;
  };

  const logout = async (): Promise<void> => {
    await signOutUser();
    setUser(null);
    setRawUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendUserPasswordReset(email);
  };

  const completeProfileRecovery = async (name?: string): Promise<void> => {
    const auth = getClientAuth();
    const currentUser = auth?.currentUser || rawUser;
    if (!currentUser) {
      throw new Error("No active authenticated session found to recover.");
    }
    await retryProfileSetup(currentUser, name);
    setUser({
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: name || currentUser.displayName || "User",
      photoURL: currentUser.photoURL,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        rawUser,
        loading,
        isConfigured: isFirebaseConfigured,
        missingConfig,
        login,
        signup,
        logout,
        resetPassword,
        completeProfileRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
