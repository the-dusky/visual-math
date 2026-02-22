"use client";

export function EquationBoard({ leftContent, rightContent, hasError, isSolved, equalsSymbol = "=" }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-3 mb-4">
      {/* Left side */}
      <div
        className={`flex-1 rounded-xl p-4 border flex flex-col items-center gap-3 overflow-visible transition-all duration-300
          ${hasError
            ? "bg-err-bg border-err-dim"
            : isSolved
              ? "bg-ok/5 border-ok-dim"
              : "bg-surface-raised border-border"
          }`}
      >
        <span className="uppercase tracking-widest text-text-muted font-medium text-[10px]">Left</span>
        {leftContent}
      </div>

      {/* Equals sign */}
      <div
        className={`flex items-center justify-center text-3xl font-black select-none shrink-0 transition-colors duration-300
          ${hasError ? "text-err" : isSolved ? "text-ok" : "text-text-faint"}`}
      >
        {equalsSymbol}
      </div>

      {/* Right side */}
      <div
        className={`flex-1 rounded-xl p-4 border flex flex-col items-center gap-3 overflow-visible transition-all duration-300
          ${hasError
            ? "bg-err-bg border-err-dim"
            : isSolved
              ? "bg-ok/5 border-ok-dim"
              : "bg-surface-raised border-border"
          }`}
      >
        <span className="uppercase tracking-widest text-text-muted font-medium text-[10px]">Right</span>
        {rightContent}
      </div>
    </div>
  );
}
