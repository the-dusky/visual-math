"use client";

import { MysteryBox } from "../ui/MysteryBox";

export function BoxGrid({
  count, boxOpen, boxValue, holeCount = 0, filledHoles = 0,
  sliceLines = 1, varName, greyedFrom, activeSlice,
  onClickVar, showPicker, onPickVar, onClosePicker,
}) {
  const small = count > 2;

  return (
    <div className="flex gap-2 flex-wrap justify-center max-w-[280px]">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <MysteryBox
            key={i}
            open={boxOpen}
            value={boxValue}
            small={small}
            holeCount={i === 0 ? holeCount : 0}
            filledHoles={i === 0 ? filledHoles : 0}
            sliceLines={sliceLines}
            variable={varName}
            greyed={greyedFrom != null && i >= greyedFrom}
            activeSlice={activeSlice && !(greyedFrom != null && i >= greyedFrom)}
            onClickVar={
              i === 0
                ? (e) => { e.stopPropagation(); onClickVar?.(); }
                : undefined
            }
            showPicker={showPicker && i === 0}
            onPickVar={onPickVar}
            onClosePicker={onClosePicker}
          />
        ))}
    </div>
  );
}
