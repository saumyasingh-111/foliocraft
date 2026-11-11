"use client";

import React, { useState, useEffect } from "react";
import { DynamicSection, DynamicSectionEntry, DynamicSectionField } from "@/themes/types";
import { MediaAssetControl } from "@/components/shared/MediaAssetControl";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Tag,
  AlertCircle,
  Check,
} from "lucide-react";

interface DynamicEntryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: DynamicSection;
  entry?: DynamicSectionEntry | null;
  onSave: (entry: DynamicSectionEntry) => void;
}

export function DynamicEntryEditorModal({
  isOpen,
  onClose,
  section,
  entry,
  onSave,
}: DynamicEntryEditorModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setFormData({ ...entry });
      } else {
        // Initialize empty entry with defaults
        const defaults: Record<string, any> = {
          id: `entry_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        };
        section.fields.forEach((f) => {
          if (f.type === "tags" || f.type === "multi-select") {
            defaults[f.id] = [];
          } else if (f.type === "image-gallery") {
            defaults[f.id] = [];
          } else if (f.type === "boolean") {
            defaults[f.id] = false;
          } else {
            defaults[f.id] = "";
          }
        });
        setFormData(defaults);
      }
      setErrors({});
      setTagInputs({});
    }
  }, [isOpen, entry, section]);

  if (!isOpen) return null;

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  // Tag helper
  const handleAddTag = (fieldId: string) => {
    const rawTag = (tagInputs[fieldId] || "").trim();
    if (!rawTag) return;
    const currentTags = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    if (!currentTags.includes(rawTag)) {
      currentTags.push(rawTag);
      handleChange(fieldId, currentTags);
    }
    setTagInputs((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleRemoveTag = (fieldId: string, tagToRemove: string) => {
    const currentTags = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    const updated = currentTags.filter((t) => t !== tagToRemove);
    handleChange(fieldId, updated);
  };

  // Gallery image helpers
  const handleAddGalleryImage = (fieldId: string, url: string) => {
    if (!url) return;
    const currentImages = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    currentImages.push(url);
    handleChange(fieldId, currentImages);
  };

  const handleRemoveGalleryImage = (fieldId: string, index: number) => {
    const currentImages = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    currentImages.splice(index, 1);
    handleChange(fieldId, currentImages);
  };

  const handleValidateAndSave = () => {
    const newErrors: Record<string, string> = {};

    section.fields.forEach((field) => {
      if (field.required) {
        const val = formData[field.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.id] = `${field.label} is required.`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData as DynamicSectionEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5 bg-neutral-900/80">
          <div>
            <h2 className="text-lg font-medium text-neutral-100">
              {entry ? "Edit Entry" : "Add Entry"}
            </h2>
            <p className="text-xs font-mono text-neutral-400">
              Section: {section.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {section.fields.map((field) => {
            const val = formData[field.id];
            const hasError = errors[field.id];

            return (
              <div key={field.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                  </label>
                  {field.description && (
                    <span className="text-[11px] text-neutral-400">
                      {field.description}
                    </span>
                  )}
                </div>

                {/* Render field by type */}
                {field.type === "text" && (
                  <input
                    type="text"
                    value={val || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className={`w-full rounded-lg bg-neutral-950 border px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 ${
                      hasError ? "border-rose-500 focus:ring-rose-500" : "border-neutral-800 focus:ring-amber-500"
                    }`}
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    rows={4}
                    value={val || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className={`w-full rounded-lg bg-neutral-950 border px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 ${
                      hasError ? "border-rose-500 focus:ring-rose-500" : "border-neutral-800 focus:ring-amber-500"
                    }`}
                  />
                )}

                {field.type === "number" && (
                  <input
                    type="number"
                    value={val ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={field.placeholder || "0"}
                    className={`w-full rounded-lg bg-neutral-950 border px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 ${
                      hasError ? "border-rose-500 focus:ring-rose-500" : "border-neutral-800 focus:ring-amber-500"
                    }`}
                  />
                )}

                {field.type === "date" && (
                  <div className="relative">
                    <input
                      type="date"
                      value={val || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className={`w-full rounded-lg bg-neutral-950 border px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-1 ${
                        hasError ? "border-rose-500 focus:ring-rose-500" : "border-neutral-800 focus:ring-amber-500"
                      }`}
                    />
                  </div>
                )}

                {field.type === "url" && (
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                    <input
                      type="url"
                      value={val || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder || "https://"}
                      className={`w-full rounded-lg bg-neutral-950 border pl-9 pr-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 ${
                        hasError ? "border-rose-500 focus:ring-rose-500" : "border-neutral-800 focus:ring-amber-500"
                      }`}
                    />
                  </div>
                )}

                {field.type === "email" && (
                  <input
                    type="email"
                    value={val || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || "contact@example.com"}
                    className={`w-full rounded-lg bg-neutral-950 border px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 ${
                      hasError ? "border-rose-500 focus:ring-rose-500" : "border-neutral-800 focus:ring-amber-500"
                    }`}
                  />
                )}

                {field.type === "location" && (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      value={val || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder || "e.g. San Francisco, CA"}
                      className={`w-full rounded-lg bg-neutral-950 border pl-9 pr-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 ${
                        hasError ? "border-rose-500 focus:ring-rose-500" : "border-neutral-800 focus:ring-amber-500"
                      }`}
                    />
                  </div>
                )}

                {field.type === "boolean" && (
                  <label className="flex items-center space-x-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => handleChange(field.id, e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-neutral-300">
                      {field.placeholder || "Enable / Active"}
                    </span>
                  </label>
                )}

                {field.type === "select" && (
                  <select
                    value={val || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full rounded-lg bg-neutral-950 border px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-1 ${
                      hasError ? "border-rose-500 focus:ring-rose-500" : "border-neutral-800 focus:ring-amber-500"
                    }`}
                  >
                    <option value="">Select an option...</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {(field.type === "tags" || field.type === "multi-select") && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInputs[field.id] || ""}
                        onChange={(e) => setTagInputs({ ...tagInputs, [field.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddTag(field.id);
                          }
                        }}
                        placeholder="Type and press Enter or comma..."
                        className="flex-1 rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(field.id)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-mono hover:bg-neutral-700 transition-colors"
                      >
                        Add Tag
                      </button>
                    </div>

                    {/* Tag chips */}
                    {Array.isArray(val) && val.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {val.map((tagItem: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1 rounded-md bg-neutral-800/80 px-2.5 py-1 text-xs font-mono text-neutral-200 border border-neutral-700/60"
                          >
                            <span>{tagItem}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(field.id, tagItem)}
                              className="text-neutral-400 hover:text-rose-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {field.type === "image" && (
                  <div className="pt-1">
                    <MediaAssetControl
                      label={field.label}
                      value={val || ""}
                      onChange={(newUrl) => handleChange(field.id, newUrl)}
                      type="image"
                      variant="cover"
                      placeholder={field.placeholder || "Enter image URL or select sample..."}
                      description={field.description}
                    />
                  </div>
                )}

                {field.type === "document" && (
                  <div className="pt-1">
                    <MediaAssetControl
                      label={field.label}
                      value={val || ""}
                      onChange={(newUrl) => handleChange(field.id, newUrl)}
                      type="pdf"
                      variant="document"
                      placeholder={field.placeholder || "Enter document link..."}
                      description={field.description}
                    />
                  </div>
                )}

                {field.type === "image-gallery" && (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap gap-3">
                      {(Array.isArray(val) ? val : []).map((imgUrl: string, gIdx: number) => (
                        <div key={gIdx} className="relative h-20 w-24 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 group">
                          <img src={imgUrl} alt={`gallery ${gIdx}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(field.id, gIdx)}
                            className="absolute top-1 right-1 rounded bg-black/70 p-1 text-neutral-300 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <MediaAssetControl
                      label={`Add image to ${field.label}`}
                      value=""
                      onChange={(newUrl) => {
                        if (newUrl) handleAddGalleryImage(field.id, newUrl);
                      }}
                      type="image"
                      variant="cover"
                      placeholder="Add another image URL to gallery..."
                    />
                  </div>
                )}

                {hasError && (
                  <p className="flex items-center space-x-1 text-xs text-rose-400 pt-0.5">
                    <AlertCircle className="h-3 w-3" />
                    <span>{hasError}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 border-t border-neutral-800 px-6 py-4 bg-neutral-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleValidateAndSave}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-amber-500 text-neutral-950 text-xs font-mono font-semibold uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
          >
            <Check className="h-4 w-4" />
            <span>Save Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
}
