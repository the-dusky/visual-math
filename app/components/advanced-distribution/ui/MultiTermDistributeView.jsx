"use client";

import { useState, useRef, useEffect } from "react";
import { MysteryBox } from "../../algebra/ui/MysteryBox";
import { PillGroup } from "../../algebra/ui/Pill";
import { getTermColor } from "../colors";
import { distribute } from "../parser";

function buildArcPath(fromRef, toEl, containerRef) {
  if (!fromRef.current || !toEl || !containerRef.current) return "";
  const c = containerRef.current.getBoundingClientRect();
  const f = fromRef.current.getBoundingClientRect();
  const t = toEl.getBoundingClientRect();

  const x1 = f.left + f.width / 2 - c.left;
  const y1 = f.bottom - c.top;
  const x2 = t.left + t.width / 2 - c.left;
  const y2 = t.bottom - c.top;

  const cpY = Math.max(y1, y2) + 25;
  return `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${cpY} ${x2} ${y2}`;
}

const fmt = (n) => {
  const abs = Math.abs(n);
  return Number.isInteger(abs) ? String(abs) : parseFloat(abs.toFixed(4)).toString();
};

export function MultiTermDistributeView({ level, onComplete }) {
  const { multiplier, terms } = level;
  const termCount = terms.length;
  const absMult = Math.abs(multiplier);

  // Refs
  const containerRef = useRef(null);
  const multRef = useRef(null);
  const termRefs = useRef([]);

  // State
  const [phase, setPhase] = useState("arcs");
  const [arcsDone, setArcsDone] = useState(() => Array(termCount).fill(false));
  const [arcPaths, setArcPaths] = useState(() => Array(termCount).fill(""));

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverIdx, setHoverIdx] = useState(null);

  const allDone = arcsDone.every(Boolean);

  // Auto-transition: arcs → combine → done
  useEffect(() => {
    if (allDone && phase === "arcs") {
      const t = setTimeout(() => setPhase("combine"), 600);
      return () => clearTimeout(t);
    }
  }, [allDone, phase]);

  useEffect(() => {
    if (phase === "combine") {
      const t = setTimeout(() => { setPhase("done"); onComplete(); }, 900);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  // Hit test
  function hitTest(clientX, clientY) {
    const pad = 12;
    for (let i = 0; i < termCount; i++) {
      const el = termRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left - pad && clientX <= r.right + pad &&
          clientY >= r.top - pad && clientY <= r.bottom + pad) {
        return i;
      }
    }
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
    setHoverIdx(null);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const c = containerRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - c.left,
      y: e.clientY - c.top,
    });
    setHoverIdx(hitTest(e.clientX, e.clientY));
  }

  function onPointerUp(e) {
    if (!dragging) return;
    e.preventDefault();
    setDragging(false);
    setHoverIdx(null);

    const idx = hitTest(e.clientX, e.clientY);
    if (idx !== null && !arcsDone[idx]) {
      const path = buildArcPath(multRef, termRefs.current[idx], containerRef);
      setArcPaths(prev => { const n = [...prev]; n[idx] = path; return n; });
      setArcsDone(prev => { const n = [...prev]; n[idx] = true; return n; });
    }
  }

  // Live drag line
  let dragLinePath = "";
  if (dragging) {
    const { x: x1, y: y1 } = dragStart;
    const { x: x2, y: y2 } = dragPos;
    const cpY = Math.max(y1, y2) + 20;
    dragLinePath = `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${cpY} ${x2} ${y2}`;
  }

  // Distributed result terms
  const resultTerms = distribute(level);

  // Group rendering helpers
  const fullGroups = Math.floor(absMult);
  const hasHalf = absMult % 1 !== 0;
  const groupCount = fullGroups + (hasHalf ? 1 : 0);

  const showGroups = phase === "arcs" || phase === "combine";
  const showCombined = phase === "combine" || phase === "done";
  const combineStarted = phase === "combine" || phase === "done";

  function renderGroupContent(term, ti) {
    const color = getTermColor(term.variable);
    const absCoeff = Math.abs(term.coeff);
    const isNeg = term.coeff < 0;

    if (!term.variable) {
      // Constant term → pills or holes
      return isNeg
        ? <PillGroup key={ti} count={0} holes={absCoeff} />
        : <PillGroup key={ti} count={absCoeff} holes={0} />;
    }

    // Variable term → boxes
    return Array(absCoeff).fill(0).map((_, bi) => (
      <MysteryBox
        key={`${ti}-${bi}`}
        open={false}
        value={0}
        small={true}
        variable={term.variable}
        negCoeff={isNeg}
        varColorClass={color.text}
      />
    ));
  }

  function renderCombinedContent(term, ti) {
    const color = getTermColor(term.variable);
    const absCoeff = Math.abs(term.coeff);
    const isNeg = term.coeff < 0;

    if (!term.variable) {
      return isNeg
        ? <PillGroup key={ti} count={0} holes={absCoeff} />
        : <PillGroup key={ti} count={absCoeff} holes={0} />;
    }

    return Array(absCoeff).fill(0).map((_, bi) => (
      <MysteryBox
        key={`${ti}-${bi}`}
        open={false}
        value={0}
        small={true}
        variable={term.variable}
        negCoeff={isNeg}
        varColorClass={color.text}
      />
    ));
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-center gap-4 touch-none">
      {/* Equation text with draggable source + drop targets */}
      <div className="flex items-center gap-1 text-xl font-extrabold font-mono select-none flex-wrap justify-center">
        {/* Multiplier — drag source */}
        <span
          ref={multRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={`px-2 py-1 rounded-lg text-accent transition-all duration-200
            ${phase === "arcs" && !allDone
              ? "cursor-grab active:cursor-grabbing bg-accent/10 hover:bg-accent/20"
              : ""
            }`}
        >
          {multiplier < 0 ? `−${fmt(absMult)}` : fmt(absMult)}
        </span>
        <span className="text-text-muted">(</span>

        {terms.map((term, i) => {
          const color = getTermColor(term.variable);
          const absCoeff = Math.abs(term.coeff);
          const isFirst = i === 0;
          const sign = term.coeff < 0 ? "−" : (isFirst ? "" : "+");

          const label = term.variable
            ? (absCoeff === 1 ? term.variable : `${fmt(absCoeff)}${term.variable}`)
            : fmt(absCoeff);

          return (
            <span key={i} className="flex items-center gap-1">
              {(sign && (!isFirst || term.coeff < 0)) && (
                <span className="text-text-muted mx-0.5">{sign}</span>
              )}
              <span
                ref={el => termRefs.current[i] = el}
                className={`px-1.5 py-1 rounded-lg transition-all duration-200
                  ${arcsDone[i]
                    ? "text-ok"
                    : hoverIdx === i
                      ? `${color.text} scale-110 bg-surface-raised`
                      : `${color.text} bg-surface-raised`
                  }`}
              >
                {label}
              </span>
            </span>
          );
        })}

        <span className="text-text-muted">)</span>
      </div>

      {/* SVG overlay */}
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
        {/* Permanent arcs — each with its variable's stroke color */}
        {arcsDone.map((done, i) => done && arcPaths[i] && (
          <path
            key={i}
            d={arcPaths[i]}
            fill="none"
            stroke={getTermColor(terms[i].variable).stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-arc-draw"
          />
        ))}
      </svg>

      {/* Result labels below arcs */}
      <div className="flex items-center gap-3 text-sm font-bold font-mono flex-wrap justify-center">
        {resultTerms.map((rt, i) => {
          const color = getTermColor(rt.variable);
          const absCoeff = Math.abs(rt.coeff);
          const isFirst = i === 0;
          const sign = rt.coeff < 0 ? "−" : (isFirst ? "" : "+");
          const label = rt.variable
            ? (absCoeff === 1 ? rt.variable : `${fmt(absCoeff)}${rt.variable}`)
            : fmt(absCoeff);
          return (
            <span
              key={i}
              className={`px-2 py-0.5 rounded transition-all duration-300
                ${arcsDone[i] ? `opacity-100 ${color.text} border border-dashed` : "opacity-0"}`}
              style={arcsDone[i] ? { borderColor: color.stroke } : {}}
            >
              {(sign && (!isFirst || rt.coeff < 0)) ? `${sign} ` : ""}{label}
            </span>
          );
        })}
      </div>

      {/* Instruction */}
      {phase === "arcs" && !allDone && (
        <p className="text-[11px] text-text-muted text-center">
          Drag the {multiplier < 0 ? `−${fmt(absMult)}` : fmt(absMult)} to each term inside
        </p>
      )}

      {/* Physical groups */}
      <div
        className="transition-all duration-500"
        style={{
          opacity: showGroups && !combineStarted ? 1 : 0,
          transform: combineStarted ? "scale(0.9)" : "scale(1)",
          maxHeight: showGroups && !combineStarted ? 600 : 0,
          overflow: "hidden",
        }}
      >
        <div className={`flex gap-2 flex-wrap justify-center p-2 rounded-xl transition-all duration-300
          ${allDone ? "border border-dashed border-ok bg-ok/5" : ""}`}>
          {Array(groupCount).fill(0).map((_, gi) => {
            const isHalf = hasHalf && gi === groupCount - 1;
            return (
              <div
                key={gi}
                className="relative flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border bg-surface-overlay/40 overflow-hidden"
                style={{ minWidth: 60 }}
              >
                {terms.map((term, ti) => renderGroupContent(term, ti))}
                {/* Half-group overlay */}
                {isHalf && (
                  <>
                    <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed border-text-muted" />
                    <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-surface/70 pointer-events-none" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Combined result */}
      <div
        className="transition-all duration-500"
        style={{
          opacity: showCombined ? 1 : 0,
          transform: showCombined ? "scale(1)" : "scale(0.9)",
        }}
      >
        {showCombined && (
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-ok-dim bg-ok/5">
            <div className="flex gap-1 flex-wrap justify-center max-w-xs">
              {resultTerms.map((rt, ti) => renderCombinedContent(rt, ti))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
