/**
 * Firebase Client Configuration & Environment Validation
 * FolioCraft Platform
 */

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const rawAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
const rawProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
const rawStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
const rawMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
const rawAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";
const rawMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "";

export const firebaseConfig = {
  apiKey: rawApiKey.trim(),
  authDomain: rawAuthDomain.trim(),
  projectId: rawProjectId.trim(),
  storageBucket: rawStorageBucket.trim(),
  messagingSenderId: rawMessagingSenderId.trim(),
  appId: rawAppId.trim(),
  measurementId: rawMeasurementId.trim() || undefined,
};

export function getMissingFirebaseConfig(): string[] {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!firebaseConfig.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!firebaseConfig.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  // storageBucket is now optional to support no-cost Spark plan deployment without Firebase Storage
  if (!firebaseConfig.messagingSenderId) missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!firebaseConfig.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  return missing;
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);
