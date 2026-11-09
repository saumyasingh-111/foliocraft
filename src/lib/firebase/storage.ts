import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getClientStorage, isFirebaseConfigured } from "./client";

export type UploadCategory = "avatars" | "projects" | "resumes" | "gallery" | "certificates";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function uploadMediaToStorage(
  file: File,
  userId: string,
  portfolioId: string,
  category: UploadCategory
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase Storage is not configured. Please check your environment variables.");
  }

  const storage = getClientStorage();
  if (!storage) {
    throw new Error("Unable to initialize Firebase Storage client.");
  }

  // 1. Validation: File Type & Size
  if (category === "resumes") {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Invalid document format. Please upload a PDF file.");
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new Error("Resume PDF exceeds the 10MB limit.");
    }
  } else {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Invalid image format. Supported formats: JPG, PNG, WebP, GIF, SVG.");
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("Image exceeds the 5MB size limit.");
    }
  }

  // 2. Sanitize file name & generate scoped path
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueName = `${Date.now()}_${sanitizedFilename}`;
  const storagePath = `users/${userId}/portfolios/${portfolioId}/${category}/${uniqueName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        userId,
        portfolioId,
        uploadedAt: new Date().toISOString(),
      },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err: unknown) {
    console.error("Firebase Storage upload error:", err);
    const message = err instanceof Error ? err.message : "Failed to upload file to storage.";
    throw new Error(`Upload failed: ${message}`);
  }
}

export async function deleteMediaFromStorage(fileUrl: string): Promise<void> {
  const storage = getClientStorage();
  if (!storage || !isFirebaseConfigured) return;

  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("Could not delete file from storage:", err);
  }
}
