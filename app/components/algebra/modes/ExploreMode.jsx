"use client";

import { useExploreLogic } from "../hooks/useExploreLogic";
import { EquationBoard } from "../board/EquationBoard";
import { BoxGrid } from "../board/BoxGrid";
import { ActionBar } from "../board/ActionBar";
import { PillGroup } from "../ui/Pill";
import { EquationDisplay } from "../ui/Frac";
import { Celeb } from "../ui/Celeb";
import { StepLog } from "../ui/StepLog";
import { OpPicker } from "../inputs/OpPicker";

export function ExploreMode({ level, onNext, hasNext }) {
  const s = useExploreLogic(level);

  // Compute greyed/activeSlice display state
  const didDivide = s.phase === "right" && s.leftOp === "\u00f7" && s.snap;
  const showGreyedBoxes = didDivide && s.snap.boxCount > s.boxCount;
  const showActiveSlice = didDivide && s.sliceLines > (s.snap.sliceLines || 1);
  const totalBoxes = showGreyedBoxes ? s.snap.boxCount : s.boxCount;
  const greyedFrom = showGreyedBoxes ? s.boxCount : undefined;

  const isUnbalanced = s.phase === "unbalanced";
  const isInBetween = s.phase === "right";
  const isSolved = s.phase === "solved";
  const showNotEqual = isUnbalanced || isInBetween;

  return (
    <div className="relative" onClick={() => s.showPicker && s.closePicker()}>
      {s.showCeleb && <Celeb />}

      {/* Live equation */}
      <div className="text-center mb-3">
        <EquationDisplay
          text={s.liveEq}
          size={20}
          equalsOverride={showNotEqual ? "\u2260" : undefined}
          colorClass={showNotEqual ? "text-err" : isSolved ? "text-ok" : undefined}
        />
      </div>

      <EquationBoard
        hasError={showNotEqual}
        isSolved={isSolved}
        equalsSymbol={showNotEqual ? "\u2260" : "="}
        leftContent={
          <>
            <BoxGrid
              count={totalBoxes}
              boxOpen={s.boxOpen}
              boxValue={level.boxValue}
              holeCount={s.holeCount}
              filledHoles={s.filledHoles}
              sliceLines={s.sliceLines}
              varName={s.varName}
              greyedFrom={greyedFrom}
              activeSlice={showActiveSlice}
              onClickVar={s.togglePicker}
              showPicker={s.showPicker}
              onPickVar={s.setVarName}
              onClosePicker={s.closePicker}
            />
            <PillGroup count={s.loosePills} small={s.loosePills > 8} />
            <OpPicker
              key={`L${s.opKey}`}
              active={s.phase === "left"}
              locked={s.leftOp !== null && s.phase !== "left"}
              lockedOp={s.leftOp}
              lockedNum={s.leftNum}
              onSubmit={s.applyToLeft}
              label="Do something to this side"
            />
            {s.leftError && (
              <span className="text-[11px] text-err-text text-center">{s.leftError}</span>
            )}
          </>
        }
        rightContent={
          <>
            <PillGroup count={s.rPills} small={s.rPills > 8} />
            <OpPicker
              key={`R${s.opKey}`}
              active={s.phase === "right"}
              locked={false}
              onSubmit={s.applyToRight}
              label="Now do the same here"
            />
            {s.rightError && (
              <span className="text-[11px] text-err-text text-center">{s.rightError}</span>
            )}
          </>
        }
      />

      {/* Unbalanced warning */}
      {isUnbalanced && (
        <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-err-bg border border-err-dim mb-4">
          <span className="text-[13px] text-err-text font-bold text-center">
            Left got {s.leftOp}{s.leftNum} but right didn&apos;t get the same — not balanced!
          </span>
          <button
            onClick={s.undo}
            className="py-2.5 px-6 rounded-lg border-none bg-cta text-surface font-bold cursor-pointer text-sm hover:bg-cta-hover transition-colors"
          >
            &larr; Undo
          </button>
        </div>
      )}

      {/* Solved */}
      {s.phase === "solved" && (
        <div className="text-center p-4 bg-ok/10 rounded-xl border border-ok-dim mb-4">
          <p className="text-xl font-extrabold text-ok-text m-0">
            {s.varName} = {level.boxValue}
          </p>
        </div>
      )}

      <StepLog steps={s.steps} />
      <ActionBar onReset={s.fullReset} onNext={onNext} showNext={s.phase === "solved" && hasNext} />
    </div>
  );
}
