"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  validateMediaUrl,
  createTemporaryPreview,
  revokeTemporaryPreview,
  isTemporaryBlobUrl,
  isPermanentDataUri,
  processLocalImageForStorage,
} from "@/lib/media/mediaService";
import {
  Link as LinkIcon,
  Upload,
  AlertTriangle,
  Check,
  X,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export interface MediaAssetControlProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  type?: "image" | "pdf";
  placeholder?: string;
  description?: string;
  variant?: "avatar" | "cover" | "document";
}

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
];

const SAMPLE_PROJECT_COVERS = [
  "https://images.unsplash.com/photo-1507842229451-7f01be7ff612?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
];

export function MediaAssetControl({
  label,
  value = "",
  onChange,
  type = "image",
  placeholder,
  description,
  variant = "cover",
}: MediaAssetControlProps) {
  const [activeMode, setActiveMode] = useState<"url" | "local">("url");
  const [inputUrl, setInputUrl] = useState(() => (value && !value.startsWith("data:") ? value : ""));
  const [urlError, setUrlError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const previousBlobRef = useRef<string | null>(null);

  const isCurrentTemporary = isTemporaryBlobUrl(value);
  const isPermanentEmbedded = isPermanentDataUri(value);

  // Sync internal input when external value prop changes
  useEffect(() => {
    if (value && !value.startsWith("data:") && !value.startsWith("blob:")) {
      setInputUrl(value);
    } else if (!value) {
      setInputUrl("");
    }
    setImageLoadError(false);
  }, [value]);

  // Clean up blob when component unmounts
  useEffect(() => {
    return () => {
      if (previousBlobRef.current) {
        revokeTemporaryPreview(previousBlobRef.current);
      }
    };
  }, []);

  const handleApplyUrl = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      setUrlError(null);
      setImageLoadError(false);
      onChange("");
      return;
    }

    const validation = validateMediaUrl(trimmed, type);
    if (!validation.valid) {
      setUrlError(validation.error || "Invalid URL");
      return;
    }

    setUrlError(null);
    setImageLoadError(false);
    if (previousBlobRef.current) {
      revokeTemporaryPreview(previousBlobRef.current);
      previousBlobRef.current = null;
    }
    onChange(validation.normalizedUrl || trimmed);
  };

  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image") {
      setIsProcessing(true);
      setUrlError(null);
      try {
        if (previousBlobRef.current) {
          revokeTemporaryPreview(previousBlobRef.current);
          previousBlobRef.current = null;
        }
        const permanentDataUri = await processLocalImageForStorage(file, variant === "avatar" ? 500 : 900);
        setImageLoadError(false);
        onChange(permanentDataUri);
      } catch (err: unknown) {
        console.error("Image processing error:", err);
        setUrlError(err instanceof Error ? err.message : "Failed to process image file.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // PDF document
      try {
        if (previousBlobRef.current) {
          revokeTemporaryPreview(previousBlobRef.current);
        }
        const preview = createTemporaryPreview(file, type);
        previousBlobRef.current = preview.previewUrl;
        setImageLoadError(false);
        setUrlError(null);
        onChange(preview.previewUrl);
      } catch (err: unknown) {
        setUrlError(err instanceof Error ? err.message : "Failed to load local file preview.");
      }
    }
  };

  const handleClear = () => {
    if (previousBlobRef.current) {
      revokeTemporaryPreview(previousBlobRef.current);
      previousBlobRef.current = null;
    }
    setInputUrl("");
    setUrlError(null);
    setImageLoadError(false);
    onChange("");
  };

  return (
    <div className="border border-editorial-border bg-editorial-ivory/30 p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-semibold">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-editorial-muted mt-0.5">{description}</p>
          )}
        </div>

        {/* Status Badge */}
        {value ? (
          isPermanentEmbedded ? (
            <span className="inline-flex items-center space-x-1 border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800 uppercase tracking-wider">
              <Check className="h-3 w-3 text-emerald-600" />
              <span>Permanent Upload</span>
            </span>
          ) : isCurrentTemporary ? (
            <span className="inline-flex items-center space-x-1 border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-800 uppercase tracking-wider">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              <span>Session Preview</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800 uppercase tracking-wider">
              <Check className="h-3 w-3 text-emerald-600" />
              <span>Saved (Hosted URL)</span>
            </span>
          )
        ) : null}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-1 border-b border-editorial-border/60 pb-2">
        <button
          type="button"
          onClick={() => setActiveMode("local")}
          className={`inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-mono uppercase transition-colors ${
            activeMode === "local"
              ? "bg-editorial-charcoal text-editorial-ivory font-medium"
              : "text-editorial-muted hover:text-editorial-charcoal"
          }`}
        >
          <Upload className="h-3 w-3" />
          <span>Upload From Device</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("url")}
          className={`inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-mono uppercase transition-colors ${
            activeMode === "url"
              ? "bg-editorial-charcoal text-editorial-ivory font-medium"
              : "text-editorial-muted hover:text-editorial-charcoal"
          }`}
        >
          <LinkIcon className="h-3 w-3" />
          <span>Hosted URL Link</span>
        </button>
      </div>

      {/* MODE 1: Hosted URL */}
      {activeMode === "url" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                handleApplyUrl(e.target.value);
              }}
              placeholder={
                placeholder ||
                (type === "pdf"
                  ? "https://your-domain.com/resume.pdf or Google Drive link"
                  : "https://images.unsplash.com/... or Imgur/Cloudinary URL")
              }
              className="flex-grow border border-editorial-border bg-white px-3 py-2 text-xs font-mono text-editorial-charcoal placeholder:text-editorial-sand focus:border-editorial-charcoal focus:outline-none"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear Media"
                className="p-2 border border-editorial-border bg-white text-editorial-muted hover:text-editorial-charcoal hover:bg-editorial-sand/20 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-editorial-muted gap-2">
            <span>
              Supported: Unsplash, Imgur, Cloudinary, GitHub, Google Drive public link.
            </span>
            {type === "image" && (
              <button
                type="button"
                onClick={() => setShowSamples(!showSamples)}
                className="text-editorial-mocha hover:underline font-mono inline-flex items-center space-x-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>{showSamples ? "Hide Sample URLs" : "Use Sample URL"}</span>
              </button>
            )}
          </div>

          {/* Quick Sample Presets */}
          {showSamples && type === "image" && (
            <div className="border border-editorial-border bg-white p-2.5 space-y-1.5 animate-fade-in">
              <span className="text-[10px] font-mono uppercase text-editorial-muted block">
                Click to insert curated sample:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(variant === "avatar" ? SAMPLE_AVATARS : SAMPLE_PROJECT_COVERS).map((sUrl, idx) => (
                  <button
                    key={sUrl}
                    type="button"
                    onClick={() => {
                      setInputUrl(sUrl);
                      handleApplyUrl(sUrl);
                      setShowSamples(false);
                    }}
                    className="border border-editorial-border px-2 py-1 text-[10px] font-mono bg-editorial-ivory hover:bg-editorial-sand/40 text-editorial-charcoal transition-colors"
                  >
                    Sample #{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Device Upload */}
      {activeMode === "local" && (
        <div className="space-y-2.5">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-editorial-border bg-white p-5 cursor-pointer hover:bg-editorial-sand/20 transition-colors">
            {isProcessing ? (
              <div className="flex flex-col items-center py-2 space-y-2">
                <div className="h-6 w-6 border-2 border-editorial-charcoal border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono uppercase text-editorial-muted">Optimizing & preparing photo...</span>
              </div>
            ) : (
              <>
                <Upload className="h-5 w-5 text-editorial-mocha mb-1" />
                <span className="text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-semibold">
                  Select {type === "pdf" ? "PDF Document" : "Photo"} From Device
                </span>
                <span className="text-[11px] text-editorial-muted mt-0.5">
                  {type === "pdf" ? "PDF up to 10MB" : "JPG, PNG, WebP up to 10MB"}
                </span>
              </>
            )}
            <input
              type="file"
              accept={type === "pdf" ? "application/pdf,.pdf" : "image/*"}
              onChange={handleLocalFileSelect}
              disabled={isProcessing}
              className="hidden"
            />
          </label>

          {type === "image" ? (
            <p className="text-[11px] text-editorial-muted font-sans leading-relaxed">
              Photos uploaded from your device are automatically optimized and permanently embedded into your portfolio.
            </p>
          ) : (
            <div className="flex items-start space-x-2 border border-amber-300 bg-amber-50/80 p-2.5 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-800">
                To allow visitors to download your full resume PDF, provide a hosted document link (Google Drive, Dropbox, Notion, or personal site) in the <em>Hosted URL Link</em> tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL / File Validation Error Message */}
      {urlError && (
        <div className="flex items-center space-x-1.5 text-xs text-red-600 font-mono">
          <X className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{urlError}</span>
        </div>
      )}

      {/* Visual Preview Area */}
      {value && (
        <div className="pt-2 border-t border-editorial-border/60">
          <div className="flex items-center justify-between text-[11px] font-mono text-editorial-muted mb-1.5">
            <span>Current Asset Preview:</span>
            {value.startsWith("http") && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-editorial-mocha hover:underline"
              >
                <span>Open in Tab</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>

          {type === "image" ? (
            <div
              className={`relative overflow-hidden border border-editorial-border bg-editorial-ivory flex items-center justify-center ${
                variant === "avatar"
                  ? "h-20 w-20 rounded-full"
                  : "h-32 w-full max-w-sm rounded-none"
              }`}
            >
              {imageLoadError ? (
                <div className="p-3 text-center space-y-1">
                  <ImageIcon className="h-6 w-6 text-red-400 mx-auto" />
                  <span className="text-[10px] font-mono text-red-600 block">
                    Failed to load image from URL
                  </span>
                </div>
              ) : (
                <img
                  src={value}
                  alt={label}
                  onError={() => setImageLoadError(true)}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3 border border-editorial-border bg-white p-3">
              <FileText className="h-6 w-6 text-editorial-mocha flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <span className="text-xs font-mono font-medium text-editorial-charcoal block truncate">
                  {value}
                </span>
                <span className="text-[10px] text-editorial-muted font-mono block">
                  PDF Resume Attached
                </span>
              </div>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 border border-editorial-charcoal bg-editorial-charcoal px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors flex-shrink-0"
              >
                <span>Test Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
