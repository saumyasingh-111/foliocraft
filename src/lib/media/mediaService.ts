/**
 * FolioCraft Media Service Abstraction
 * 
 * Provides a decoupled media layer supporting:
 * 1. Externally hosted HTTPS URLs (permanent storage in Firestore)
 * 2. Temporary local session previews (via URL.createObjectURL)
 * 3. Pluggable Cloud Storage Provider interface (for future Firebase Storage / S3 / Cloudinary upgrades)
 */

export interface StorageProvider {
  name: string;
  isAvailable(): boolean;
  upload(file: File, path: string, onProgress?: (percent: number) => void): Promise<string>;
  delete(path: string): Promise<void>;
}

export type MediaCategory =
  | "profile"
  | "avatars"
  | "projects"
  | "resume"
  | "resumes"
  | "certificates"
  | "gallery";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export interface TemporaryPreview {
  previewUrl: string;
  filename: string;
  sizeFormatted: string;
  isTemporary: true;
}

const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

// Track created object URLs so they can be cleaned up on demand
const activeObjectUrls = new Set<string>();

/**
 * Validates whether an external URL is a safe, usable HTTPS web resource.
 * Rejects unsafe schemes (javascript:, data: for permanent storage, file:).
 */
export function validateMediaUrl(url: string, type: "image" | "pdf" = "image"): ValidationResult {
  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: false, error: "URL cannot be empty." };
  }

  // Reject unsafe schemes
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("vbscript:") || lower.startsWith("file:")) {
    return { valid: false, error: "Unsafe URL scheme detected." };
  }

  // Prevent giant base64 data URLs from being saved in Firestore documents
  if (lower.startsWith("data:")) {
    return {
      valid: false,
      error: "Data URLs (base64) are not supported for persistent storage to preserve database performance. Please use an HTTPS image URL.",
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { valid: false, error: "URL must start with https:// (or http://)." };
    }

    if (type === "pdf") {
      // For PDFs, verify extension or common document hosts
      const isPdfExtension = parsed.pathname.toLowerCase().endsWith(".pdf");
      const isCommonDocHost =
        parsed.hostname.includes("drive.google.com") ||
        parsed.hostname.includes("dropbox.com") ||
        parsed.hostname.includes("github.com") ||
        parsed.hostname.includes("notion.so") ||
        parsed.hostname.includes("onedrive.live.com");

      if (!isPdfExtension && !isCommonDocHost) {
        // Warning-level allowance, but valid URL
        return { valid: true, normalizedUrl: trimmed };
      }
    }

    return { valid: true, normalizedUrl: trimmed };
  } catch {
    return { valid: false, error: "Please enter a valid, complete URL (e.g. https://images.unsplash.com/...)" };
  }
}

/**
 * Validates a local file selected from user's filesystem
 */
export function validateLocalFile(file: File, type: "image" | "pdf" = "image"): ValidationResult {
  if (type === "pdf") {
    const isPdfType = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfType) {
      return { valid: false, error: "Invalid document format. Please select a PDF file (.pdf)." };
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      return { valid: false, error: "PDF exceeds the 10 MB size limit." };
    }
  } else {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const isAllowedMime = ALLOWED_IMAGE_MIME.includes(file.type);
    const isAllowedExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

    if (!isAllowedMime && !isAllowedExt) {
      return {
        valid: false,
        error: "Invalid image format. Supported formats: JPG, PNG, WebP, GIF, SVG.",
      };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: "Image file exceeds the 5 MB size limit." };
    }
  }

  return { valid: true };
}

/**
 * Creates a temporary browser Object URL for in-memory session preview.
 * Reminds users that this preview is temporary and does not persist across reloads.
 */
export function createTemporaryPreview(file: File, type: "image" | "pdf" = "image"): TemporaryPreview {
  const validation = validateLocalFile(file, type);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid file");
  }

  if (typeof window === "undefined" || !window.URL) {
    throw new Error("Local file preview is only available in browser environments.");
  }

  const previewUrl = window.URL.createObjectURL(file);
  activeObjectUrls.add(previewUrl);

  const sizeFormatted =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

  return {
    previewUrl,
    filename: file.name,
    sizeFormatted,
    isTemporary: true,
  };
}

/**
 * Revokes a temporary Object URL to prevent browser memory leaks
 */
export function revokeTemporaryPreview(previewUrl: string): void {
  if (typeof window !== "undefined" && window.URL && previewUrl.startsWith("blob:")) {
    try {
      window.URL.revokeObjectURL(previewUrl);
      activeObjectUrls.delete(previewUrl);
    } catch {
      // Ignore revocation errors
    }
  }
}

/**
 * Checks if a given URL is a temporary browser session blob
 */
export function isTemporaryBlobUrl(url?: string | null): boolean {
  return Boolean(url && url.startsWith("blob:"));
}

/**
 * Checks if a given URL is a permanent embedded Data URI
 */
export function isPermanentDataUri(url?: string | null): boolean {
  return Boolean(url && url.startsWith("data:image/"));
}

/**
 * Compresses and resizes a local image file into an optimized, permanent Data URI
 * that persists directly in Firestore without reliance on temporary browser session blobs.
 * 
 * Standardizes avatar/project images to max 600x600px, WebP format (or JPEG fallback),
 * maintaining sharp high-DPI quality while keeping document payloads under ~50 KB.
 */
export async function processLocalImageForStorage(
  file: File,
  maxDimension = 600,
  quality = 0.82
): Promise<string> {
  const validation = validateLocalFile(file, "image");
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid image file");
  }

  if (typeof window === "undefined" || !window.FileReader) {
    throw new Error("Local image processing is only available in the browser.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read local image file."));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        return reject(new Error("Image source could not be resolved."));
      }

      if (file.type === "image/svg+xml") {
        if (src.length > 80_000) {
          return reject(new Error("SVG file is too large. Please select an SVG under 80KB."));
        }
        return resolve(src);
      }

      const img = new Image();
      img.onerror = () => reject(new Error("Image decoding failed."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to initialize image canvas context."));
        }

        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Cap size to safeguard Firestore 1MB limits
        if (dataUrl.length > 95_000) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.65);
        }

        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Pluggable Storage Provider Registry
 * Allows easily registering Firebase Storage (when Blaze is enabled) or Cloudinary/S3
 * without touching component code.
 */
let activeProvider: StorageProvider | null = null;

export function registerStorageProvider(provider: StorageProvider): void {
  activeProvider = provider;
}

export function isCloudStorageAvailable(): boolean {
  return activeProvider !== null && activeProvider.isAvailable();
}

export function getActiveStorageProviderName(): string {
  return activeProvider?.name || "External URL (No-Cost Hosted Mode)";
}
