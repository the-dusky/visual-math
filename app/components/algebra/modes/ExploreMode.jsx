"use client";

import { useExploreLogic } from "../hooks/useExploreLogic";
import { EquationBoard } from "../board/EquationBoard";
import { BoxGrid } from "../board/BoxGrid";
import { ActionBar } from "../board/ActionBar";
import { PillGroup } from "../ui/Pill";
import { EquationDisplay } from "../ui/Frac";
import { Celeb } from "../ui/Celeb";
import { OpPicker } from "../inputs/OpPicker";

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
  const s = useExploreLogic(level);

  const isMulType = level.type === "multiply";
  const inRight = s.phase === "right" && s.snap;
  const didDivide = inRight && s.leftOp === "\u00f7";
  const showGreyedBoxes = didDivide && s.snap.boxCount > s.boxCount;
  const showActiveSlice = (isMulType && s.sliceLines > 1)
    || (didDivide && s.sliceLines > (s.snap.sliceLines || 1));
  const totalBoxes = showGreyedBoxes ? s.snap.boxCount : s.boxCount;
  const greyedFrom = showGreyedBoxes ? s.boxCount : undefined;

  const isUnbalanced = s.phase === "unbalanced";
  const isInBetween = s.phase === "right";
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
      <PillGroup count={s.rPills}  />
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
              <span className="pb-0.5">=</span>
              {!level.flipped && line.pending
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

      {/* Solved */}
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
