"use client";
import { useState, useRef, useEffect } from "react";
import { PhotoUploader } from "./PhotoUploader";
import { formatDate } from "../constants";

export function EntryDetail({ entry, cls, onSave, onUpdatePhotos, onClose }) {
  const [text, setText] = useState(entry?.sentence || "");
  const textareaRef = useRef(null);

  useEffect(() => {
    setText(entry?.sentence || "");
  }, [entry]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [text]);

  function save() {
    const trimmed = text.trim();
    if (trimmed && trimmed !== entry?.sentence) {
      onSave(cls.id, trimmed, entry?.date);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ backgroundColor: "rgba(9, 9, 11, 0.92)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl mx-auto p-5 pt-4 pb-12 min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span
              className="block w-4 h-4 rounded-full"
              style={{ backgroundColor: cls?.color || "#71717a" }}
            />
            <span className="text-sm font-bold">{cls?.name}</span>
            <span className="text-xs text-text-faint">{entry?.date ? formatDate(entry.date) : "Today"}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center cursor-pointer border-none text-text-muted hover:text-text transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1L13 13M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Photos — full width */}
        {entry?.photos?.length > 0 && (
          <div className="space-y-3 mb-4">
            {entry.photos.map((url, i) => (
              <img
                key={url}
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-full rounded-xl object-contain max-h-[400px] bg-surface-overlay"
              />
            ))}
          </div>
        )}

        {/* Add more photos */}
        {onUpdatePhotos && (
          <div className="mb-4">
            <PhotoUploader
              photos={entry?.photos || []}
              onUpdate={(photos) => onUpdatePhotos(cls.id, photos)}
            />
          </div>
        )}

        {/* Sentence editor — no char limit */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          placeholder="What happened today?"
          rows={3}
          className="w-full rounded-xl border border-border bg-surface-raised text-text text-sm outline-none p-4 resize-none focus:border-border-strong leading-relaxed"
        />
      </div>
    </div>
  );
}
