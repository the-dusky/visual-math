"use client";

import { useRef, useEffect } from "react";
import { useDistributionTest } from "../hooks/useDistributionTest";
import { EquationDisplay } from "../../algebra/ui/Frac";
import { Celeb } from "../../algebra/ui/Celeb";
import { ActionBar } from "../../algebra/board/ActionBar";
import { levelDistEq } from "../parser";

function OpNotation({ op, n }) {
  if (op === "÷") {
    return (
      <span className="inline-flex flex-col items-center leading-none">
        <span className="w-full border-t border-text-muted" />
        <span className="text-[15px] px-1">{n}</span>
      </span>
    );
  }
  const sym = { "+": "+", "−": "−", "×": "×" };
  return <span>{sym[op] || op}{n}</span>;
}

export function TestMode({ level, onNext, hasNext }) {
  const s = useDistributionTest(level);
  const distRef = useRef(null);
  const leftRef = useRef(null);

  useEffect(() => {
    if (s.phase === "distribute") distRef.current?.focus();
    else if (s.phase === "input") leftRef.current?.focus();
  }, [s.phase, s.workLines.length]);

  const distEqStr = levelDistEq(level);

  return (
    <div className="relative">
      {s.showCeleb && <Celeb />}

      {/* Work history */}
      <div className="text-center mb-4 space-y-1">
        <EquationDisplay
          text={distEqStr}
          size={20}
          colorClass={s.solved ? "text-ok" : undefined}
        />

        {s.workLines.map((line, i) =>
          line.type === "distribute" ? (
            <div key={i} className="text-[12px] text-action font-bold">
              {line.text}
            </div>
          ) : line.type === "op" ? (
            <div key={i} className="flex items-end justify-center gap-6 font-mono text-text-muted text-[15px] font-bold">
              <OpNotation op={line.left.op} n={line.left.n} />
              <span className="pb-0.5">=</span>
              <OpNotation op={line.right.op} n={line.right.n} />
            </div>
          ) : (
            <EquationDisplay
              key={i}
              text={line.text}
              size={line.solved ? 22 : 18}
              equalsOverride={line.unbalanced ? "\u2260" : undefined}
              colorClass={line.solved ? "text-ok" : line.unbalanced ? "text-err" : undefined}
            />
          )
        )}
      </div>

      {/* Distribution input */}
      {s.phase === "distribute" && (
        <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-raised border border-border mb-4">
          <span className="text-[13px] text-text-secondary font-bold">
            Distribute the {level.multiplier} &mdash; what do you get?
          </span>
          <input
            ref={distRef}
            type="text"
            value={s.distInput}
            onChange={(e) => s.setDistInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") s.tryDistribute(); }}
            placeholder={`e.g. ${level.multiplier * level.innerBoxes}${level.variable || "x"}+...=${level.rightPills}`}
            className="w-48 h-10 rounded-lg border border-border bg-surface text-text text-center text-sm font-bold font-mono outline-none px-2 focus:border-accent"
          />
          <button
            onClick={s.tryDistribute}
            className="py-2.5 px-6 rounded-lg border-none bg-action text-white font-bold cursor-pointer text-sm hover:bg-action-dim transition-colors"
          >
            Distribute &rarr;
          </button>
          {s.distError && (
            <span className="text-[11px] text-err-text text-center">{s.distError}</span>
          )}
        </div>
      )}

      {/* Standard equation input */}
      {s.phase === "input" && (
        <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-raised border border-border mb-4">
          <div className="flex items-center gap-2">
            <input
              ref={leftRef}
              type="text"
              value={s.leftInput}
              onChange={(e) => s.setLeftInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") s.tryIt(); }}
              placeholder=""
              className="w-20 h-10 rounded-lg border border-border bg-surface text-text text-center text-sm font-bold font-mono outline-none px-2 focus:border-accent"
            />
            <span className="text-text-muted font-bold text-lg">=</span>
            <input
              type="text"
              value={s.rightInput}
              onChange={(e) => s.setRightInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") s.tryIt(); }}
              placeholder=""
              className="w-20 h-10 rounded-lg border border-border bg-surface text-text text-center text-sm font-bold font-mono outline-none px-2 focus:border-accent"
            />
          </div>
          <button
            onClick={s.tryIt}
            className="py-2.5 px-6 rounded-lg border-none bg-cta text-surface font-bold cursor-pointer text-sm hover:bg-cta-hover transition-colors"
          >
            Try it out &rarr;
          </button>
          {s.error && (
            <span className="text-[11px] text-err-text text-center">{s.error}</span>
          )}
        </div>
      )}

      {/* Solved */}
      {s.solved && (
        <div className="text-center p-4 bg-ok/10 rounded-xl border border-ok-dim mb-4">
          <p className="text-xl font-extrabold text-ok-text m-0">
            {s.varName} = {s.boxValue}
          </p>
        </div>
      )}

      <ActionBar onReset={s.reset} onNext={onNext} showNext={s.solved && hasNext} />
    </div>
  );
}
