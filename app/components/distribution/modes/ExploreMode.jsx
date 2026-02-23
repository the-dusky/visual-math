"use client";

import { useDistributionExplore } from "../hooks/useDistributionExplore";
import { DistributeView } from "../ui/DistributeView";
import { EquationBoard } from "../../algebra/board/EquationBoard";
import { BoxGrid } from "../../algebra/board/BoxGrid";
import { ActionBar } from "../../algebra/board/ActionBar";
import { PillGroup } from "../../algebra/ui/Pill";
import { EquationDisplay } from "../../algebra/ui/Frac";
import { Celeb } from "../../algebra/ui/Celeb";
import { OpPicker } from "../../algebra/inputs/OpPicker";
import { levelDistEq } from "../parser";

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
  const s = useDistributionExplore(level);

  const isSolved = s.phase === "solved";
  const isUnbalanced = s.phase === "unbalanced";
  const isInBetween = s.phase === "right";
  const showNotEqual = isUnbalanced || isInBetween;
  const isDistribute = s.phase === "distribute";

  const distEqStr = levelDistEq(level);

  // --- Distribute phase ---
  if (isDistribute) {
    return (
      <div className="relative">
        <DistributeView
          multiplier={level.multiplier}
          innerBoxes={level.innerBoxes}
          innerPills={level.innerPills}
          variable={level.variable || "x"}
          boxValue={level.boxValue}
          rightPills={level.rightPills}
          onComplete={s.distribute}
        />

        <div className="mt-4">
          <ActionBar onReset={s.fullReset} onNext={undefined} showNext={false} />
        </div>
      </div>
    );
  }

  // --- Post-distribution (standard equation solving) ---
  const inRight = s.phase === "right" && s.snap;
  const didDivide = inRight && s.leftOp === "÷";
  const showGreyedBoxes = didDivide && s.snap.boxCount > s.boxCount;
  const showActiveSlice = didDivide && s.sliceLines > (s.snap?.sliceLines || 1);
  const displayBoxes = showGreyedBoxes ? s.snap.boxCount : s.boxCount;
  const greyedFrom = showGreyedBoxes ? s.boxCount : undefined;

  const varSide = (
    <>
      <BoxGrid
        count={displayBoxes}
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
    <div className="relative" onClick={() => s.showPicker && s.closePicker()}>
      {s.showCeleb && <Celeb />}

      {/* Work history */}
      <div className="text-center mb-3 space-y-1">
        <EquationDisplay
          text={distEqStr}
          size={18}
          colorClass={isSolved ? "text-ok" : "text-text-muted"}
        />

        {s.workLines.map((line, i) =>
          line.type === "distribute" ? (
            <div key={i} className="text-[12px] text-action font-bold">
              {line.text}
            </div>
          ) : line.type === "op" ? (
            <div key={i} className="flex items-end justify-center gap-6 font-mono text-text-muted text-[15px] font-bold">
              <OpNotation op={line.op} n={line.n} />
              <span className="pb-0.5">=</span>
              {line.pending
                ? <span className="text-text-faint">?</span>
                : <OpNotation op={line.op} n={line.n} />
              }
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
        equalsSymbol={showNotEqual ? "\u2260" : "="}
        leftContent={varSide}
        rightContent={numSide}
      />

      {isUnbalanced && (
        <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-err-bg border border-err-dim mb-4">
          <span className="text-[13px] text-err-text font-bold text-center">
            One side got {s.leftOp}{s.leftNum} but the other didn&apos;t get the same &mdash; not balanced!
          </span>
          <button
            onClick={s.undo}
            className="py-2.5 px-6 rounded-lg border-none bg-cta text-surface font-bold cursor-pointer text-sm hover:bg-cta-hover transition-colors"
          >
            &larr; Undo
          </button>
        </div>
      )}

      {isSolved && (
        <div className="text-center p-4 bg-ok/10 rounded-xl border border-ok-dim mb-4">
          <p className="text-xl font-extrabold text-ok-text m-0">
            {s.varName} = {level.boxValue}
          </p>
        </div>
      )}

      <ActionBar onReset={s.fullReset} onNext={onNext} showNext={isSolved && hasNext} />
    </div>
  );
}
