import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { getClientAuth, isFirebaseConfigured } from "./client";
import { createOrUpdateUserProfile, getUserProfile } from "./firestore";
import { mapFirebaseAuthError } from "./auth-context";

export async function signInUser(email: string, pass: string): Promise<FirebaseUser> {
  const auth = getClientAuth();
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Authentication service is not configured. Please check your Firebase environment variables.");
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    
    // Ensure Firestore profile exists
    try {
      const existing = await getUserProfile(cred.user.uid);
      if (!existing) {
        await createOrUpdateUserProfile(cred.user.uid, {
          fullName: cred.user.displayName || email.split("@")[0] || "User",
          email: cred.user.email || email,
          accountStatus: "active",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (profileErr) {
      console.warn("Could not sync user profile upon sign in:", profileErr);
    }

    return cred.user;
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function signUpUser(
  email: string,
  pass: string,
  fullName: string
): Promise<FirebaseUser> {
  const auth = getClientAuth();
  if (!auth || !isFirebaseConfigured) {
    throw new Error("Authentication service is not configured. Please check your Firebase environment variables.");
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const name = fullName.trim() || email.split("@")[0] || "User";

    await updateProfile(cred.user, { displayName: name });

    // Automatically create user profile document in Firestore
    await createOrUpdateUserProfile(cred.user.uid, {
      fullName: name,
      email: cred.user.email || email,
      accountStatus: "active",
      createdAt: new Date().toISOString(),
    });

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
