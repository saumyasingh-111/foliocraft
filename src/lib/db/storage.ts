import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "../firebase/client";

export async function uploadPortfolioMedia(
  file: File,
  userId: string,
  portfolioId: string,
  category: "avatars" | "projects" | "resumes" | "gallery"
): Promise<string> {
  // Client validation
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB

  if (category === "resumes" && file.size > MAX_RESUME_SIZE) {
    throw new Error("Resume PDF file must be under 10MB.");
  } else if (category !== "resumes" && file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image file must be under 5MB.");
  }

  if (isFirebaseConfigured && storage) {
    try {
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `users/${userId}/portfolios/${portfolioId}/${category}/${Date.now()}_${sanitizedFilename}`;
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
      });
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn("Firebase storage error, falling back to data URL:", err);
    }
  }

  // Fallback to local Data URL for seamless client editing & demo
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
