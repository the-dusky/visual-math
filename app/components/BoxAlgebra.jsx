"use client";

import { useState } from "react";
import { parseEquation } from "./algebra/parser";
import { levelEq } from "./algebra/parser";
import { PRESET_LEVELS } from "./algebra/constants";
import { EquationDisplay } from "./algebra/ui/Frac";
import { LevelSelector } from "./algebra/board/LevelSelector";
import { ExploreMode } from "./algebra/modes/ExploreMode";
import { SolveMode } from "./algebra/modes/SolveMode";

export default function BoxAlgebra() {
  const [levels, setLevels] = useState(PRESET_LEVELS);
  const [levelIdx, setLevelIdx] = useState(0);
  const [mode, setMode] = useState("explore");
  const [gameKey, setGameKey] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");

  const goTo = (i) => {
    setLevelIdx(i);
    setGameKey((k) => k + 1);
  };

  function addCustom() {
    const p = parseEquation(customInput);
    if (!p) {
      setCustomError("Try: x+3=8, 2x-4=10, 3x=12, x/5=3");
      return;
    }
    setCustomError("");
    setLevels((l) => [...l, p]);
    setLevelIdx(levels.length);
    setGameKey((k) => k + 1);
    setCustomInput("");
  }

  const lev = levels[levelIdx];

  return (
    <div className="min-h-screen bg-surface text-text font-sans p-5 sm:p-6">
      <div className="max-w-xl mx-auto">
      <LevelSelector
        levels={levels}
        levelIdx={levelIdx}
        onSelect={goTo}
        customInput={customInput}
        onCustomChange={(v) => { setCustomInput(v); setCustomError(""); }}
        onCustomSubmit={addCustom}
        customError={customError}
        mode={mode}
        onModeChange={(m) => { setMode(m); setGameKey((k) => k + 1); }}
      />

      {/* Title equation */}
      <div className="text-center mb-4">
        <EquationDisplay text={levelEq(lev)} size={24} />
      </div>

      {mode === "explore" ? (
        <ExploreMode
          key={`e-${gameKey}`}
          level={lev}
          onNext={() => { if (levelIdx < levels.length - 1) goTo(levelIdx + 1); }}
          hasNext={levelIdx < levels.length - 1}
        />
      ) : (
        <SolveMode
          key={`s-${gameKey}`}
          level={lev}
          onNext={() => { if (levelIdx < levels.length - 1) goTo(levelIdx + 1); }}
          hasNext={levelIdx < levels.length - 1}
        />
      )}
      </div>
    </div>
  );
}
