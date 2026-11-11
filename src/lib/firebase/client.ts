import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { firebaseConfig, isFirebaseConfigured, getMissingFirebaseConfig } from "./config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getClientApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    } catch (err) {
      console.error("[Firebase] App initialization error:", err);
      return null;
    }
  }
  return app;
}

export function getClientAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (!auth) {
    const a = getClientApp();
    if (a) {
      try {
        auth = getAuth(a);
      } catch (err) {
        console.error("[Firebase] Auth initialization error:", err);
        return null;
      }
    }
  }
  return auth;
}

export function getClientDb(): Firestore | null {
  if (!db) {
    const a = getClientApp();
    if (a) {
      try {
        db = getFirestore(a);
      } catch (err) {
        console.error("[Firebase] Firestore initialization error:", err);
        return null;
      }
    }
  }
  return db;
}

/**
 * Returns Firebase Storage instance if configured and available.
 * Returns null gracefully on free Spark plans without billing accounts.
 */
export function getClientStorage(): FirebaseStorage | null {
  if (typeof window === "undefined" || !firebaseConfig.storageBucket) return null;
  if (!storage) {
    const a = getClientApp();
    if (a) {
      try {
        // Dynamically import getStorage only if storageBucket is explicitly present
        const { getStorage } = require("firebase/storage");
        storage = getStorage(a);
      } catch {
        return null;
      }
    }
  }
  return storage;
}

// Auto-initialize core client singletons when running in browser
if (typeof window !== "undefined" && isFirebaseConfigured) {
  getClientApp();
  getClientAuth();
  getClientDb();
}

export { app, auth, db, storage, isFirebaseConfigured, getMissingFirebaseConfig };
