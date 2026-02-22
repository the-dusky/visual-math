"use client";

import { HoleDot } from "./HoleDot";

function VarPicker({ current, onPick, onClose }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 bg-surface-raised border border-border rounded-xl p-2 flex flex-wrap gap-1 max-w-[200px] justify-center">
      {"abcdefghijklmnopqrstuvwxyz".split("").map((l) => (
        <button
          key={l}
          onClick={() => { onPick(l); onClose(); }}
          className={`w-[26px] h-[26px] rounded-md border-none text-[13px] font-bold cursor-pointer font-mono
            ${l === current
              ? "bg-accent text-surface"
              : "bg-surface text-text-muted hover:text-text-secondary"
            }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function MysteryBox({
  open, value, small, holeCount: holes = 0, filledHoles = 0,
  sliceLines: lines = 1, variable, onClickVar, showPicker,
  onPickVar, onClosePicker, greyed, activeSlice,
}) {
  const sz = small ? 56 : 86;
  const v = variable || "x";
  const filled = Math.min(filledHoles, holes);
  const showSliceGreying = activeSlice && lines > 1 && !open;
  const showLines = lines > 1 && !open && !greyed;
  const bleed = 10;

  // Scale hole size to fit inside the box
  const boxInner = sz - 16;
  let holeSize = 16;
  if (holes > 0) {
    const availArea = boxInner * boxInner * 0.55;
    const idealWithGap = Math.sqrt(availArea / Math.ceil(holes));
    holeSize = Math.max(3, Math.min(16, Math.floor(idealWithGap - 2)));
  }

  return (
    <div className="flex flex-col items-center relative">
      <div className="relative" style={{ width: sz + bleed * 2, height: sz }}>
        {/* The box */}
        <div
          className="absolute flex flex-col items-center justify-center gap-0.5 rounded-lg overflow-hidden transition-all duration-500"
          style={{
            left: bleed, top: 0, width: sz, height: sz,
            background: greyed
              ? "#27272a"
              : open
                ? "#fef3c7"
                : "#92400e",
            border: greyed
              ? "1px solid #3f3f46"
              : open
                ? "1px solid #d97706"
                : "1px solid #f59e0b",
            transform: open ? "scale(1.05)" : "scale(1)",
            opacity: greyed ? 0.35 : 1,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Greyed section overlays for slice visualization */}
          {showSliceGreying &&
            Array(lines)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`s${i}`}
                  className="absolute left-0 right-0 pointer-events-none z-[1] transition-[background] duration-400"
                  style={{
                    top: `${(i * 100) / lines}%`,
                    height: `${100 / lines}%`,
                    background: i === 0 ? "transparent" : "rgba(0,0,0,0.55)",
                  }}
                />
              ))}

          {open ? (
            <span className={`font-extrabold text-amber-800 z-[2] ${small ? "text-xl" : "text-[28px]"}`}>
              {value}
            </span>
          ) : (
            <span
              onClick={greyed ? undefined : onClickVar}
              className={`font-bold font-mono select-none z-[2]
                ${small ? "text-[22px]" : "text-[34px]"}
                ${greyed ? "text-text-faint" : "text-accent-bright cursor-pointer"}
              `}
            >
              {v}
            </span>
          )}

          {holes > 0 && !open && !greyed && (() => {
            const wholeHoles = Math.floor(holes);
            const fracHole = +(holes - wholeHoles).toFixed(4);
            const wholeFilled = Math.floor(filled);
            const fracFilled = +(filled - wholeFilled).toFixed(4);
            const totalDots = wholeHoles + (fracHole > 0 ? 1 : 0);

            return (
              <div
                className="flex flex-wrap justify-center z-[2]"
                style={{ gap: holeSize <= 5 ? 1 : 2, maxWidth: sz - 14 }}
              >
                {Array(totalDots)
                  .fill(0)
                  .map((_, i) => {
                    const isFrac = i === wholeHoles && fracHole > 0;
                    const frac = isFrac ? fracHole : 1;
                    const isFilled = i < wholeFilled || (i === wholeFilled && fracFilled > 0);
                    return <HoleDot key={`h${i}`} filled={isFilled} fraction={frac} size={holeSize} />;
                  })}
              </div>
            );
          })()}
        </div>

        {/* Slice lines that bleed past the box edges */}
        {showLines &&
          Array(lines - 1)
            .fill(0)
            .map((_, i) => (
              <div
                key={`cut${i}`}
                className="absolute left-0 right-0 h-0 pointer-events-none z-[3]"
                style={{
                  top: ((i + 1) / lines) * sz,
                  borderTop: "1px dashed rgba(251,191,36,0.5)",
                }}
              />
            ))}
      </div>

      {showPicker && <VarPicker current={v} onPick={onPickVar} onClose={onClosePicker} />}
    </div>
  );
}
