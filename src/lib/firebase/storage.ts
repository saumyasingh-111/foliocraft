/**
 * Optional Firebase Storage Provider
 * 
 * Provides an implementation of the MediaService StorageProvider interface.
 * Only activated if a Firebase Storage bucket is configured and available (e.g. on Blaze plan).
 * On Spark free plans without billing, this provider is inactive and FolioCraft operates
 * in No-Cost Hosted Mode with external URLs and session previews.
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getClientStorage, isFirebaseConfigured } from "./client";
import { StorageProvider } from "../media/mediaService";

export type UploadCategory =
  | "profile"
  | "avatars"
  | "projects"
  | "resume"
  | "resumes"
  | "certificates"
  | "gallery";

export class FirebaseStorageProvider implements StorageProvider {
  name = "Firebase Storage (Blaze Cloud)";

  isAvailable(): boolean {
    return Boolean(getClientStorage() && isFirebaseConfigured);
  }

  async upload(
    file: File,
    path: string,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const storage = getClientStorage();
    if (!storage) {
      throw new Error(
        "Firebase Storage is unavailable on the current plan. Please use hosted image URLs."
      );
    }

    const storageRef = ref(storage, path);

    if (onProgress) {
      return new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
        });

        uploadTask.on(
          "state_changed",
          (snap) => {
            const percent = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            onProgress(percent);
          },
          (err) => reject(err),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    }

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    return await getDownloadURL(snapshot.ref);
  }

  async delete(path: string): Promise<void> {
    const storage = getClientStorage();
    if (!storage) return;
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch {
      // Ignore if already deleted
    }
  }
}

/**
 * Legacy helper if directly invoked; gracefully errors on unconfigured storage
 */
export async function uploadMediaToStorage(
  file: File,
  userId: string,
  portfolioId?: string,
  category: UploadCategory = "projects"
): Promise<string> {
  const provider = new FirebaseStorageProvider();
  if (!provider.isAvailable()) {
    throw new Error(
      "Firebase Storage is not available on this plan. Use hosted image URLs or local session previews."
    );
  }
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueName = `${Date.now()}_${sanitizedFilename}`;
  const path = portfolioId
    ? `users/${userId}/portfolios/${portfolioId}/${category}/${uniqueName}`
    : `users/${userId}/${category}/${uniqueName}`;
  return await provider.upload(file, path);
}
