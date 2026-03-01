"use client";

import { useState } from "react";
import Link from "next/link";
import { CONCEPTS } from "./constants";
import CircleDiagram from "./ui/CircleDiagram";

export default function CircleGeometryGame() {
  const [selected, setSelected] = useState(null);

  const concept = CONCEPTS.find((c) => c.id === selected);

  return (
    <div className="min-h-screen bg-surface text-text font-sans p-5 sm:p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-5">
          <Link
            href="/"
            className="text-text-muted hover:text-text text-sm no-underline mb-3 inline-block"
          >
            &larr; Back to lessons
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold mb-1 text-accent">
            Circle Geometry
          </h1>
          <p className="text-xs text-text-muted mb-4">
            Explore the parts of a circle
          </p>
        </div>

        {/* SVG Diagram */}
        <CircleDiagram selected={selected} onSelect={setSelected} />

        {/* Concept selector pills */}
        <div className="flex gap-1.5 justify-center flex-wrap mt-4 mb-5 px-2">
          {CONCEPTS.map((c) => {
            const isSel = selected === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(isSel ? null : c.id)}
                className="py-2 px-4 rounded-lg border font-bold cursor-pointer text-[12px] transition-all duration-200"
                style={
                  isSel
                    ? {
                        background: c.color,
                        borderColor: c.color,
                        color: "#09090b",
                      }
                    : {
                        background: "transparent",
                        borderColor: "#27272a",
                        color: c.color,
                      }
                }
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Info card */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: concept ? 600 : 0,
            opacity: concept ? 1 : 0,
          }}
        >
          {concept && (
            <div
              className="rounded-xl border p-5 sm:p-6"
              style={{
                background: "#18181b",
                borderColor: concept.color + "33",
              }}
            >
              {/* Name */}
              <h2
                className="text-lg sm:text-xl font-extrabold mb-2"
                style={{ color: concept.color }}
              >
                {concept.name}
              </h2>

              {/* Definition */}
              <p className="text-sm sm:text-[15px] text-text leading-relaxed mb-4">
                {concept.definition}
              </p>

              {/* Fun fact */}
              <div className="rounded-lg bg-surface-overlay px-4 py-3 mb-4">
                <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed">
                  <span className="font-bold text-accent-bright mr-1">
                    Fun fact:
                  </span>
                  {concept.funFact}
                </p>
              </div>

              {/* Real-world examples */}
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-3">
                In the Real World
              </p>
              <div className="flex flex-col gap-3">
                {concept.realWorld.map((rw, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {rw.icon}
                    </span>
                    <p className="text-[13px] sm:text-sm text-text-secondary leading-relaxed m-0">
                      {rw.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
