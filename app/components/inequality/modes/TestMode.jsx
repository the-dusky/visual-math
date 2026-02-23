"use client";

import { useRef, useEffect } from "react";
import { useInequalityTest } from "../hooks/useInequalityTest";
import { NumberLine } from "../ui/NumberLine";
import { EquationDisplay } from "../../algebra/ui/Frac";
import { Celeb } from "../../algebra/ui/Celeb";
import { ActionBar } from "../../algebra/board/ActionBar";
import { INEQ_DISPLAY } from "../parser";

const FLIP_MAP = { ">": "<", "<": ">", ">=": "<=", "<=": ">=" };

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
  const s = useInequalityTest(level);
  const leftRef = useRef(null);

  useEffect(() => {
    if (!s.solved) leftRef.current?.focus();
  }, [s.workLines.length, s.solved]);

  function handleKey(e) {
    if (e.key === "Enter") s.tryIt();
  }

  return (
    <div className="relative flex gap-4">
      {/* Number line */}
      <NumberLine
        solved={s.solved}
        boundary={s.boxValue}
        inequality={s.solved ? s.ineqDir : s.inequality}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {s.showCeleb && <Celeb />}

        {/* Work history */}
        <div className="text-center mb-4 space-y-1">
          <EquationDisplay
            text={s.initialEq}
            size={20}
            colorClass={s.solved ? "text-ok" : undefined}
          />

          {s.workLines.map((line, i) =>
            line.type === "op" ? (
              <div key={i} className="flex items-end justify-center gap-6 font-mono text-text-muted text-[15px] font-bold">
                <OpNotation op={line.left.op} n={line.left.n} />
                <span className="pb-0.5">{s.ineqSym}</span>
                <OpNotation op={line.right.op} n={line.right.n} />
              </div>
            ) : line.type === "symbol" ? (
              <div key={i} className="flex items-center justify-center gap-2 text-[13px] font-bold">
                {line.flipped ? (
                  <span className="text-accent">
                    {line.from} &rarr; {line.to} (flipped!)
                  </span>
                ) : (
                  <span className="text-text-secondary">
                    {line.from} stays {line.to}
                  </span>
                )}
              </div>
            ) : (
              <EquationDisplay
                key={i}
                text={line.text}
                size={line.solved ? 22 : 18}
                equalsOverride={line.unbalanced ? "\u2260" : undefined}
                colorClass={line.solved ? "text-ok" : line.unbalanced ? "text-err" : line.pending ? "text-text-faint" : undefined}
              />
            )
          )}
        </div>

        {/* Input area */}
        {s.phase === "input" && (
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-raised border border-border mb-4">
            <div className="flex items-center gap-2">
              <input
                ref={leftRef}
                type="text"
                value={s.leftInput}
                onChange={(e) => s.setLeftInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder=""
                className="w-20 h-10 rounded-lg border border-border bg-surface text-text text-center text-sm font-bold font-mono outline-none px-2 focus:border-accent"
              />
              <span className="text-text-muted font-bold text-lg">{s.ineqSym}</span>
              <input
                type="text"
                value={s.rightInput}
                onChange={(e) => s.setRightInput(e.target.value)}
                onKeyDown={handleKey}
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

        {/* Choose inequality symbol */}
        {s.phase === "choose_symbol" && (
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-raised border border-border mb-4">
            <span className="text-[13px] text-text-secondary font-bold text-center">
              What happens to the inequality symbol?
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => s.chooseSymbol(false)}
                className="py-2.5 px-6 rounded-lg border-2 border-border bg-surface text-text-secondary font-extrabold cursor-pointer text-lg hover:border-accent hover:text-accent transition-colors"
              >
                Keep {s.ineqSym}
              </button>
              <button
                onClick={() => s.chooseSymbol(true)}
                className="py-2.5 px-6 rounded-lg border-2 border-border bg-surface text-text-secondary font-extrabold cursor-pointer text-lg hover:border-accent hover:text-accent transition-colors"
              >
                Flip to {INEQ_DISPLAY[FLIP_MAP[s.ineqDir]] || FLIP_MAP[s.ineqDir]}
              </button>
            </div>
            {s.symbolError && (
              <span className="text-[12px] text-err-text font-bold text-center">{s.symbolError}</span>
            )}
          </div>
        )}

        {/* Solved */}
        {s.solved && (
          <div className="text-center p-4 bg-ok/10 rounded-xl border border-ok-dim mb-4">
            <p className="text-xl font-extrabold text-ok-text m-0">
              {s.varName} {s.ineqSym} {s.boxValue}
            </p>
          </div>
        )}

        <ActionBar onReset={s.reset} onNext={onNext} showNext={s.solved && hasNext} />
      </div>
    </div>
  );
}
