"use client";

import { useRef, useEffect } from "react";
import { useAdvancedDistributionTest } from "../hooks/useAdvancedDistributionTest";
import { ActionBar } from "../../algebra/board/ActionBar";
import { Celeb } from "../../algebra/ui/Celeb";
import { levelToString } from "../parser";
import { getTermColor } from "../colors";

const fmt = (n) => {
  const abs = Math.abs(n);
  return Number.isInteger(abs) ? String(abs) : parseFloat(abs.toFixed(4)).toString();
};

export function TestMode({ level, onNext, hasNext }) {
  const s = useAdvancedDistributionTest(level);
  const inputRef = useRef(null);

  useEffect(() => {
    if (s.phase === "input") inputRef.current?.focus();
  }, [s.phase]);

  return (
    <div className="relative">
      {s.showCeleb && <Celeb />}

      {/* Source expression */}
      <div className="text-center mb-4">
        <span className="text-xl font-extrabold font-mono text-text">
          {levelToString(level)}
        </span>
      </div>

      {s.phase === "input" && (
        <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-raised border border-border mb-4">
          <span className="text-[13px] text-text-secondary font-bold">
            Distribute the {level.multiplier} &mdash; what do you get?
          </span>
          <input
            ref={inputRef}
            type="text"
            value={s.input}
            onChange={(e) => s.setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") s.trySubmit(); }}
            placeholder="e.g. 6x + 8"
            className="w-64 h-10 rounded-lg border border-border bg-surface text-text text-center text-sm font-bold font-mono outline-none px-2 focus:border-accent"
          />
          <button
            onClick={s.trySubmit}
            className="py-2.5 px-6 rounded-lg border-none bg-action text-white font-bold cursor-pointer text-sm hover:bg-action-dim transition-colors"
          >
            Check &rarr;
          </button>
          {s.error && (
            <span className="text-[11px] text-err-text text-center">{s.error}</span>
          )}
        </div>
      )}

      {s.phase === "done" && (
        <div className="text-center p-4 bg-ok/10 rounded-xl border border-ok-dim mb-4">
          <p className="text-lg font-extrabold font-mono m-0">
            {s.resultTerms.map((t, i) => {
              const color = getTermColor(t.variable);
              const absCoeff = Math.abs(t.coeff);
              const isFirst = i === 0;
              const sign = t.coeff < 0 ? " − " : (isFirst ? "" : " + ");
              const label = t.variable
                ? (absCoeff === 1 ? t.variable : `${fmt(absCoeff)}${t.variable}`)
                : fmt(absCoeff);
              return (
                <span key={i} className={color.text}>
                  {sign}{label}
                </span>
              );
            })}
          </p>
        </div>
      )}

      <ActionBar onReset={s.reset} onNext={onNext} showNext={s.phase === "done" && hasNext} />
    </div>
  );
}
