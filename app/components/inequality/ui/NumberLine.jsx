"use client";

import { useRef, useEffect } from "react";

// Log-ish scale: linear 0-10, then compressed
// Returns a pixel position (0 = bottom of line, lineH = top)
function valToY(v, lineH) {
  // Map value to a 0-1 normalized position, then scale to pixels
  // Center at 0.5 (value=0), top half positive, bottom half negative
  const half = lineH / 2;
  const sign = v >= 0 ? 1 : -1;
  const abs = Math.abs(v);

  let norm;
  if (abs <= 10) norm = abs / 10 * 0.4;           // 0-10 → 0-0.4 (linear)
  else if (abs <= 100) norm = 0.4 + (Math.log10(abs) - 1) * 0.15; // 10-100 → 0.4-0.55
  else if (abs <= 1000) norm = 0.55 + (Math.log10(abs) - 2) * 0.12; // 100-1K → 0.55-0.67
  else if (abs <= 10000) norm = 0.67 + (Math.log10(abs) - 3) * 0.1; // 1K-10K → 0.67-0.77
  else if (abs <= 100000) norm = 0.77 + (Math.log10(abs) - 4) * 0.08; // 10K-100K → 0.77-0.85
  else norm = 0.85 + Math.min((Math.log10(abs) - 5) * 0.06, 0.12); // 100K+ → 0.85-0.97

  norm = Math.min(norm, 0.97);
  // Convert to pixel: 0 at center, positive goes up, negative goes down
  return half + sign * norm * half;
}

const TICKS = [
  { v: 0, label: "0" },
  { v: 1, label: "1" }, { v: 2, label: "2" }, { v: 5, label: "5" },
  { v: 10, label: "10" }, { v: 20, label: "20" }, { v: 50, label: "50" },
  { v: 100, label: "100" }, { v: 500, label: "500" },
  { v: 1000, label: "1K" }, { v: 10000, label: "10K" },
  { v: 100000, label: "100K" },
  { v: -1, label: "-1" }, { v: -2, label: "-2" }, { v: -5, label: "-5" },
  { v: -10, label: "-10" }, { v: -20, label: "-20" }, { v: -50, label: "-50" },
  { v: -100, label: "-100" }, { v: -500, label: "-500" },
  { v: -1000, label: "-1K" }, { v: -10000, label: "-10K" },
  { v: -100000, label: "-100K" },
];

export function NumberLine({ solved, boundary, inequality, lineH = 500, infRef, negInfRef, boundaryRef }) {
  const isUp = inequality === ">" || inequality === ">=";
  const inclusive = inequality === ">=" || inequality === "<=";
  const boundaryY = valToY(boundary ?? 0, lineH);

  // Glow region: from boundary to top (>) or bottom (<)
  const glowTop = solved ? (isUp ? lineH : boundaryY) : 0;
  const glowBottom = solved ? (isUp ? boundaryY : 0) : 0;
  const glowH = glowTop - glowBottom;

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: 60, height: lineH }}
    >
      {/* Glow region */}
      {solved && glowH > 0 && (
        <div
          className="absolute right-3 rounded-sm transition-opacity duration-700"
          style={{
            width: 6,
            bottom: glowBottom,
            height: glowH,
            background: isUp
              ? "linear-gradient(to top, #f59e0b, #fbbf24 30%, rgba(251,191,36,0.15))"
              : "linear-gradient(to bottom, #f59e0b, #fbbf24 30%, rgba(251,191,36,0.15))",
            opacity: solved ? 1 : 0,
            boxShadow: "0 0 12px 4px rgba(251,191,36,0.3)",
          }}
        />
      )}

      {/* Main line */}
      <div
        className="absolute right-5 bg-border"
        style={{ width: 2, top: 8, bottom: 8 }}
      />

      {/* Infinity labels */}
      <span ref={infRef} className="absolute right-1 text-[9px] text-text-faint font-mono" style={{ top: 0 }}>
        ∞
      </span>
      <span ref={negInfRef} className="absolute right-1 text-[9px] text-text-faint font-mono" style={{ bottom: 0 }}>
        −∞
      </span>

      {/* Tick marks */}
      {TICKS.map((t) => {
        if (solved && boundary != null && t.v === boundary) return null;
        const y = valToY(t.v, lineH);
        return (
          <div key={t.v} className="absolute right-3" style={{ bottom: y, transform: "translateY(50%)" }}>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-text-muted font-mono whitespace-nowrap">
                {t.label}
              </span>
              <div className="bg-border-strong" style={{ width: 8, height: 1 }} />
            </div>
          </div>
        );
      })}

      {/* Boundary marker with label line */}
      {solved && boundary != null && (
        <div
          ref={boundaryRef}
          className="absolute z-10 flex items-center"
          style={{
            right: 10,
            bottom: boundaryY,
            transform: "translateY(50%)",
          }}
        >
          {/* Label + line extending left */}
          <span
            className="text-[10px] font-bold font-mono text-accent whitespace-nowrap"
            style={{ marginRight: 3 }}
          >
            {boundary}
          </span>
          <div
            style={{
              width: 12,
              height: 1,
              background: "#f59e0b",
              flexShrink: 0,
            }}
          />
          {/* Circle */}
          <div
            className="rounded-full border-2 border-accent shrink-0"
            style={{
              width: 10,
              height: 10,
              background: inclusive ? "#f59e0b" : "var(--color-surface)",
            }}
          />
        </div>
      )}
    </div>
  );
}
