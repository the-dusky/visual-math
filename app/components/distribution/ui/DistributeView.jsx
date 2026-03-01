"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MysteryBox } from "../../algebra/ui/MysteryBox";
import { PillGroup } from "../../algebra/ui/Pill";

/*
  Interactive distribution view:
  Student drags from the multiplier to each inner term.
  Releasing over a term draws a permanent arc and shows the product.
  After both arcs: groups combine, then parent transitions to equation solving.
*/

function buildArcPath(fromRef, toRef, containerRef) {
  if (!fromRef.current || !toRef.current || !containerRef.current) return "";
  const c = containerRef.current.getBoundingClientRect();
  const f = fromRef.current.getBoundingClientRect();
  const t = toRef.current.getBoundingClientRect();

  const x1 = f.left + f.width / 2 - c.left;
  const y1 = f.bottom - c.top;
  const x2 = t.left + t.width / 2 - c.left;
  const y2 = t.bottom - c.top;

  const cpY = Math.max(y1, y2) + 25;

  return `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${cpY} ${x2} ${y2}`;
}

export function DistributeView({
  multiplier, innerBoxes, innerPills, variable, boxValue,
  onComplete,
}) {
  const v = variable || "x";
  const fmt = (n) => Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(4)).toString();
  const absInnerPills = Math.abs(innerPills);
  const pillSign = innerPills >= 0 ? "+" : "−";

  const totalBoxes = multiplier * innerBoxes;
  const totalPills = multiplier * innerPills;
  const absTotalPills = Math.abs(totalPills);

  const boxLabel = totalBoxes === 1 ? v : `${totalBoxes}${v}`;
  const pillLabel = fmt(absTotalPills);

  // Phase: "arcs" → "combine" → "done"
  const [phase, setPhase] = useState("arcs");
  const [arcBoxDone, setArcBoxDone] = useState(false);
  const [arcPillDone, setArcPillDone] = useState(false);
  const [combineStarted, setCombineStarted] = useState(false);

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverTarget, setHoverTarget] = useState(null); // "box" | "pill" | null

  // Arc paths (computed once on completion)
  const [boxArcPath, setBoxArcPath] = useState("");
  const [pillArcPath, setPillArcPath] = useState("");

  const containerRef = useRef(null);
  const multRef = useRef(null);
  const termBoxRef = useRef(null);
  const termPillRef = useRef(null);

  const allArcsDone = arcBoxDone && arcPillDone;

  // Auto-transition from arcs → combine
  useEffect(() => {
    if (allArcsDone && phase === "arcs") {
      const t = setTimeout(() => {
        setPhase("combine");
        setCombineStarted(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [allArcsDone, phase]);

  // Auto-transition from combine → done
  useEffect(() => {
    if (phase === "combine" && combineStarted) {
      const t = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [phase, combineStarted, onComplete]);

  // Check if a point is over a target element
  function hitTest(clientX, clientY) {
    if (!termBoxRef.current || !termPillRef.current) return null;
    const boxRect = termBoxRef.current.getBoundingClientRect();
    const pillRect = termPillRef.current.getBoundingClientRect();
    // Expand hit area by 12px for easier targeting
    const pad = 12;
    if (
      clientX >= boxRect.left - pad && clientX <= boxRect.right + pad &&
      clientY >= boxRect.top - pad && clientY <= boxRect.bottom + pad
    ) return "box";
    if (
      clientX >= pillRect.left - pad && clientX <= pillRect.right + pad &&
      clientY >= pillRect.top - pad && clientY <= pillRect.bottom + pad
    ) return "pill";
    return null;
  }

  function onPointerDown(e) {
    if (phase !== "arcs") return;
    e.preventDefault();
    e.target.setPointerCapture?.(e.pointerId);
    const c = containerRef.current.getBoundingClientRect();
    const f = multRef.current.getBoundingClientRect();
    setDragging(true);
    setDragStart({
      x: f.left + f.width / 2 - c.left,
      y: f.bottom - c.top,
    });
    setDragPos({
      x: e.clientX - c.left,
      y: e.clientY - c.top,
    });
    setHoverTarget(null);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const c = containerRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - c.left,
      y: e.clientY - c.top,
    });
    setHoverTarget(hitTest(e.clientX, e.clientY));
  }

  function onPointerUp(e) {
    if (!dragging) return;
    e.preventDefault();
    setDragging(false);
    setHoverTarget(null);

    const target = hitTest(e.clientX, e.clientY);
    if (target === "box" && !arcBoxDone) {
      setBoxArcPath(buildArcPath(multRef, termBoxRef, containerRef));
      setArcBoxDone(true);
    } else if (target === "pill" && !arcPillDone) {
      setPillArcPath(buildArcPath(multRef, termPillRef, containerRef));
      setArcPillDone(true);
    }
  }

  // Build live drag line path
  let dragLinePath = "";
  if (dragging) {
    const { x: x1, y: y1 } = dragStart;
    const { x: x2, y: y2 } = dragPos;
    const cpY = Math.max(y1, y2) + 20;
    dragLinePath = `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${cpY} ${x2} ${y2}`;
  }

  const innerBoxLabel = innerBoxes === 1 ? v : `${innerBoxes}${v}`;

  const pillCount = innerPills >= 0 ? innerPills : 0;
  const holeCount = innerPills < 0 ? absInnerPills : 0;

  const showGroups = phase === "arcs" || (phase === "combine" && !combineStarted);
  const showCombined = phase === "combine" || phase === "done";

  return (
    <div ref={containerRef} className="relative flex flex-col items-center gap-4 touch-none">
      {/* Equation text with draggable source + drop targets */}
      <div className="flex items-center gap-1.5 text-xl font-extrabold font-mono select-none relative">
        {/* Multiplier — drag source */}
        <span
          ref={multRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={`px-2 py-1 rounded-lg text-accent transition-all duration-200
            ${phase === "arcs" && !allArcsDone
              ? "cursor-grab active:cursor-grabbing bg-accent/10 hover:bg-accent/20"
              : ""
            }`}
        >
          {multiplier}
        </span>
        <span className="text-text-muted">(</span>

        {/* Box term — drop target */}
        <span
          ref={termBoxRef}
          data-target="box"
          className={`px-2 py-1 rounded-lg transition-all duration-200
            ${arcBoxDone
              ? "text-ok"
              : hoverTarget === "box"
                ? "text-accent-bright bg-accent/20 scale-110"
                : phase === "arcs"
                  ? "text-accent-bright bg-surface-raised"
                  : "text-text"
            }`}
        >
          {innerBoxLabel}
        </span>

        <span className="text-text-muted">{pillSign}</span>

        {/* Pill term — drop target */}
        <span
          ref={termPillRef}
          data-target="pill"
          className={`px-2 py-1 rounded-lg transition-all duration-200
            ${arcPillDone
              ? "text-ok"
              : hoverTarget === "pill"
                ? "text-accent-bright bg-accent/20 scale-110"
                : phase === "arcs"
                  ? "text-accent-bright bg-surface-raised"
                  : "text-text"
            }`}
        >
          {fmt(absInnerPills)}
        </span>

        <span className="text-text-muted">)</span>
      </div>

      {/* SVG overlay — permanent arcs + live drag line */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible"
        style={{ zIndex: 10 }}
      >
        {/* Live drag line */}
        {dragging && dragLinePath && (
          <path
            d={dragLinePath}
            fill="none"
            stroke="rgba(245,158,11,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        )}
        {/* Permanent arcs */}
        {arcBoxDone && boxArcPath && (
          <path
            d={boxArcPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-arc-draw"
          />
        )}
        {arcPillDone && pillArcPath && (
          <path
            d={pillArcPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-arc-draw"
          />
        )}
      </svg>

      {/* Result labels below arcs */}
      <div className="flex items-center gap-6 text-sm font-bold font-mono h-6">
        <span className={`px-2 py-0.5 rounded transition-all duration-300 ${arcBoxDone ? "opacity-100 text-ok border border-dashed border-ok" : "opacity-0"}`}>
          {boxLabel}
        </span>
        <span className={`px-2 py-0.5 rounded transition-all duration-300 ${arcPillDone ? "opacity-100 text-ok border border-dashed border-ok" : "opacity-0"}`}>
          {pillSign} {pillLabel}
        </span>
      </div>

      {/* Instruction */}
      {phase === "arcs" && !allArcsDone && (
        <p className="text-[11px] text-text-muted text-center">
          Drag the {multiplier} to each term inside
        </p>
      )}

      {/* Mini groups */}
      <div
        className="transition-all duration-500"
        style={{
          opacity: showGroups && !combineStarted ? 1 : 0,
          transform: combineStarted ? "scale(0.9)" : "scale(1)",
          maxHeight: showGroups && !combineStarted ? 400 : 0,
          overflow: "hidden",
        }}
      >
        <div className={`flex gap-2 flex-wrap justify-center p-2 rounded-xl transition-all duration-300
          ${allArcsDone ? "border border-dashed border-ok bg-ok/5" : ""}`}>
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
                    open={false}
                    value={boxValue}
                    small={true}
                    variable={v}
                  />
                ))}
              </div>
              <PillGroup count={pillCount} holes={holeCount} />
            </div>
          ))}
        </div>
      </div>

      {/* Combined result (appears during combine phase) */}
      <div
        className="transition-all duration-500"
        style={{
          opacity: showCombined ? 1 : 0,
          transform: showCombined ? "scale(1)" : "scale(0.9)",
        }}
      >
        {showCombined && (
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-ok-dim bg-ok/5">
            <div className="flex gap-1 flex-wrap justify-center max-w-[280px]">
              {Array(totalBoxes).fill(0).map((_, bi) => (
                <MysteryBox
                  key={bi}
                  open={false}
                  value={boxValue}
                  small={true}
                  variable={v}
                />
              ))}
            </div>
            <PillGroup count={totalPills >= 0 ? totalPills : 0} holes={totalPills < 0 ? absTotalPills : 0} />
          </div>
        )}
      </div>
    </div>
  );
}
