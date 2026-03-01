"use client";
import { useState, useRef, useEffect } from "react";
import { MAX_SENTENCE_LENGTH } from "../constants";

export function ClassCard({ cls, entry, onSave }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry?.sentence || "");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef(null);
  const completed = !!entry?.sentence;

  useEffect(() => {
    setText(entry?.sentence || "");
  }, [entry]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  function save() {
    const trimmed = text.trim();
    if (trimmed) {
      onSave(cls.id, trimmed);
      setSaved(true);
      setTimeout(() => setSaved(false), 600);
    }
    setEditing(false);
  }

  const showInput = editing || !completed;

  return (
    <div
      className={`bg-surface-raised border rounded-xl p-4 transition-colors ${
        saved ? "border-ok" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Color dot + check */}
        <div className="flex-shrink-0 mt-0.5 relative">
          <span
            className="block w-5 h-5 rounded-full"
            style={{ backgroundColor: cls.color }}
          />
          {completed && !editing && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-ok flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-1">{cls.name}</p>

          {showInput ? (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_SENTENCE_LENGTH))}
                onKeyDown={(e) => { if (e.key === "Enter") save(); }}
                onBlur={save}
                placeholder={`What happened in ${cls.name} today?`}
                maxLength={MAX_SENTENCE_LENGTH}
                className="w-full h-9 rounded-lg border border-border bg-surface text-text text-sm outline-none px-3 focus:border-border-strong"
              />
              <p className="text-[11px] text-text-faint text-right mt-1">
                {text.length}/{MAX_SENTENCE_LENGTH}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-text-secondary bg-transparent border-none cursor-pointer text-left p-0 hover:text-text transition-colors w-full"
            >
              {entry.sentence}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
