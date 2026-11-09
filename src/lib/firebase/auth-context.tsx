"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured, getMissingFirebaseConfig } from "./client";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  missingConfig: string[];
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map Firebase error codes to user-friendly messages
export function mapFirebaseAuthError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/email-already-in-use":
        return "An account with this email address already exists.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/user-disabled":
        return "This user account has been disabled. Please contact support.";
      case "auth/too-many-requests":
        return "Access temporarily disabled due to multiple failed login attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network request failed. Please check your internet connection.";
      case "auth/api-key-not-valid":
      case "auth/invalid-api-key":
        return "Authentication service configuration is invalid. Please verify your Firebase API key.";
      default:
        if ("message" in error && typeof (error as { message: unknown }).message === "string") {
          return (error as { message: string }).message;
        }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected authentication error occurred. Please try again.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const missingConfig = getMissingFirebaseConfig();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser: FirebaseUser | null) => {
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
        console.error("Auth state listener error:", error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Authentication service is not configured. Please configure your Firebase environment variables."
      );
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
        photoURL: cred.user.photoURL,
      });

      // Retrieve or verify user document in Firestore
      if (db) {
        try {
          const userDocRef = doc(db, "users", cred.user.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              userId: cred.user.uid,
              email: cred.user.email,
              displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (dbErr) {
          console.warn("Could not sync user profile to Firestore:", dbErr);
        }
      }
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name?: string): Promise<void> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Authentication service is not configured. Please configure your Firebase environment variables."
      );
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const displayName = name?.trim() || email.split("@")[0] || "User";

      if (name) {
        await updateProfile(cred.user, { displayName });
      }

      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName,
        photoURL: null,
      });

      // Create user profile record in Firestore
      if (db) {
        try {
          const userDocRef = doc(db, "users", cred.user.uid);
          await setDoc(userDocRef, {
            userId: cred.user.uid,
            email: cred.user.email,
            displayName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn("Could not save user profile to Firestore:", dbErr);
        }
      }
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Authentication service is not configured. Please configure your Firebase environment variables."
      );
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        missingConfig,
        login,
        signup,
        logout,
        resetPassword,
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
