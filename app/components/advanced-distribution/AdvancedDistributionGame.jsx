"use client";

import { useState } from "react";
import Link from "next/link";
import { parseAdvancedDist, levelToString } from "./parser";
import { PRESET_LEVELS } from "./constants";
import { ExploreMode } from "./modes/ExploreMode";
import { TestMode } from "./modes/TestMode";

export default function AdvancedDistributionGame() {
  const [levels, setLevels] = useState(PRESET_LEVELS);
  const [levelIdx, setLevelIdx] = useState(0);
  const [mode, setMode] = useState("explore");
  const [gameKey, setGameKey] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");

  const goTo = (i) => { setLevelIdx(i); setGameKey(k => k + 1); };

  function addCustom() {
    const p = parseAdvancedDist(customInput);
    if (!p) { setCustomError("Try: 3(2x+y-h+4), 2(3a-b+5)"); return; }
    setCustomError("");
    setLevels(l => [...l, p]);
    setLevelIdx(levels.length);
    setGameKey(k => k + 1);
    setCustomInput("");
  }

  const lev = levels[levelIdx];

  return (
    <div className="min-h-screen bg-surface text-text font-sans p-5 sm:p-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-5">
          <Link href="/" className="text-text-muted hover:text-text text-sm no-underline mb-3 inline-block">
            &larr; Back to lessons
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold mb-1 text-accent">
            Advanced Distribution
          </h1>
          <p className="text-xs text-text-muted mb-4">Distribute and simplify</p>

          {/* Mode toggle */}
          <div className="inline-flex rounded-lg overflow-hidden border border-border mb-4">
            {[["explore", "Explore"], ["test", "Test"]].map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setGameKey(k => k + 1); }}
                className={`py-2.5 px-6 sm:px-8 border-none font-bold cursor-pointer text-sm transition-colors
                  ${mode === m
                    ? "bg-action text-white"
                    : "bg-transparent text-text-muted hover:text-text-secondary"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            <input
              type="text"
              value={customInput}
              onChange={e => { setCustomInput(e.target.value); setCustomError(""); }}
              onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
              placeholder="Type: 3(2x-y+4)"
              className="w-[220px] h-10 rounded-lg border border-border bg-surface text-text text-[13px] font-semibold text-center font-mono outline-none px-3 focus:border-border-strong"
            />
            <button
              onClick={addCustom}
              className="px-4 py-2.5 rounded-lg border-none bg-ok text-surface font-bold cursor-pointer text-sm hover:bg-ok-dim transition-colors"
            >
              Build &rarr;
            </button>
          </div>
          {customError && <p className="text-[11px] text-err-text mb-2">{customError}</p>}

          {/* Level pills */}
          <div className="flex gap-1.5 justify-center flex-wrap max-w-full px-2">
            {levels.map((l, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`py-2 px-3 rounded-lg border font-bold cursor-pointer text-[11px] font-mono transition-colors
                  ${i === levelIdx
                    ? "bg-accent border-accent-dim text-surface"
                    : "bg-surface-raised border-border text-text-muted hover:text-text-secondary"
                  }`}
              >
                {levelToString(l)}
              </button>
            ))}
          </div>
        </div>

        {mode === "explore" ? (
          <ExploreMode
            key={`e-${gameKey}`}
            level={lev}
            onNext={() => { if (levelIdx < levels.length - 1) goTo(levelIdx + 1); }}
            hasNext={levelIdx < levels.length - 1}
          />
        ) : (
          <TestMode
            key={`t-${gameKey}`}
            level={lev}
            onNext={() => { if (levelIdx < levels.length - 1) goTo(levelIdx + 1); }}
            hasNext={levelIdx < levels.length - 1}
          />
        )}
      </div>
    </div>
  );
}
