"use client";

export function ClassPill({ label, color, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded-lg border font-bold cursor-pointer text-xs whitespace-nowrap transition-colors ${
        selected
          ? "border-transparent text-surface"
          : "bg-surface-raised border-border text-text-muted hover:text-text-secondary"
      }`}
      style={selected ? { backgroundColor: color || "#8b5cf6" } : undefined}
    >
      {label}
    </button>
  );
}
