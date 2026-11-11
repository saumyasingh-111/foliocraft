import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  ActionCodeSettings,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { getClientAuth, isFirebaseConfigured } from "./client";
import { createOrUpdateUserProfile, getUserProfile, UserProfileDocument } from "./firestore";
import { mapFirebaseAuthError } from "./auth-context";
import { getAppBaseUrl } from "@/lib/utils/url";

export interface SignUpResult {
  user: FirebaseUser;
  profile: UserProfileDocument;
}

/**
 * Creates Firebase Auth account, updates display name, and creates user profile in Firestore.
 * Implements granular failure detection: if auth succeeds but Firestore fails, it throws a recognizable
 * error containing the user credential so profile recovery can complete without re-registering.
 */
export async function signUpUser(
  email: string,
  pass: string,
  fullName: string
): Promise<SignUpResult> {
  const auth = getClientAuth();
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Authentication service is not configured. Please check your Firebase environment variables.");
  }

  const cleanEmail = email.trim();
  const cleanName = fullName.trim() || cleanEmail.split("@")[0] || "User";

  // 1. Create Firebase Auth user
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  } catch (authErr) {
    throw new Error(mapFirebaseAuthError(authErr));
  }

  // 2. Set Auth display name
  try {
    await updateProfile(cred.user, { displayName: cleanName });
  } catch (profileErr) {
    console.warn("[FirebaseAuth] Could not update displayName:", profileErr);
  }

  // 3. Persist User document to Firestore `users/{uid}`
  try {
    const profile = await createOrUpdateUserProfile(cred.user.uid, {
      uid: cred.user.uid,
      fullName: cleanName,
      email: cred.user.email || cleanEmail,
      photoURL: cred.user.photoURL || null,
      accountStatus: "active",
      onboardingCompleted: false,
      preferences: {
        emailNotifications: true,
        defaultTheme: "minimal-editorial",
        themeMode: "system",
      },
    });

    return { user: cred.user, profile };
  } catch (firestoreErr) {
    console.error("[Firestore] Profile creation error during registration:", firestoreErr);
    // Profile recovery error: The user exists in Auth, but profile write encountered an issue
    const customErr = new Error(
      "Your authentication account was created, but your database profile could not be initialized. Please click 'Complete Profile Setup' to continue."
    );
    (customErr as unknown as { code: string; user: FirebaseUser }).code = "auth/profile-creation-failed";
    (customErr as unknown as { user: FirebaseUser }).user = cred.user;
    throw customErr;
  }
}

/**
 * Retries profile creation for an already-authenticated user (Safe Profile Recovery)
 */
export async function retryProfileSetup(
  user: FirebaseUser,
  fullName?: string
): Promise<UserProfileDocument> {
  const cleanName = fullName?.trim() || user.displayName || user.email?.split("@")[0] || "User";

  if (!user.displayName && cleanName) {
    await updateProfile(user, { displayName: cleanName }).catch(() => {});
  }

  return await createOrUpdateUserProfile(user.uid, {
    uid: user.uid,
    fullName: cleanName,
    email: user.email || "",
    photoURL: user.photoURL || null,
    accountStatus: "active",
    onboardingCompleted: false,
    preferences: {
      emailNotifications: true,
      defaultTheme: "minimal-editorial",
      themeMode: "system",
    },
  });
}

/**
 * Authenticates user, ensures Firestore profile exists (backfilling if missing), and returns user.
 */
export async function signInUser(email: string, pass: string): Promise<FirebaseUser> {
  const auth = getClientAuth();
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Authentication service is not configured. Please check your Firebase environment variables.");
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    
    // Ensure Firestore profile exists (lazy backfill for accounts created offline or recovery)
    try {
      const existing = await getUserProfile(cred.user.uid);
      if (!existing) {
        await createOrUpdateUserProfile(cred.user.uid, {
          uid: cred.user.uid,
          fullName: cred.user.displayName || email.split("@")[0] || "User",
          email: cred.user.email || email,
          accountStatus: "active",
          onboardingCompleted: false,
        });
      }
    } catch (profileErr) {
      console.warn("[Firestore] User profile backfill notice upon sign in:", profileErr);
    }

    return cred.user;
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function signOutUser(): Promise<void> {
  const auth = getClientAuth();
  if (auth) {
    await fbSignOut(auth);
  }
}

export async function sendUserPasswordReset(email: string): Promise<void> {
  const auth = getClientAuth();
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Authentication service is not configured.");
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function updateUserDisplayName(fullName: string): Promise<void> {
  const auth = getClientAuth();
  if (!auth || !auth.currentUser) {
    throw new Error("No active user session.");
  }

  const name = fullName.trim();
  if (!name) {
    throw new Error("Name cannot be empty.");
  }

  try {
    await updateProfile(auth.currentUser, { displayName: name });
    await createOrUpdateUserProfile(auth.currentUser.uid, {
      fullName: name,
    });
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Dispatches Firebase native email verification with ActionCodeSettings pointing back to Vercel.
 */
export async function sendNativeEmailVerification(customUser?: FirebaseUser | null): Promise<void> {
  const auth = getClientAuth();
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Authentication service is not configured.");
  }

  const targetUser = customUser || auth.currentUser;
  if (!targetUser) {
    throw new Error("No active user session found to send verification email to.");
  }

  const baseUrl = getAppBaseUrl();
  const actionCodeSettings: ActionCodeSettings = {
    url: `${baseUrl}/verify-email`,
    handleCodeInApp: true,
  };

  try {
    await sendEmailVerification(targetUser, actionCodeSettings);
  } catch (err: unknown) {
    console.error("[FirebaseAuth] Failed to send verification email:", err);
    throw new Error(mapFirebaseAuthError(err));
  }
}

export interface VerifyActionCodeResult {
  success: boolean;
  email?: string;
  error?: string;
  code?: string;
}

/**
 * Validates and applies a Firebase verification action code (oobCode).
 */
export async function verifyEmailActionCode(oobCode: string): Promise<VerifyActionCodeResult> {
  const auth = getClientAuth();
  if (!auth || !isFirebaseConfigured) {
    return {
      success: false,
      error: "Authentication service is not configured.",
      code: "auth/not-configured",
    };
  }

  try {
    // 1. Check the action code first to get the associated email
    const info = await checkActionCode(auth, oobCode);
    const verifiedEmail = info.data.email || undefined;

    // 2. Apply the action code (sets emailVerified: true on Firebase account)
    await applyActionCode(auth, oobCode);

    // 3. If user is currently signed in on this client, reload their profile
    if (auth.currentUser) {
      await auth.currentUser.reload();
      try {
        await createOrUpdateUserProfile(auth.currentUser.uid, {
          emailVerified: true,
        });
      } catch {
        // Non-fatal
      }
    }

    return {
      success: true,
      email: verifiedEmail,
    };
  } catch (err: unknown) {
    console.error("[FirebaseAuth] applyActionCode error:", err);
    const errCode = (err && typeof err === "object" && "code" in err)
      ? (err as { code: string }).code
      : "auth/unknown";

    let message = "Failed to verify email. The link may be invalid or expired.";
    if (errCode === "auth/expired-action-code") {
      message = "This verification link has expired. Verification links are time-limited for security.";
    } else if (errCode === "auth/invalid-action-code") {
      message = "This verification link is invalid or has already been used. If you have already verified, please sign in.";
    } else if (errCode === "auth/user-disabled") {
      message = "This user account has been disabled. Please contact support.";
    } else if (errCode === "auth/user-not-found") {
      message = "The user corresponding to this code was not found.";
    }

    return {
      success: false,
      error: message,
      code: errCode,
    };
  }
}
