"use client";

export function MsgBar({ solved, message }) {
  if (!message) return null;

  return (
    <div
      className={`text-center px-4 py-3 rounded-xl border mb-4
        ${solved
          ? "bg-ok/10 border-ok-dim"
          : "bg-surface-raised border-border"
        }`}
    >
      <p
        className={`m-0 ${solved ? "text-lg font-extrabold text-ok-text" : "text-[13px] font-medium text-text-secondary"}`}
      >
        {solved ? "\ud83c\udf89 " : "\ud83d\udca1 "}{message}
      </p>
    </div>
  );
}
