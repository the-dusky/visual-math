"use client";
import { useRef, useState } from "react";
import { MAX_PHOTOS } from "../constants";
import { compressImage } from "../utils/compressImage";

export function PhotoUploader({ photos = [], onUpdate }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", compressed);

      const res = await fetch("/api/story/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      onUpdate([...photos, url]);
    } catch (err) {
      console.error("Photo upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index) {
    onUpdate(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mt-2">
      {/* Thumbnails */}
      {photos.map((url, i) => (
        <div key={url} className="relative group">
          <img
            src={url}
            alt={`Photo ${i + 1}`}
            className="w-16 h-16 rounded-lg object-cover border border-border"
          />
          <button
            onClick={() => removePhoto(i)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
            aria-label="Remove photo"
          >
            ×
          </button>
        </div>
      ))}

      {/* Add button */}
      {photos.length < MAX_PHOTOS && (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-16 h-16 rounded-lg border-2 border-dashed border-border-strong flex items-center justify-center cursor-pointer bg-transparent hover:border-action transition-colors disabled:opacity-50"
            aria-label="Add photo"
          >
            {uploading ? (
              <span className="text-xs text-text-faint">...</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
