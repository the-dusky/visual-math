"use client";

import { useState, useEffect, useRef } from "react";

const OPS = ["\u2212", "+", "\u00d7", "\u00f7"];

export function OpPicker({ active, locked, lockedOp, lockedNum, onSubmit, label }) {
  const [op, setOp] = useState(null);
  const [num, setNum] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (active && op && inputRef.current) inputRef.current.focus();
  }, [active, op]);

  if (locked) {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <span className="text-[13px] text-text-secondary font-bold font-mono">
          {lockedOp}{lockedNum}
        </span>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="py-2 text-center">
        <span className="text-[10px] text-text-faint">{label}</span>
      </div>
    );
  }

  function go() {
    const n = parseFloat(num);
    if (!op || isNaN(n) || n === 0) return;
    onSubmit(op, n);
  }

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <span className="uppercase tracking-widest text-text-muted font-medium text-[10px]">{label}</span>
      <div className="flex items-center gap-1">
        {OPS.map((o) => (
          <button
            key={o}
            onClick={() => setOp(o)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border text-[15px] font-extrabold cursor-pointer transition-colors
              ${op === o
                ? "bg-accent border-accent-dim text-surface"
                : "bg-surface-raised border-border text-text-muted hover:text-text-secondary"
              }`}
          >
            {o}
          </button>
        ))}
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") go(); }}
          onWheel={(e) => e.target.blur()}
          placeholder="?"
          className="w-11 h-9 sm:h-10 rounded-lg border border-border bg-surface text-accent text-[15px] font-extrabold text-center font-mono outline-none focus:border-border-strong [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
        />
        <button
          onClick={go}
          className="px-4 py-2 rounded-lg border-none bg-action text-white font-bold cursor-pointer text-xs hover:bg-action-dim transition-colors"
        >
          Go
        </button>
      </div>
    </div>
  );
}
