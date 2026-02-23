"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useInequalityExplore } from "../hooks/useInequalityExplore";
import { NumberLine } from "../ui/NumberLine";
import { EquationBoard } from "../../algebra/board/EquationBoard";
import { BoxGrid } from "../../algebra/board/BoxGrid";
import { ActionBar } from "../../algebra/board/ActionBar";
import { PillGroup } from "../../algebra/ui/Pill";
import { EquationDisplay } from "../../algebra/ui/Frac";
import { Celeb } from "../../algebra/ui/Celeb";
import { OpPicker } from "../../algebra/inputs/OpPicker";
import { INEQ_DISPLAY } from "../parser";

const FLIP_MAP = { ">": "<", "<": ">", ">=": "<=", "<=": ">=" };

function LightBeam({ containerRef, orbRef, infRef, negInfRef, boundaryRef, ineqDir, visible }) {
  const [pts, setPts] = useState(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const orb = orbRef.current;
    const inf = infRef.current;
    const negInf = negInfRef.current;
    const bound = boundaryRef.current;
    if (!container || !orb || !inf || !negInf || !bound) return;

    const cR = container.getBoundingClientRect();
    const orbR = orb.getBoundingClientRect();
    const infR = inf.getBoundingClientRect();
    const negInfR = negInf.getBoundingClientRect();
    const boundR = bound.getBoundingClientRect();

    // All coordinates relative to container
    const ox = orbR.left + orbR.width / 2 - cR.left;
    const oy = orbR.top + orbR.height / 2 - cR.top;
    const infY = infR.top + infR.height / 2 - cR.top;
    const negInfY = negInfR.top + negInfR.height / 2 - cR.top;
    const boundY = boundR.top + boundR.height / 2 - cR.top;
    // Circle is rightmost element in the flex row, 10px wide
    const tx = boundR.right - 5 - cR.left;

    setPts({ ox, oy, tx, infY, negInfY, boundY });
  }, [containerRef, orbRef, infRef, negInfRef, boundaryRef]);

  useEffect(() => {
    if (!visible) { setPts(null); return; }
    // Measure after spring animation finishes (0.7s + 0.15s delay)
    const t = setTimeout(measure, 1000);
    return () => clearTimeout(t);
  }, [visible, measure]);

  if (!pts || !visible) return null;

  const isUp = ineqDir === ">" || ineqDir === ">=";
  // Triangle: orb center → ∞ (or −∞) target, orb center → boundary target
  const targetInfY = isUp ? pts.infY : pts.negInfY;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-5"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="beamGrad" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.5)" />
          <stop offset="55%" stopColor="rgba(251,191,36,0.12)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </linearGradient>
      </defs>
      <polygon
        points={`${pts.ox},${pts.oy} ${pts.tx},${targetInfY} ${pts.tx},${pts.boundY}`}
        fill="url(#beamGrad)"
        style={{ transition: "opacity 0.6s ease 0.5s" }}
      />
    </svg>
  );
}

const opSymbols = { "+": "+", "−": "−", "×": "×" };

function OpNotation({ op, n }) {
  if (op === "÷") {
    return (
      <span className="inline-flex flex-col items-center leading-none">
        <span className="w-full border-t border-text-muted" />
        <span className="text-[15px] px-1">{n}</span>
      </span>
    );
  }
  return <span>{opSymbols[op] || op}{n}</span>;
}

