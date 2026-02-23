"use client";

import Link from "next/link";
import { levelEq } from "../parser";

export function LevelSelector({
  levels, levelIdx, onSelect, customInput, onCustomChange,
  onCustomSubmit, customError, mode, onModeChange,
}) {
  return (
    <div className="text-center mb-5">
      <Link
        href="/"
        className="text-text-muted hover:text-text text-sm no-underline mb-3 inline-block"
      >
        &larr; Back to lessons
      </Link>
      <h1 className="text-xl sm:text-2xl font-extrabold mb-1 text-accent">
        Equations
      </h1>
      <p className="text-xs text-text-muted mb-4">What&apos;s hiding in the box?</p>

      {/* Mode toggle */}
      <div className="inline-flex rounded-lg overflow-hidden border border-border mb-4">
        {[
          ["explore", "Box Mode"],
          ["solve", "Test Mode"],
        ].map(([m, label]) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`py-2.5 px-6 sm:px-8 border-none font-bold cursor-pointer text-sm transition-colors
              ${mode === m
                ? "bg-action text-white"
                : "bg-transparent text-text-muted hover:text-text-secondary"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom equation input */}
      <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
        <input
          type="text"
          value={customInput}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onCustomSubmit(); }}
          placeholder="Type: 3x+4=19, n/5=3"
          className="w-[210px] h-10 rounded-lg border border-border bg-surface text-text text-[13px] font-semibold text-center font-mono outline-none px-3 focus:border-border-strong"
        />
        <button
          onClick={onCustomSubmit}
          className="px-4 py-2.5 rounded-lg border-none bg-ok text-surface font-bold cursor-pointer text-sm hover:bg-ok-dim transition-colors"
        >
          Build &rarr;
        </button>
      </div>
      {customError && (
        <p className="text-[11px] text-err-text mb-2">{customError}</p>
      )}

      {/* Level pills */}
      <div className="flex gap-1.5 justify-center flex-wrap max-w-full px-2">
        {levels.map((l, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`py-2 px-4 rounded-lg border font-bold cursor-pointer text-[11px] font-mono transition-colors
              ${i === levelIdx
                ? "bg-accent border-accent-dim text-surface"
                : "bg-surface-raised border-border text-text-muted hover:text-text-secondary"
              }`}
          >
            {levelEq(l)}
          </button>
        ))}
      </div>
    </div>
  );
}
