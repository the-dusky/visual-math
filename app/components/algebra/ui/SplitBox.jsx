"use client";

import { Pill } from "./Pill";

export function SplitBox({ count, greyed }) {
  return (
    <div
      className={`min-w-[46px] p-2 rounded-lg flex flex-col items-center gap-1 border transition-opacity duration-400
        ${greyed
          ? "bg-surface/50 border-border opacity-30"
          : "bg-surface-raised border-border-strong"
        }`}
    >
      <div className="flex gap-1 flex-wrap justify-center max-w-[70px]">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <Pill key={i} small />
          ))}
      </div>
      <span className="text-xs font-bold text-text font-mono">{count}</span>
    </div>
  );
}
