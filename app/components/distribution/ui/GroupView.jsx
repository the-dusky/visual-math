"use client";

import { MysteryBox } from "../../algebra/ui/MysteryBox";
import { PillGroup } from "../../algebra/ui/Pill";

export function GroupView({ multiplier, innerBoxes, innerPills, variable, boxOpen, boxValue }) {
  const pillCount = innerPills >= 0 ? innerPills : 0;
  const holeCount = innerPills < 0 ? Math.abs(innerPills) : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-extrabold text-accent tracking-wider uppercase">
        {multiplier} groups
      </span>

      <div className="flex gap-2 flex-wrap justify-center">
        {Array(multiplier).fill(0).map((_, gi) => (
          <div
            key={gi}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border bg-surface-overlay/40"
            style={{ minWidth: 60 }}
          >
            <div className="flex gap-1 flex-wrap justify-center">
              {Array(innerBoxes).fill(0).map((_, bi) => (
                <MysteryBox
                  key={bi}
                  open={boxOpen}
                  value={boxValue}
                  small={true}
                  variable={variable}
                />
              ))}
            </div>
            <PillGroup count={pillCount} holes={holeCount} />
          </div>
        ))}
      </div>
    </div>
  );
}
