"use client";

import { useAdvancedDistribution } from "../hooks/useAdvancedDistribution";
import { MultiTermDistributeView } from "../ui/MultiTermDistributeView";
import { ActionBar } from "../../algebra/board/ActionBar";
import { Celeb } from "../../algebra/ui/Celeb";
import { getTermColor } from "../colors";

const fmt = (n) => {
  const abs = Math.abs(n);
  return Number.isInteger(abs) ? String(abs) : parseFloat(abs.toFixed(4)).toString();
};

export function ExploreMode({ level, onNext, hasNext }) {
  const s = useAdvancedDistribution(level);
  const isDone = s.phase === "done";

  return (
    <div className="relative">
      {s.showCeleb && <Celeb />}

      <MultiTermDistributeView
        level={level}
        onComplete={s.onDistributeComplete}
      />

      {isDone && (
        <div className="text-center p-4 bg-ok/10 rounded-xl border border-ok-dim mb-4 mt-4">
          <p className="text-lg font-extrabold font-mono m-0">
            {s.resultTerms.map((t, i) => {
              const color = getTermColor(t.variable);
              const absCoeff = Math.abs(t.coeff);
              const isFirst = i === 0;
              const sign = t.coeff < 0 ? " − " : (isFirst ? "" : " + ");
              const label = t.variable
                ? (absCoeff === 1 ? t.variable : `${fmt(absCoeff)}${t.variable}`)
                : fmt(absCoeff);
              return (
                <span key={i} className={color.text}>
                  {sign}{label}
                </span>
              );
            })}
          </p>
        </div>
      )}

      <div className="mt-4">
        <ActionBar onReset={s.reset} onNext={onNext} showNext={isDone && hasNext} />
      </div>
    </div>
  );
}