export function ExploreMode({ level, onNext, hasNext }) {
  const s = useInequalityExplore(level);
  const containerRef = useRef(null);
  const orbRef = useRef(null);
  const infRef = useRef(null);
  const negInfRef = useRef(null);
  const boundaryRef = useRef(null);

  const isMulType = level.type === "multiply";
  const inRight = s.phase === "right" && s.snap;
  const didDivide = inRight && s.leftOp === "÷";
  const showGreyedBoxes = didDivide && s.snap.boxCount > s.boxCount;
  const showActiveSlice = (isMulType && s.sliceLines > 1)
    || (didDivide && s.sliceLines > (s.snap.sliceLines || 1));
  const totalBoxes = showGreyedBoxes ? s.snap.boxCount : s.boxCount;
  const greyedFrom = showGreyedBoxes ? s.boxCount : undefined;

  const isUnbalanced = s.phase === "unbalanced";
  const isInBetween = s.phase === "right";
  const isChooseSymbol = s.phase === "choose_symbol";
  const isSolved = s.phase === "solved";
  const showNotEqual = isUnbalanced || isInBetween;

  const varSide = (
    <>
      <BoxGrid
        count={totalBoxes}
        boxOpen={s.boxOpen}
        boxValue={level.boxValue}
        sliceLines={s.sliceLines}
        varName={s.varName}
        greyedFrom={greyedFrom}
        activeSlice={showActiveSlice}
        onClickVar={s.togglePicker}
        showPicker={s.showPicker}
        onPickVar={s.setVarName}
        onClosePicker={s.closePicker}
        mode="inequality"
        ineqDir={s.ineqDir}
        orbRef={orbRef}
        negCoeff={s.negCoeff}
      />
      <PillGroup count={s.loosePills} holes={s.unfilled} />
      {!isSolved && (
        <OpPicker
          key={`L${s.opKey}`}
          active={s.phase === "left"}
          locked={s.leftOp !== null && s.phase !== "left"}
          lockedOp={s.leftOp}
          lockedNum={s.leftNum}
          onSubmit={s.applyToLeft}
          label="Do something to this side"
        />
      )}
      {s.leftError && (
        <span className="text-[11px] text-err-text text-center">{s.leftError}</span>
      )}
    </>
  );

  const numSide = (
    <>
      <PillGroup count={s.rPills} />
      {!isSolved && (
        <OpPicker
          key={`R${s.opKey}`}
          active={s.phase === "right"}
          locked={false}
          onSubmit={s.applyToRight}
          label="Now do the same here"
        />
      )}
      {s.rightError && (
        <span className="text-[11px] text-err-text text-center">{s.rightError}</span>
      )}
    </>
  );

  return (
    <div ref={containerRef} className="relative flex gap-4" onClick={() => s.showPicker && s.closePicker()}>
      {/* Light beam overlay — uses measured positions */}
      <LightBeam
        containerRef={containerRef}
        orbRef={orbRef}
        infRef={infRef}
        negInfRef={negInfRef}
        boundaryRef={boundaryRef}
        ineqDir={s.ineqDir}
        visible={isSolved && s.boxOpen}
      />

      {/* Number line */}
      <NumberLine
        solved={isSolved}
        boundary={level.boxValue}
        inequality={s.ineqDir}
        infRef={infRef}
        negInfRef={negInfRef}
        boundaryRef={boundaryRef}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {s.showCeleb && <Celeb />}

        {/* Show your work */}
        <div className="text-center mb-3 space-y-1">
          <EquationDisplay
            text={s.initialEq}
            size={20}
            colorClass={isSolved ? "text-ok" : undefined}
          />

          {s.workLines.map((line, i) =>
            line.type === "op" ? (
              <div key={i} className="flex items-end justify-center gap-6 font-mono text-text-muted text-[15px] font-bold">
                {level.flipped && line.pending
                  ? <span className="text-text-faint">?</span>
                  : <OpNotation op={line.op} n={line.n} />
                }
                <span className="pb-0.5">{s.ineqSym}</span>
                {!level.flipped && line.pending
                  ? <span className="text-text-faint">?</span>
                  : <OpNotation op={line.op} n={line.n} />
                }
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
                equalsOverride={line.pending ? "\u2260" : undefined}
                colorClass={line.solved ? "text-ok" : line.pending ? "text-err" : undefined}
              />
            )
          )}
        </div>

        <EquationBoard
          hasError={showNotEqual}
          isSolved={isSolved}
          equalsSymbol={showNotEqual ? "\u2260" : s.ineqSym}
          leftContent={level.flipped ? numSide : varSide}
          rightContent={level.flipped ? varSide : numSide}
        />

        {/* Unbalanced warning */}
        {isUnbalanced && (
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-err-bg border border-err-dim mb-4">
            <span className="text-[13px] text-err-text font-bold text-center">
              One side got {s.leftOp}{s.leftNum} but the other didn&apos;t get the same — not balanced!
            </span>
            <button
              onClick={s.undo}
              className="py-2.5 px-6 rounded-lg border-none bg-cta text-surface font-bold cursor-pointer text-sm hover:bg-cta-hover transition-colors"
            >
              &larr; Undo
            </button>
          </div>
        )}

        {/* Choose inequality symbol */}
        {isChooseSymbol && (
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
        {isSolved && (
          <div className="text-center p-4 bg-ok/10 rounded-xl border border-ok-dim mb-4">
            <p className="text-xl font-extrabold text-ok-text m-0">
              {s.varName} {s.ineqSym} {level.boxValue}
            </p>
          </div>
        )}

        <ActionBar onReset={s.fullReset} onNext={onNext} showNext={isSolved && hasNext} />
      </div>
    </div>
  );
}
