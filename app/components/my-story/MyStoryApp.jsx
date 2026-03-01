"use client";
import { useState } from "react";
import Link from "next/link";
import { useClasses } from "./hooks/useClasses";
import { useEntries } from "./hooks/useEntries";
import { useCloudSync } from "./hooks/useCloudSync";
import { TodayMode } from "./modes/TodayMode";
import { TimelineMode } from "./modes/TimelineMode";
import { SetupMode } from "./modes/SetupMode";

const MODES = [
  ["today", "Today"],
  ["timeline", "Timeline"],
  ["setup", "Setup"],
];

export default function MyStoryApp() {
  const [mode, setMode] = useState("today");
  const classesHook = useClasses();
  const entriesHook = useEntries();
  const { syncing, lastSynced, available } = useCloudSync(classesHook, entriesHook);

  // Force setup when no classes exist
  const effectiveMode = classesHook.activeClasses.length === 0 ? "setup" : mode;

  return (
    <div className="min-h-screen bg-surface text-text font-sans p-5 sm:p-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-5">
          <Link
            href="/"
            className="text-text-muted hover:text-text text-sm no-underline mb-3 inline-block"
          >
            &larr; Back to lessons
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold mb-1 text-accent">
            My Story
          </h1>
          <p className="text-xs text-text-muted mb-1">
            One sentence per class, every day
          </p>
          <p className="text-[10px] text-text-faint mb-4 h-3">
            {available
              ? syncing
                ? "Saving..."
                : lastSynced
                  ? "Saved to cloud"
                  : ""
              : ""}
          </p>

          {/* Mode toggle */}
          <div className="inline-flex rounded-lg overflow-hidden border border-border mb-4">
            {MODES.map(([m, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2.5 px-6 sm:px-8 border-none font-bold cursor-pointer text-sm transition-colors ${
                  effectiveMode === m
                    ? "bg-action text-white"
                    : "bg-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {effectiveMode === "today" && (
          <TodayMode classes={classesHook} entries={entriesHook} />
        )}
        {effectiveMode === "timeline" && (
          <TimelineMode classes={classesHook} entries={entriesHook} />
        )}
        {effectiveMode === "setup" && (
          <SetupMode classes={classesHook} entries={entriesHook} />
        )}
      </div>
    </div>
  );
}
