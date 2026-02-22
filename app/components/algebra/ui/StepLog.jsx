"use client";

export function StepLog({ steps }) {
  return (
    <div className="bg-surface-raised rounded-xl border border-border p-4 mb-4">
      <div className="uppercase tracking-widest text-text-muted font-medium text-[10px] mb-2">
        Steps
      </div>
      {steps.length === 0 && (
        <div className="text-[11px] text-text-faint italic">Your moves appear here</div>
      )}
      {steps.map((s, i) => {
        const isFinal = s.includes("=") && !s.includes("both");
        return (
          <div key={i} className="flex items-center gap-3 mb-1">
            <div
              className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0
                ${isFinal
                  ? "bg-ok border-ok-dim text-surface"
                  : "bg-surface-overlay border-border-strong text-text-faint"
                }`}
            >
              {isFinal ? "\u2605" : i + 1}
            </div>
            <span
              className={`font-mono ${isFinal ? "text-[15px] font-extrabold text-ok-text" : "text-[13px] font-semibold text-text-secondary"}`}
            >
              {s}
            </span>
          </div>
        );
      })}
    </div>
  );
}
