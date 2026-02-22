"use client";

import { useSolveLogic } from "../hooks/useSolveLogic";
import { EquationBoard } from "../board/EquationBoard";
import { BoxGrid } from "../board/BoxGrid";
import { ActionBar } from "../board/ActionBar";
import { PillGroup } from "../ui/Pill";
import { Celeb } from "../ui/Celeb";
import { StepLog } from "../ui/StepLog";
import { MsgBar } from "../ui/MsgBar";
import { SplitBox } from "../ui/SplitBox";
import { SimpleInput } from "../inputs/SimpleInput";
import { OperationRow } from "../inputs/OperationRow";

export function SolveMode({ level, onNext, hasNext }) {
  const s = useSolveLogic(level);

  // Compute greyed/activeSlice for visual display
  const showGreyed = s.boxOpDone && s.boxOpChoice === "\u00f7" && s.visBoxCount > 1;
  const showActiveSlice = s.visSliceLines > 1 && (s.wrongAnswer || (s.boxOpDone && s.boxOpChoice === "\u00f7"));

  return (
    <div className="relative" onClick={() => s.showPicker && s.closePicker()}>
      {s.showCeleb && <Celeb />}

      <EquationBoard
        hasError={!!s.wrongAnswer}
        leftContent={
          <>
            <BoxGrid
              count={s.visBoxCount}
              boxOpen={s.boxOpen}
              boxValue={level.boxValue}
              holeCount={s.holeCount}
              filledHoles={s.filledHoles}
              sliceLines={s.visSliceLines}
              varName={s.varName}
              greyedFrom={showGreyed ? 1 : undefined}
              activeSlice={showActiveSlice}
              onClickVar={s.togglePicker}
              showPicker={s.showPicker}
              onPickVar={s.setVarName}
              onClosePicker={s.closePicker}
            />
            <PillGroup count={s.loosePills} small={s.loosePills > 6} />
          </>
        }
        rightContent={
          s.showSplit ? (
            <div className="flex gap-2 flex-wrap justify-center">
              {Array(s.visSplitBoxes)
                .fill(0)
                .map((_, i) => (
                  <SplitBox key={i} count={s.visSplitCount} greyed={i > 0} />
                ))}
            </div>
          ) : (
            <PillGroup count={s.visRPills} small={s.visRPills > 8} />
          )
        }
      />

      {/* Step panels */}
      {!s.solved && (
        <div className="bg-surface-raised rounded-xl border border-border p-4 mb-4 flex flex-col gap-3">
          {/* Wrong answer undo */}
          {s.wrongAnswer && (
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-err-bg border border-err-dim">
              <span className="text-[13px] text-err-text font-bold text-center">
                {s.wrongAnswer.desc}
              </span>
              <button
                onClick={s.undoWrong}
                className="py-2.5 px-6 rounded-lg border-none bg-cta text-surface font-bold cursor-pointer text-sm hover:bg-cta-hover transition-colors"
              >
                &larr; Undo
              </button>
            </div>
          )}

          {/* Box operation step */}
          {!s.wrongAnswer && (s.solvePhase === "boxOp" || s.boxOpDone) && (
            <div
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border
                ${s.boxOpDone ? "bg-ok/10 border-ok-dim" : "bg-surface-raised border-border"}`}
            >
              <span className={`text-xs font-bold ${s.boxOpDone ? "text-text-secondary" : "text-accent"}`}>
                How do we get just one {s.varName}?
              </span>

              {!s.boxOpDone && !s.boxOpChoice && (
                <div className="flex gap-3">
                  <button
                    onClick={() => s.setBoxOpChoice("\u00d7")}
                    className="py-2.5 px-6 rounded-lg border-none bg-action text-white font-bold cursor-pointer text-sm hover:bg-action-dim transition-colors"
                  >
                    \u00d7 Multiply
                  </button>
                  <button
                    onClick={() => s.setBoxOpChoice("\u00f7")}
                    className="py-2.5 px-6 rounded-lg border-none bg-cta text-surface font-bold cursor-pointer text-sm hover:bg-cta-hover transition-colors"
                  >
                    \u00f7 Divide
                  </button>
                </div>
              )}

              {!s.boxOpDone && s.boxOpChoice && (
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-text font-mono">
                    {s.boxOpChoice}
                  </span>
                  <input
                    ref={s.boxNumRef}
                    type="number"
                    value={s.boxOpNum}
                    onChange={(e) => { s.setBoxOpNum(e.target.value); s.setBoxOpError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") s.submitBoxOp(); }}
                    placeholder="?"
                    className="w-13 h-10 rounded-lg border border-border bg-surface text-accent text-[17px] font-extrabold text-center font-mono outline-none focus:border-border-strong"
                  />
                  <button
                    onClick={s.submitBoxOp}
                    className="px-4 py-2.5 rounded-lg border-none bg-action text-white font-bold cursor-pointer text-xs hover:bg-action-dim transition-colors"
                  >
                    Go
                  </button>
                  <button
                    onClick={() => { s.setBoxOpChoice(null); s.setBoxOpNum(""); }}
                    className="px-4 py-2 rounded-lg border border-border bg-transparent text-text-muted cursor-pointer text-xs hover:border-border-strong transition-colors"
                  >
                    Back
                  </button>
                </div>
              )}

              {s.boxOpDone && (
                <span className="text-[13px] text-ok-text font-mono font-bold">
                  {s.boxOpChoice}{s.boxOpNum}
                </span>
              )}

              {s.boxOpError && (
                <span className="text-[11px] text-err-text">{s.boxOpError}</span>
              )}
            </div>
          )}

          {/* Per box input */}
          {!s.wrongAnswer && s.solvePhase === "perBox" && (
            <SimpleInput
              label="How many per group?"
              val={s.perBoxInput}
              set={(v) => { s.setPerBoxInput(v); s.setPerBoxError(""); }}
              go={s.submitPerBox}
              err={s.perBoxError}
              inputRef={s.perBoxRef}
            />
          )}

          {/* Box compute */}
          {!s.wrongAnswer && s.solvePhase === "boxCompute" && (
            <SimpleInput
              label={`${level.rightPills} \u00d7 ${level.divisor} = ?`}
              val={s.computeVal}
              set={(v) => { s.setComputeVal(v); s.setComputeError(""); }}
              go={s.submitBoxCompute}
              err={s.computeError}
              inputRef={s.computeRef}
            />
          )}

          {/* Left step */}
          {!s.wrongAnswer && !s.isDivStep && (s.solvePhase === "left" || s.leftDone) && (
            <OperationRow
              label="\u2460 Left side:"
              op={s.leftOp}
              num={s.leftNum}
              setOp={s.setLeftOp}
              setNum={(v) => { s.setLeftNum(v); }}
              go={s.submitLeft}
              err={s.leftError}
              done={s.leftDone}
              inputRef={s.leftRef}
            />
          )}

          {/* Right step */}
          {!s.wrongAnswer && !s.isDivStep && (s.solvePhase === "right" || s.rightDone) && (
            <OperationRow
              label="\u2461 Right side:"
              op={s.rightOp}
              num={s.rightNum}
              setOp={s.setRightOp}
              setNum={(v) => { s.setRightNum(v); }}
              go={s.submitRight}
              err={s.rightError}
              done={s.rightDone}
              inputRef={s.rightRef}
            />
          )}

          {/* Compute step */}
          {!s.wrongAnswer && !s.isDivStep && s.solvePhase === "compute" && (
            <SimpleInput
              label={`\u2462 ${s.exp.rBefore} ${s.exp.op} ${s.exp.num} = ?`}
              val={s.computeVal}
              set={(v) => { s.setComputeVal(v); s.setComputeError(""); }}
              go={s.submitCompute}
              err={s.computeError}
              inputRef={s.computeRef}
            />
          )}

          {/* Final answer */}
          {!s.wrongAnswer && s.solvePhase === "finalAnswer" && (
            <div className="flex flex-col items-center gap-3 p-4 px-5 rounded-xl bg-surface-raised border border-accent">
              <span className="text-[15px] text-accent font-extrabold font-mono">
                {s.varName} = ?
              </span>
              <div className="flex items-center gap-2">
                <input
                  ref={s.computeRef}
                  type="number"
                  value={s.computeVal}
                  onChange={(e) => { s.setComputeVal(e.target.value); s.setComputeError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") s.submitFinal(); }}
                  placeholder="?"
                  className="w-13 h-10 rounded-lg border border-border bg-surface text-ok-text text-[17px] font-extrabold text-center font-mono outline-none focus:border-border-strong"
                />
                <button
                  onClick={s.submitFinal}
                  className="px-4 py-2.5 rounded-lg border-none bg-ok text-surface font-bold cursor-pointer text-sm hover:bg-ok-dim transition-colors"
                >
                  Check
                </button>
              </div>
              {s.computeError && (
                <span className="text-[11px] text-err-text">{s.computeError}</span>
              )}
            </div>
          )}
        </div>
      )}

      <MsgBar solved={s.solved} message={s.msg} />
      <StepLog steps={s.steps} />
      <ActionBar onReset={s.reset} onNext={onNext} showNext={s.solved && hasNext} />
    </div>
  );
}
