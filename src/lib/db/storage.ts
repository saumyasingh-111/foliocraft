import { uploadMediaToStorage, UploadCategory } from "../firebase/storage";

export async function uploadPortfolioMedia(
  file: File,
  userId: string,
  portfolioId: string,
  category: "avatars" | "projects" | "resumes" | "gallery"
): Promise<string> {
  return await uploadMediaToStorage(file, userId, portfolioId, category as UploadCategory);
}
