/**
 * Media Storage Abstraction Adapter
 * 
 * Routes media handling through the no-cost media service,
 * supporting temporary in-memory previews and external hosted URLs.
 */
import {
  createTemporaryPreview,
  revokeTemporaryPreview,
  validateMediaUrl,
  validateLocalFile,
  isCloudStorageAvailable,
} from "../media/mediaService";

export async function uploadPortfolioMedia(
  file: File,
  userId?: string,
  portfolioId?: string,
  category: "avatars" | "profile" | "projects" | "resumes" | "resume" | "certificates" | "gallery" = "projects"
): Promise<string> {
  const isPdf = category === "resumes" || category === "resume";
  const preview = createTemporaryPreview(file, isPdf ? "pdf" : "image");
  return preview.previewUrl;
}

export {
  createTemporaryPreview,
  revokeTemporaryPreview,
  validateMediaUrl,
  validateLocalFile,
  isCloudStorageAvailable,
};
