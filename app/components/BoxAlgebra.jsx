"use client";

import { useState, useEffect, useRef } from "react";

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// ── Parser ──
function parseEquation(input) {
  const s = input.replace(/\s+/g, "").replace(/−/g, "-").replace(/×/g, "*").replace(/÷/g, "/");
  const divMatch = s.match(/^([a-zA-Z])\/(\d+)=(\d+)$/);
  if (divMatch) {
    const v = divMatch[1], d = parseInt(divMatch[2]), c = parseInt(divMatch[3]), xVal = d * c;
    if (d <= 0 || c <= 0 || xVal > 50) return null;
    return { type: "multiply", boxValue: xVal, initBoxes: 1, initPills: 0, initSlots: 0, rightPills: c, divisor: d, variable: v };
  }
  const match = s.match(/^(\d*)([a-zA-Z])([+-]\d+)?=(\d+)$/);
  if (!match) return null;
  const a = match[1] ? parseInt(match[1]) : 1, v = match[2], bRaw = match[3] ? parseInt(match[3]) : 0, c = parseInt(match[4]);
  if (isNaN(a) || isNaN(c) || a <= 0 || c < 0) return null;
  const xVal = (c - bRaw) / a;
  if (xVal <= 0 || !Number.isInteger(xVal) || xVal > 50 || c > 50) return null;
  const b = Math.abs(bRaw);
  if (a === 1 && bRaw > 0) return { type: "addition", boxValue: xVal, initBoxes: 1, initPills: b, initSlots: 0, rightPills: c, variable: v };
  if (a === 1 && bRaw < 0) return { type: "subtraction", boxValue: xVal, initBoxes: 1, initPills: 0, initSlots: b, rightPills: c, variable: v };
  if (a === 1) return null;
  if (a > 1 && bRaw === 0) return { type: "division", boxValue: xVal, initBoxes: a, initPills: 0, initSlots: 0, rightPills: c, variable: v };
  if (a > 1 && bRaw > 0) return { type: "twostep", boxValue: xVal, initBoxes: a, initPills: b, initSlots: 0, rightPills: c, variable: v };
  if (a > 1 && bRaw < 0) return { type: "twostep_sub", boxValue: xVal, initBoxes: a, initPills: 0, initSlots: b, rightPills: c, variable: v };
  return null;
}

function levelEq(l) {
  const v = l.variable || "x";
  if (l.type === "addition") return `${v} + ${l.initPills} = ${l.rightPills}`;
  if (l.type === "subtraction") return `${v} − ${l.initSlots} = ${l.rightPills}`;
  if (l.type === "division") return `${l.initBoxes}${v} = ${l.rightPills}`;
  if (l.type === "multiply") return `${v}/${l.divisor} = ${l.rightPills}`;
  if (l.type === "twostep") return `${l.initBoxes}${v} + ${l.initPills} = ${l.rightPills}`;
  if (l.type === "twostep_sub") return `${l.initBoxes}${v} − ${l.initSlots} = ${l.rightPills}`;
  return "";
}

const PRESET_LEVELS = [
  { type: "addition", boxValue: 5, initBoxes: 1, initPills: 3, initSlots: 0, rightPills: 8, variable: "x" },
  { type: "subtraction", boxValue: 8, initBoxes: 1, initPills: 0, initSlots: 3, rightPills: 5, variable: "x" },
  { type: "addition", boxValue: 7, initBoxes: 1, initPills: 5, initSlots: 0, rightPills: 12, variable: "x" },
  { type: "division", boxValue: 5, initBoxes: 3, initPills: 0, initSlots: 0, rightPills: 15, variable: "x" },
  { type: "multiply", boxValue: 12, initBoxes: 1, initPills: 0, initSlots: 0, rightPills: 3, divisor: 4, variable: "x" },
  { type: "twostep", boxValue: 4, initBoxes: 2, initPills: 3, initSlots: 0, rightPills: 11, variable: "x" },
];

// ── Pill ──
function Pill({ small, disabled }) {
  const sz = small ? 20 : 28;
  return <div style={{ width: sz, height: sz, borderRadius: "50%", background: "linear-gradient(135deg, #fbbf24, #f59e0b 50%, #d97706)", boxShadow: "0 2px 4px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.3)", opacity: disabled ? 0.6 : 1, flexShrink: 0 }} />;
}

function PillGroup({ count, small }) {
  if (count <= 0) return null;
  const show = Math.min(count, 30);
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center", maxWidth: 200 }}>
      {Array(show).fill(0).map((_, i) => <Pill key={i} small={small} disabled />)}
      {count > 30 && <span style={{ fontSize: 10, color: "#64748b" }}>+{count - 30}</span>}
    </div>
  );
}

// ── Hole ──
function HoleDot({ filled, size }) {
  const sz = size || 18;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: "50%",
      background: filled
        ? "linear-gradient(135deg, #fbbf24, #d97706)"
        : "radial-gradient(circle at 50% 60%, #0a0a0a 0%, #1a1a1a 60%, #2a2a2a 100%)",
      border: filled ? `${Math.max(1, sz/18)}px solid #b45309` : `${Math.max(1, sz/12)}px solid #444`,
      boxShadow: filled
        ? `0 1px ${sz/6}px rgba(0,0,0,0.3), inset 0 1px ${sz/9}px rgba(255,255,255,0.3)`
        : `inset 0 ${-Math.max(1, sz/18)}px 0px ${Math.max(1, sz/6)}px rgba(0,0,0,0.7)`,
      flexShrink: 0,
    }} />
  );
}

// ── Mystery Box ──
function MysteryBox({ open, value, small, holeCount, filledHoles, sliceLines, variable, onClickVar, showPicker, onPickVar, onClosePicker, greyed, activeSlice }) {
  const sz = small ? 56 : 86;
  const v = variable || "x";
  const holes = holeCount || 0;
  const filled = Math.min(filledHoles || 0, holes);
  const lines = sliceLines || 1;
  const showSliceGreying = activeSlice && lines > 1 && !open;
  const showLines = lines > 1 && !open && !greyed;
  const bleed = 10; // how far lines extend past box

  // Scale hole size to fit inside the box
  const boxInner = sz - 16;
  let holeSize = 16;
  const holeGap = 2;
  if (holes > 0) {
    const availArea = boxInner * boxInner * 0.55;
    const idealWithGap = Math.sqrt(availArea / holes);
    const idealSize = idealWithGap - holeGap;
    holeSize = Math.max(3, Math.min(16, Math.floor(idealSize)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      {/* Container for box + bleed lines */}
      <div style={{ position: "relative", width: sz + bleed * 2, height: sz }}>
        {/* The box itself */}
        <div style={{
          position: "absolute", left: bleed, top: 0,
          width: sz, height: sz, borderRadius: 14,
          background: greyed
            ? "linear-gradient(135deg, #4a4a4a, #3a3a3a 40%, #2a2a2a)"
            : open ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "linear-gradient(135deg, #a16207, #854d0e 40%, #713f12)",
          border: `3px solid ${greyed ? "#555" : open ? "#d97706" : "#a16207"}`,
          boxShadow: greyed
            ? "0 2px 6px rgba(0,0,0,0.2)"
            : open ? "0 0 24px rgba(251,191,36,0.5)" : "0 4px 12px rgba(0,0,0,0.35), inset 0 1px 3px rgba(255,255,255,0.15)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: open ? "scale(1.05)" : "scale(1)",
          overflow: "hidden",
          opacity: greyed ? 0.35 : 1,
        }}>
          {/* Greyed section overlays inside the box */}
          {showSliceGreying && Array(lines).fill(0).map((_, i) => {
            const sectionH = 100 / lines;
            const isActive = i === 0;
            return (
              <div key={`s${i}`} style={{
                position: "absolute", left: 0, right: 0,
                top: `${i * sectionH}%`, height: `${sectionH}%`,
                background: isActive ? "transparent" : "rgba(0,0,0,0.55)",
                pointerEvents: "none", zIndex: 1,
                transition: "background 0.4s ease",
              }} />
            );
          })}

          {open ? (
            <span style={{ fontSize: small ? 20 : 28, fontWeight: 800, color: "#92400e", zIndex: 2 }}>{value}</span>
          ) : (
            <span onClick={greyed ? undefined : onClickVar} style={{
              fontSize: small ? 22 : 34, fontWeight: 700, color: greyed ? "#666" : "#fbbf24",
              fontFamily: "'Courier New', monospace", cursor: (onClickVar && !greyed) ? "pointer" : "default",
              textShadow: greyed ? "none" : "0 0 12px rgba(251,191,36,0.3)", userSelect: "none", zIndex: 2,
            }}>{v}</span>
          )}
          {holes > 0 && !open && !greyed && (
            <div style={{ display: "flex", gap: holeSize <= 5 ? 1 : 2, flexWrap: "wrap", justifyContent: "center", maxWidth: sz - 14, zIndex: 2 }}>
              {Array(holes).fill(0).map((_, i) => <HoleDot key={`h${i}`} filled={i < filled} size={holeSize} />)}
            </div>
          )}
        </div>

        {/* Slice lines that bleed past the box edges */}
        {showLines && Array(lines - 1).fill(0).map((_, i) => {
          const y = ((i + 1) / lines) * sz;
          return (
            <div key={`cut${i}`} style={{
              position: "absolute", left: 0, right: 0, top: y,
              height: 0,
              borderTop: "2px dashed rgba(251,191,36,0.5)",
              pointerEvents: "none", zIndex: 3,
            }} />
          );
        })}
      </div>

      {showPicker && <VarPicker current={v} onPick={onPickVar} onClose={onClosePicker} />}
    </div>
  );
}

function VarPicker({ current, onPick, onClose }) {
  return (
    <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 6, zIndex: 100, background: "#1e293b", border: "2px solid #334155", borderRadius: 12, padding: "8px 10px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 200, justifyContent: "center" }}>
      {"abcdefghijklmnopqrstuvwxyz".split("").map(l => (
        <button key={l} onClick={() => { onPick(l); onClose(); }} style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: l === current ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#0f172a", color: l === current ? "#0f172a" : "#94a3b8", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>{l}</button>
      ))}
    </div>
  );
}

function Frac({ top, bottom, size }) {
  const fs = size || 20;
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 3px", lineHeight: 1 }}>
      <span style={{ fontSize: fs, fontWeight: 800, fontFamily: "'Courier New', monospace", color: "inherit" }}>{top}</span>
      <span style={{ width: "110%", height: 2, background: "currentColor", borderRadius: 1 }} />
      <span style={{ fontSize: fs, fontWeight: 800, fontFamily: "'Courier New', monospace", color: "inherit" }}>{bottom}</span>
    </span>
  );
}

function EquationDisplay({ text, varName, size }) {
  // Parse fraction notation like "x/3" and render as stacked fractions
  const fs = size || 22;
  // Split on spaces and = to find fraction tokens
  const parts = text.split(/(\s+|(?<==)|(?==))/g).filter(Boolean);

  return (
    <span style={{ fontSize: fs, fontWeight: 800, color: "#e2e8f0", fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>
      {parts.map((part, i) => {
        const fracMatch = part.match(/^(\d*[a-zA-Z]?)\/(\d+)$/);
        if (fracMatch) {
          return <Frac key={i} top={fracMatch[1]} bottom={fracMatch[2]} size={fs * 0.75} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ── Op Picker (under each side) ──
function OpPicker({ active, locked, lockedOp, lockedNum, onSubmit, label, side }) {
  const [op, setOp] = useState(null);
  const [num, setNum] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (active && op && ref.current) ref.current.focus();
  }, [active, op]);

  if (locked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "6px 0" }}>
        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, fontFamily: "'Courier New', monospace" }}>{lockedOp}{lockedNum}</span>
      </div>
    );
  }
  if (!active) {
    return (
      <div style={{ padding: "8px 0", textAlign: "center" }}>
        <span style={{ fontSize: 10, color: "#334155" }}>{label}</span>
      </div>
    );
  }
  function go() {
    const n = parseInt(num);
    if (!op || isNaN(n) || n <= 0) return;
    onSubmit(op, n);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "6px 0" }}>
      <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {["−", "+", "×", "÷"].map(o => (
          <button key={o} onClick={() => setOp(o)} style={{
            width: 30, height: 30, borderRadius: 8, border: "none",
            background: op === o ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#1e293b",
            color: op === o ? "#0f172a" : "#64748b", fontSize: 15, fontWeight: 800, cursor: "pointer",
          }}>{o}</button>
        ))}
        <input ref={ref} type="number" value={num} onChange={(e) => setNum(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") go(); }}
          placeholder="?" style={{ width: 40, height: 30, borderRadius: 8, border: "2px solid #334155", background: "rgba(15,23,42,0.8)", color: "#fbbf24", fontSize: 15, fontWeight: 800, textAlign: "center", fontFamily: "'Courier New', monospace", outline: "none" }} />
        <button onClick={go} style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 11 }}>Go</button>
      </div>
    </div>
  );
}

// ── Completed Steps ──
function StepLog({ steps }) {
  return (
    <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: 14, border: "2px solid #1e293b", padding: "10px 16px", marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: steps.length ? 6 : 0 }}>Steps</div>
      {steps.length === 0 && <div style={{ fontSize: 11, color: "#1e293b", fontStyle: "italic" }}>Your moves appear here</div>}
      {steps.map((s, i) => {
        const isFinal = s.includes("=") && !s.includes("both");
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: isFinal ? "#059669" : "#1e293b", border: `2px solid ${isFinal ? "#10b981" : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: isFinal ? "white" : "#64748b", flexShrink: 0 }}>{isFinal ? "★" : i + 1}</div>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: isFinal ? 15 : 13, fontWeight: isFinal ? 800 : 600, color: isFinal ? "#4ade80" : "#94a3b8" }}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── EXPLORE MODE ──
function ExploreMode({ level, onNext, hasNext }) {
  const [varName, setVarName] = useState(level.variable || "x");
  const [showPicker, setShowPicker] = useState(false);

  // Left side state
  const [boxCount, setBoxCount] = useState(level.initBoxes);
  const [sliceLines, setSliceLines] = useState(level.type === "multiply" ? level.divisor : 1);
  const [loosePills, setLoosePills] = useState(level.initPills);
  const [holeCount, setHoleCount] = useState(level.initSlots);
  const [filledHoles, setFilledHoles] = useState(0);

  // Right side state
  const [rPills, setRPills] = useState(level.rightPills);

  // Phase
  const [phase, setPhase] = useState("left"); // left | right | unbalanced | solved
  const [boxOpen, setBoxOpen] = useState(false);
  const [showCeleb, setShowCeleb] = useState(false);

  // Applied ops this round
  const [leftOp, setLeftOp] = useState(null);
  const [leftNum, setLeftNum] = useState(null);
  const [rightError, setRightError] = useState("");
  const [leftError, setLeftError] = useState("");

  // Snapshot for undo
  const [snap, setSnap] = useState(null);

  // Completed steps (shown retroactively)
  const [steps, setSteps] = useState([]);

  // Key to force re-mount OpPicker
  const [opKey, setOpKey] = useState(0);

  const unfilled = holeCount - filledHoles;
  const isSolved = boxCount === 1 && sliceLines === 1 && loosePills === 0 && unfilled === 0;

  function applyToLeft(op, n) {
    // Save state for undo
    setSnap({ boxCount, sliceLines, loosePills, holeCount, filledHoles, rPills });
    setLeftError("");

    // Validate divide distributes evenly
    if (op === "÷") {
      if (loosePills > 0 && loosePills % n !== 0) {
        setLeftError(`${loosePills} pills don't split evenly by ${n}`);
        return;
      }
      if (unfilled > 0 && unfilled % n !== 0) {
        setLeftError(`${unfilled} holes don't split evenly by ${n}`);
        return;
      }
    }
    // Validate multiply doesn't explode
    if (op === "×" && boxCount * n > 20) {
      setLeftError(`${boxCount * n} boxes — too many!`);
      return;
    }

    if (op === "+") {
      // Fill holes first, remainder becomes loose pills
      const fillable = Math.min(n, unfilled);
      setFilledHoles(f => f + fillable);
      setLoosePills(p => p + (n - fillable));
    } else if (op === "−") {
      // Remove loose pills first, remainder becomes new holes
      const removable = Math.min(n, loosePills);
      setLoosePills(p => p - removable);
      const newHoles = n - removable;
      setHoleCount(h => h + newHoles);
    } else if (op === "×") {
      // Distribute: n(ax + p - h) = nax + np - nh
      let newNum = boxCount * n, newDen = sliceLines;
      const g = gcd(newNum, newDen);
      setBoxCount(newNum / g);
      setSliceLines(newDen / g);
      setLoosePills(p => p * n);
      setHoleCount(h => h * n);
      setFilledHoles(f => f * n);
    } else if (op === "÷") {
      // Distribute: (ax + p - h)/n — only works if pills & holes divide evenly
      let newNum = boxCount, newDen = sliceLines * n;
      const g = gcd(newNum, newDen);
      setBoxCount(newNum / g);
      setSliceLines(newDen / g);
      setLoosePills(p => Math.round(p / n));
      setHoleCount(h => Math.round(h / n));
      setFilledHoles(f => Math.round(f / n));
    }

    setLeftOp(op);
    setLeftNum(n);
    setPhase("right");
  }

  function applyToRight(op, n) {
    setRightError("");

    // Validate
    if (op === "−" && n > rPills) { setRightError("Not enough pills!"); return; }
    if (op === "÷" && (rPills % n !== 0)) { setRightError(`${rPills} doesn't divide evenly by ${n}`); return; }
    if (op === "×" && rPills * n > 200) { setRightError("Too many pills!"); return; }

    // Check balance BEFORE applying
    if (op === leftOp && n === leftNum) {
      // Balanced! Apply to right
      let newR = rPills;
      if (op === "+") newR += n;
      else if (op === "−") newR -= n;
      else if (op === "×") newR *= n;
      else if (op === "÷") newR /= n;
      setRPills(newR);

      // Check if solved after this move
      // React state is async, so compute manually
      let bC = boxCount, sL = sliceLines, lP = loosePills, hC = holeCount, fH = filledHoles;
      if (leftOp === "+") { const fillable = Math.min(leftNum, hC - fH); fH += fillable; lP += (leftNum - fillable); }
      else if (leftOp === "−") { const removable = Math.min(leftNum, lP); lP -= removable; hC += (leftNum - removable); }
      else if (leftOp === "×") { let nn = bC * leftNum, nd = sL; const g = gcd(nn, nd); bC = nn/g; sL = nd/g; lP *= leftNum; hC *= leftNum; fH *= leftNum; }
      else if (leftOp === "÷") { let nn = bC, nd = sL * leftNum; const g = gcd(nn, nd); bC = nn/g; sL = nd/g; lP = Math.round(lP / leftNum); hC = Math.round(hC / leftNum); fH = Math.round(fH / leftNum); }

      if (bC === 1 && sL === 1 && lP === 0 && (hC - fH) === 0) {
        setBoxOpen(true);
        setPhase("solved");
        setSteps(s => [...s, `${op}${n} both sides`, `${varName} = ${newR}`]);
        setShowCeleb(true);
        setTimeout(() => setShowCeleb(false), 3000);
      } else {
        setSteps(s => [...s, `${op}${n} both sides`]);
        setLeftOp(null); setLeftNum(null);
        setPhase("left");
        setOpKey(k => k + 1);
      }
    } else {
      // Unbalanced! Apply to right visually, then show error
      if (op === "+") setRPills(r => r + n);
      else if (op === "−") setRPills(r => r - n);
      else if (op === "×") setRPills(r => r * n);
      else if (op === "÷") setRPills(r => Math.round(r / n));

      setPhase("unbalanced");
    }
  }

  function undo() {
    if (snap) {
      setBoxCount(snap.boxCount); setSliceLines(snap.sliceLines);
      setLoosePills(snap.loosePills); setHoleCount(snap.holeCount);
      setFilledHoles(snap.filledHoles); setRPills(snap.rPills);
    }
    setLeftOp(null); setLeftNum(null); setRightError(""); setLeftError("");
    setPhase("left"); setOpKey(k => k + 1);
  }

  function fullReset() {
    setBoxCount(level.initBoxes); setSliceLines(level.type === "multiply" ? level.divisor : 1);
    setLoosePills(level.initPills); setHoleCount(level.initSlots); setFilledHoles(0);
    setRPills(level.rightPills); setPhase("left"); setBoxOpen(false); setShowCeleb(false);
    setSteps([]); setSnap(null); setLeftOp(null); setLeftNum(null); setRightError(""); setLeftError("");
    setOpKey(k => k + 1);
  }

  // Build live equation string
  let eqLeft = "";
  if (boxCount > 1 && sliceLines > 1) eqLeft = `${boxCount}${varName}/${sliceLines}`;
  else if (sliceLines > 1) eqLeft = `${varName}/${sliceLines}`;
  else if (boxCount > 1) eqLeft = `${boxCount}${varName}`;
  else eqLeft = varName;
  if (loosePills > 0) eqLeft += ` + ${loosePills}`;
  if (unfilled > 0) eqLeft += ` − ${unfilled}`;
  const liveEq = `${eqLeft} = ${rPills}`;

  return (
    <div style={{ position: "relative" }} onClick={() => showPicker && setShowPicker(false)}>
      {showCeleb && <Celeb />}

      {/* Live equation */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <EquationDisplay text={liveEq} size={20} />
      </div>

      {/* Board */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 10, marginBottom: 14 }}>
        {/* LEFT SIDE */}
        <div style={{ flex: 1, background: phase === "unbalanced" ? "rgba(239,68,68,0.06)" : "rgba(15,23,42,0.6)", borderRadius: 20, padding: 12, border: `2px solid ${phase === "unbalanced" ? "#7f1d1d" : "#1e293b"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.3s ease" }}>
          <span style={{ fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Left</span>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
            {(() => {
              // After ÷, show greyed-out extras for multi-box, or activeSlice for slice-based
              const didDivide = phase === "right" && leftOp === "÷" && snap;
              const showGreyedBoxes = didDivide && snap.boxCount > boxCount;
              const showActiveSlice = didDivide && sliceLines > (snap.sliceLines || 1);
              const activeCount = boxCount;
              const totalShow = showGreyedBoxes ? snap.boxCount : boxCount;
              return Array(totalShow).fill(0).map((_, i) => (
                <MysteryBox key={i} open={boxOpen} value={level.boxValue} small={totalShow > 2}
                  holeCount={i === 0 ? holeCount : 0} filledHoles={i === 0 ? filledHoles : 0}
                  sliceLines={sliceLines} variable={varName}
                  greyed={showGreyedBoxes && i >= activeCount}
                  activeSlice={showActiveSlice && i < activeCount}
                  onClickVar={i === 0 ? (e) => { e.stopPropagation(); setShowPicker(p => !p); } : undefined}
                  showPicker={showPicker && i === 0} onPickVar={setVarName} onClosePicker={() => setShowPicker(false)} />
              ));
            })()}
          </div>
          <PillGroup count={loosePills} small={loosePills > 8} />

          <OpPicker key={`L${opKey}`} active={phase === "left"} locked={leftOp !== null && phase !== "left"}
            lockedOp={leftOp} lockedNum={leftNum}
            onSubmit={applyToLeft} label="Do something to this side" side="left" />
          {leftError && <span style={{ fontSize: 11, color: "#f87171", textAlign: "center" }}>{leftError}</span>}
        </div>

        {/* EQUALS */}
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 900, color: phase === "unbalanced" ? "#ef4444" : "#334155", userSelect: "none", flexShrink: 0, transition: "color 0.3s ease" }}>
          {phase === "unbalanced" ? "≠" : "="}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ flex: 1, background: phase === "unbalanced" ? "rgba(239,68,68,0.06)" : "rgba(15,23,42,0.6)", borderRadius: 20, padding: 12, border: `2px solid ${phase === "unbalanced" ? "#7f1d1d" : "#1e293b"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.3s ease" }}>
          <span style={{ fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Right</span>
          <PillGroup count={rPills} small={rPills > 8} />

          <OpPicker key={`R${opKey}`} active={phase === "right"} locked={false}
            onSubmit={applyToRight} label="Now do the same here" side="right" />
          {rightError && <span style={{ fontSize: 11, color: "#f87171", textAlign: "center" }}>{rightError}</span>}
        </div>
      </div>

      {/* Unbalanced warning */}
      {phase === "unbalanced" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px", borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "2px solid #7f1d1d", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 700, textAlign: "center" }}>
            Left got {leftOp}{leftNum} but right didn't get the same — not balanced!
          </span>
          <button onClick={undo} style={{ padding: "6px 20px", borderRadius: 20, border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>↩ Undo</button>
        </div>
      )}

      {/* Solved */}
      {phase === "solved" && (
        <div style={{ textAlign: "center", padding: "14px 18px", background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))", borderRadius: 14, border: "2px solid #166534", marginBottom: 14 }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#4ade80", margin: 0 }}>🎉 {varName} = {level.boxValue}</p>
        </div>
      )}

      <StepLog steps={steps} />

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={fullReset} style={resetBtnStyle}>Reset</button>
        {phase === "solved" && hasNext && <button onClick={onNext} style={nextBtnStyle}>Next →</button>}
      </div>
    </div>
  );
}

// ── SOLVE MODE ──
function SolveMode({ level, onNext, hasNext }) {
  const isSubFirst = level.type === "subtraction" || level.type === "twostep_sub";
  const isTwoStep = level.type === "twostep" || level.type === "twostep_sub";
  const isMulType = level.type === "multiply";
  const isDivType = level.type === "division";
  const needsBoxStep = isDivType || isMulType;
  const [varName, setVarName] = useState(level.variable || "x");
  const [showPicker, setShowPicker] = useState(false);

  const [boxCount, setBoxCount] = useState(level.initBoxes);
  const [sliceLines, setSliceLines] = useState(isMulType ? level.divisor : 1);
  const [loosePills, setLoosePills] = useState(level.initPills);
  const [holeCount, setHoleCount] = useState(level.initSlots);
  const [filledHoles, setFilledHoles] = useState(0);
  const [rPills, setRPills] = useState(level.rightPills);
  const [boxOpen, setBoxOpen] = useState(false);
  const [showCeleb, setShowCeleb] = useState(false);
  const [steps, setSteps] = useState([]);
  const solved = boxOpen;

  // Visual for wrong answers
  const [visBoxCount, setVisBoxCount] = useState(level.initBoxes);
  const [visSliceLines, setVisSliceLines] = useState(isMulType ? level.divisor : 1);
  const [visRPills, setVisRPills] = useState(level.rightPills);
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [visSplitBoxes, setVisSplitBoxes] = useState(null);
  const [visSplitCount, setVisSplitCount] = useState(null);

  const initPhase = needsBoxStep ? "boxOp" : "left";
  const [solvePhase, setSolvePhase] = useState(initPhase);
  const [stepIndex, setStepIndex] = useState(0);

  const [boxOpChoice, setBoxOpChoice] = useState(null);
  const [boxOpNum, setBoxOpNum] = useState(""); const [boxOpError, setBoxOpError] = useState(""); const [boxOpDone, setBoxOpDone] = useState(false);
  const [perBoxInput, setPerBoxInput] = useState(""); const [perBoxError, setPerBoxError] = useState("");
  const [leftOp, setLeftOp] = useState(isSubFirst ? "+" : "−"); const [leftNum, setLeftNum] = useState(""); const [leftError, setLeftError] = useState(""); const [leftDone, setLeftDone] = useState(false);
  const [rightOp, setRightOp] = useState(isSubFirst ? "+" : "−"); const [rightNum, setRightNum] = useState(""); const [rightError, setRightError] = useState(""); const [rightDone, setRightDone] = useState(false);
  const [computeVal, setComputeVal] = useState(""); const [computeError, setComputeError] = useState("");

  const leftRef = useRef(null); const rightRef = useRef(null); const computeRef = useRef(null);
  const boxNumRef = useRef(null); const perBoxRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => {
    if (solvePhase === "left" && leftRef.current) leftRef.current.focus();
    if (solvePhase === "right" && rightRef.current) rightRef.current.focus();
    if (solvePhase === "compute" && computeRef.current) computeRef.current.focus();
    if (solvePhase === "boxOp" && boxOpChoice && boxNumRef.current) boxNumRef.current.focus();
    if (solvePhase === "perBox" && perBoxRef.current) perBoxRef.current.focus();
    if (solvePhase === "finalAnswer" && computeRef.current) computeRef.current.focus();
  }, 100); return () => clearTimeout(t); }, [solvePhase, stepIndex, boxOpChoice]);

  function getExp() {
    if (level.type === "addition") return { op: "−", num: level.initPills, rBefore: level.rightPills, rAfter: level.boxValue };
    if (level.type === "subtraction") return { op: "+", num: level.initSlots, rBefore: level.rightPills, rAfter: level.boxValue };
    if (level.type === "division") return { op: "÷", num: level.initBoxes, rBefore: level.rightPills, rAfter: level.boxValue };
    if (level.type === "multiply") return { op: "×", num: level.divisor, rBefore: level.rightPills, rAfter: level.boxValue };
    if (level.type === "twostep") { const m = level.rightPills - level.initPills; return stepIndex === 0 ? { op: "−", num: level.initPills, rBefore: level.rightPills, rAfter: m } : { op: "÷", num: level.initBoxes, rBefore: m, rAfter: level.boxValue }; }
    if (level.type === "twostep_sub") { const m = level.rightPills + level.initSlots; return stepIndex === 0 ? { op: "+", num: level.initSlots, rBefore: level.rightPills, rAfter: m } : { op: "÷", num: level.initBoxes, rBefore: m, rAfter: level.boxValue }; }
    return null;
  }
  const exp = getExp();
  const isDivStep = exp && (exp.op === "÷" || exp.op === "×");

  function submitBoxOp() {
    const n = parseInt(boxOpNum); if (isNaN(n) || n <= 0) { setBoxOpError("Enter a number"); return; }
    if (boxOpChoice === exp.op && n === exp.num) {
      setBoxOpError(""); setBoxOpDone(true); setWrongAnswer(null);
      if (exp.op === "÷") {
        setVisSplitBoxes(n); setVisSplitCount(rPills / n);
        setSteps(s => [...s, `÷${n} both sides`]);
        setSolvePhase("perBox"); return;
      } else {
        setVisSliceLines(1); setVisRPills(rPills * n); setRPills(rPills * n);
        setSteps(s => [...s, `×${n} both sides`]);
        setSolvePhase("boxCompute"); return;
      }
    }
    setBoxOpError("");
    if (boxOpChoice === "×") {
      const nc = visBoxCount * n; if (nc > 20) { setBoxOpError("Too many!"); return; }
      setVisBoxCount(nc); setVisRPills(rPills * n);
      setWrongAnswer({ desc: `${nc} boxes now — more, not one ${varName}!` });
    } else {
      const ns = visSliceLines * n;
      setVisSliceLines(ns); setVisRPills(Math.max(1, Math.round(rPills / n)));
      setWrongAnswer({ desc: isDivType ? `Each box sliced ÷${n} — fragments!` : `Box now ÷${ns} — even smaller!` });
    }
    setBoxOpNum("");
  }

  function undoWrong() {
    setWrongAnswer(null); setVisBoxCount(boxCount); setVisSliceLines(sliceLines); setVisRPills(rPills);
    setVisSplitBoxes(null); setVisSplitCount(null); setBoxOpChoice(null); setBoxOpNum(""); setBoxOpError("");
  }

  function submitPerBox() { const a = parseInt(perBoxInput); if (isNaN(a)) { setPerBoxError("?"); return; } if (a !== exp.rAfter) { setPerBoxError(`What is ${rPills} ÷ ${exp.num}?`); return; } setPerBoxError(""); setSolvePhase("finalAnswer"); setComputeVal(""); }
  function submitBoxCompute() { const a = parseInt(computeVal); if (isNaN(a)) { setComputeError("?"); return; } if (a !== level.boxValue) { setComputeError(`What is ${level.rightPills} × ${level.divisor}?`); return; } setComputeError(""); setSolvePhase("finalAnswer"); setComputeVal(""); }

  function submitLeft() {
    const n = parseInt(leftNum); if (isNaN(n) || n <= 0) { setLeftError("Enter a number"); return; }
    if (leftOp !== exp.op || n !== exp.num) { setLeftError(leftOp !== exp.op ? "Think about what undoes what you see" : "Right op! Check the number"); return; }
    setLeftError(""); setLeftDone(true); setSolvePhase("right"); setRightOp(exp.op);
  }
  function submitRight() {
    const n = parseInt(rightNum); if (isNaN(n) || n <= 0) { setRightError("Enter a number"); return; }
    if (rightOp !== exp.op || n !== exp.num) { setRightError("Both sides need the same!"); return; }
    setRightError(""); setRightDone(true);
    if (exp.op === "−") { setLoosePills(0); setRPills(exp.rAfter); setVisRPills(exp.rAfter); }
    else if (exp.op === "+") { setFilledHoles(holeCount); setRPills(exp.rAfter); setVisRPills(exp.rAfter); }
    setSteps(s => [...s, `${exp.op}${exp.num} both sides`]);
    setSolvePhase("compute");
  }
  function submitCompute() {
    const a = parseInt(computeVal); if (isNaN(a)) { setComputeError("?"); return; } if (a !== exp.rAfter) { setComputeError("Not quite!"); return; }
    setComputeError("");
    if (isTwoStep && stepIndex === 0) {
      setStepIndex(1); setLeftOp("÷"); setLeftNum(""); setLeftError(""); setLeftDone(false);
      setRightOp("÷"); setRightNum(""); setRightError(""); setRightDone(false);
      setComputeVal(""); setBoxOpChoice(null); setBoxOpNum(""); setBoxOpError(""); setBoxOpDone(false);
      setPerBoxInput(""); setPerBoxError(""); setVisBoxCount(level.initBoxes); setVisSliceLines(1);
      setVisSplitBoxes(null); setVisSplitCount(null); setSolvePhase("boxOp");
    } else { setSolvePhase("finalAnswer"); setComputeVal(""); }
  }
  function submitFinal() { const a = parseInt(computeVal); if (a !== level.boxValue) { setComputeError("Not quite!"); return; } setBoxOpen(true); setVisSliceLines(1); setSteps(s => [...s, `${varName} = ${level.boxValue}`]); setShowCeleb(true); setTimeout(() => setShowCeleb(false), 3000); }

  function reset() {
    setBoxCount(level.initBoxes); setSliceLines(isMulType ? level.divisor : 1);
    setLoosePills(level.initPills); setHoleCount(level.initSlots); setFilledHoles(0);
    setRPills(level.rightPills); setVisRPills(level.rightPills); setBoxOpen(false);
    setShowCeleb(false); setStepIndex(0); setSolvePhase(initPhase); setSteps([]);
    setVisBoxCount(level.initBoxes); setVisSliceLines(isMulType ? level.divisor : 1);
    setVisSplitBoxes(null); setVisSplitCount(null); setWrongAnswer(null);
    setBoxOpChoice(null); setBoxOpNum(""); setBoxOpError(""); setBoxOpDone(false);
    setPerBoxInput(""); setPerBoxError("");
    setLeftOp(isSubFirst ? "+" : "−"); setLeftNum(""); setLeftError(""); setLeftDone(false);
    setRightOp(isSubFirst ? "+" : "−"); setRightNum(""); setRightError(""); setRightDone(false);
    setComputeVal(""); setComputeError("");
  }

  const showSplit = visSplitBoxes && (solvePhase === "perBox" || solvePhase === "finalAnswer" || solved);
  const msg = solved ? `${varName} = ${level.boxValue}` : wrongAnswer ? wrongAnswer.desc :
    solvePhase === "boxOp" ? `How do we get just one ${varName}?` :
    solvePhase === "perBox" ? "How many pills in each group?" :
    solvePhase === "boxCompute" ? `${level.rightPills} × ${level.divisor} = ?` :
    solvePhase === "left" ? "What do you do to the left?" :
    solvePhase === "right" ? "Now the right?" :
    solvePhase === "compute" ? `${exp ? exp.rBefore : ""} ${exp ? exp.op : ""} ${exp ? exp.num : ""} = ?` :
    solvePhase === "finalAnswer" ? `${varName} = ?` : "";

  return (
    <div style={{ position: "relative" }} onClick={() => showPicker && setShowPicker(false)}>
      {showCeleb && <Celeb />}
      <div style={{ display: "flex", alignItems: "stretch", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, background: wrongAnswer ? "rgba(239,68,68,0.06)" : "rgba(15,23,42,0.6)", borderRadius: 20, padding: 12, border: `2px solid ${wrongAnswer ? "#7f1d1d" : "#1e293b"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.3s ease" }}>
          <span style={{ fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Left</span>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", maxWidth: 280 }}>
            {(() => {
              // After correct ÷, show original boxes with all but one greyed
              const showGreyed = boxOpDone && boxOpChoice === "÷" && visBoxCount > 1;
              // For wrong answers that added slices, or correct state with slices
              const showActiveSlice = visSliceLines > 1 && (wrongAnswer || (boxOpDone && boxOpChoice === "÷"));
              return Array(visBoxCount).fill(0).map((_, i) => (
                <MysteryBox key={i} open={boxOpen} value={level.boxValue} small={visBoxCount > 2}
                  holeCount={holeCount && i === 0 ? holeCount : 0} filledHoles={i === 0 ? filledHoles : 0}
                  sliceLines={visSliceLines} variable={varName}
                  greyed={showGreyed && i > 0}
                  activeSlice={showActiveSlice && !(showGreyed && i > 0)}
                  onClickVar={i === 0 ? (e) => { e.stopPropagation(); setShowPicker(p => !p); } : undefined}
                  showPicker={showPicker && i === 0} onPickVar={setVarName} onClosePicker={() => setShowPicker(false)} />
              ));
            })()}
          </div>
          <PillGroup count={loosePills} small={loosePills > 6} />
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 900, color: "#334155", userSelect: "none", flexShrink: 0 }}>=</div>
        <div style={{ flex: 1, background: wrongAnswer ? "rgba(239,68,68,0.06)" : "rgba(15,23,42,0.6)", borderRadius: 20, padding: 12, border: `2px solid ${wrongAnswer ? "#7f1d1d" : "#1e293b"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.3s ease" }}>
          <span style={{ fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Right</span>
          {showSplit ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>{Array(visSplitBoxes).fill(0).map((_, i) => <SplitBox key={i} count={visSplitCount} greyed={i > 0} />)}</div>
          ) : <PillGroup count={visRPills} small={visRPills > 8} />}
        </div>
      </div>

      {!solved && (
        <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: 14, border: "2px solid #334155", padding: "12px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {wrongAnswer && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "2px solid #7f1d1d" }}>
              <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 700, textAlign: "center" }}>{wrongAnswer.desc}</span>
              <button onClick={undoWrong} style={{ padding: "6px 18px", borderRadius: 20, border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>↩ Undo</button>
            </div>
          )}
          {!wrongAnswer && (solvePhase === "boxOp" || boxOpDone) && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: boxOpDone ? "rgba(5,150,105,0.1)" : "rgba(30,41,59,0.4)", border: `2px solid ${boxOpDone ? "#10b981" : "#1e293b"}` }}>
              <span style={{ fontSize: 12, color: boxOpDone ? "#94a3b8" : "#fbbf24", fontWeight: 700 }}>How do we get just one {varName}?</span>
              {!boxOpDone && !boxOpChoice && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setBoxOpChoice("×")} style={{ padding: "8px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>× Multiply</button>
                  <button onClick={() => setBoxOpChoice("÷")} style={{ padding: "8px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>÷ Divide</button>
                </div>
              )}
              {!boxOpDone && boxOpChoice && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", fontFamily: "'Courier New', monospace" }}>{boxOpChoice}</span>
                  <input ref={boxNumRef} type="number" value={boxOpNum} onChange={(e) => { setBoxOpNum(e.target.value); setBoxOpError(""); }} onKeyDown={(e) => { if (e.key === "Enter") submitBoxOp(); }} placeholder="?" style={numInputStyle("#fbbf24")} />
                  <button onClick={submitBoxOp} style={smBtn("#7c3aed", "#6d28d9")}>Go</button>
                  <button onClick={() => { setBoxOpChoice(null); setBoxOpNum(""); }} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 11 }}>Back</button>
                </div>
              )}
              {boxOpDone && <span style={{ fontSize: 13, color: "#6ee7b7", fontFamily: "'Courier New', monospace", fontWeight: 700 }}>{boxOpChoice}{boxOpNum}</span>}
              {boxOpError && <span style={{ fontSize: 11, color: "#f87171" }}>{boxOpError}</span>}
            </div>
          )}
          {!wrongAnswer && solvePhase === "perBox" && <SInput label="How many per group?" val={perBoxInput} set={(v) => { setPerBoxInput(v); setPerBoxError(""); }} go={submitPerBox} err={perBoxError} r={perBoxRef} />}
          {!wrongAnswer && solvePhase === "boxCompute" && <SInput label={`${level.rightPills} × ${level.divisor} = ?`} val={computeVal} set={(v) => { setComputeVal(v); setComputeError(""); }} go={submitBoxCompute} err={computeError} r={computeRef} />}
          {!wrongAnswer && !isDivStep && (solvePhase === "left" || leftDone) && <ORow label="① Left side:" op={leftOp} num={leftNum} setOp={setLeftOp} setNum={(v) => { setLeftNum(v); setLeftError(""); }} go={submitLeft} err={leftError} done={leftDone} r={leftRef} />}
          {!wrongAnswer && !isDivStep && (solvePhase === "right" || rightDone) && <ORow label="② Right side:" op={rightOp} num={rightNum} setOp={setRightOp} setNum={(v) => { setRightNum(v); setRightError(""); }} go={submitRight} err={rightError} done={rightDone} r={rightRef} />}
          {!wrongAnswer && !isDivStep && solvePhase === "compute" && <SInput label={`③ ${exp.rBefore} ${exp.op} ${exp.num} = ?`} val={computeVal} set={(v) => { setComputeVal(v); setComputeError(""); }} go={submitCompute} err={computeError} r={computeRef} />}
          {!wrongAnswer && solvePhase === "finalAnswer" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 12, background: "rgba(30,41,59,0.4)", border: "2px solid #fbbf24" }}>
              <span style={{ fontSize: 15, color: "#fbbf24", fontWeight: 800, fontFamily: "'Courier New', monospace" }}>{varName} = ?</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input ref={computeRef} type="number" value={computeVal} onChange={(e) => { setComputeVal(e.target.value); setComputeError(""); }} onKeyDown={(e) => { if (e.key === "Enter") submitFinal(); }} placeholder="?" style={numInputStyle("#4ade80")} />
                <button onClick={submitFinal} style={smBtn("#059669", "#047857")}>Check</button>
              </div>
              {computeError && <span style={{ fontSize: 11, color: "#f87171" }}>{computeError}</span>}
            </div>
          )}
        </div>
      )}

      <MsgBar solved={solved} message={msg} />
      <StepLog steps={steps} />
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={reset} style={resetBtnStyle}>Reset</button>
        {solved && hasNext && <button onClick={onNext} style={nextBtnStyle}>Next →</button>}
      </div>
    </div>
  );
}

// ── Tiny reusable ──
function Celeb() {
  const [particles] = useState(() =>
    Array(40).fill(0).map(() => ({
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 1.5 + Math.random() * 1.5,
      size: 6 + Math.random() * 8,
      color: ["#fbbf24","#f59e0b","#ef4444","#8b5cf6","#3b82f6","#10b981","#ec4899","#f97316"][Math.floor(Math.random() * 8)],
      drift: -30 + Math.random() * 60,
      rot: Math.random() * 720,
      shape: Math.random() > 0.5 ? "circle" : "rect",
    }))
  );
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: -10, left: `${p.x}%`,
          width: p.shape === "circle" ? p.size : p.size * 0.6,
          height: p.size,
          borderRadius: p.shape === "circle" ? "50%" : 2,
          background: p.color,
          "--drift": `${p.drift}px`, "--rot": `${p.rot}deg`,
          animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

function SInput({ label, val, set, go, err, r }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 12, background: "rgba(30,41,59,0.4)", border: "2px solid #1e293b" }}>
      <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700, fontFamily: "'Courier New', monospace" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input ref={r} type="number" value={val} onChange={(e) => set(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") go(); }} placeholder="?" style={numInputStyle("#4ade80")} />
        <button onClick={go} style={smBtn("#059669", "#047857")}>Check</button>
      </div>
      {err && <span style={{ fontSize: 11, color: "#f87171", textAlign: "center", maxWidth: 240 }}>{err}</span>}
    </div>
  );
}

function ORow({ label, op, num, setOp, setNum, go, err, done, r }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 12, background: done ? "rgba(5,150,105,0.1)" : "rgba(30,41,59,0.4)", border: `2px solid ${done ? "#10b981" : "#1e293b"}` }}>
      <span style={{ fontSize: 11, color: done ? "#94a3b8" : "#94a3b8", fontWeight: 700 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {["−", "+", "×", "÷"].map(o => <button key={o} onClick={() => !done && setOp(o)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: op === o ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#1e293b", color: op === o ? "#0f172a" : "#64748b", fontSize: 14, fontWeight: 800, cursor: done ? "default" : "pointer", opacity: done ? 0.6 : 1 }}>{o}</button>)}
        <input ref={r} type="number" value={num} disabled={done} onChange={(e) => setNum(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !done) go(); }} placeholder="?" style={{ width: 40, height: 28, borderRadius: 8, border: "2px solid #334155", background: done ? "#0f172a" : "rgba(15,23,42,0.8)", color: done ? "#6ee7b7" : "#fbbf24", fontSize: 15, fontWeight: 800, textAlign: "center", fontFamily: "'Courier New', monospace", outline: "none" }} />
        {!done && <button onClick={go} style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 11 }}>→</button>}
      </div>
      {err && <span style={{ fontSize: 11, color: "#f87171", textAlign: "center" }}>{err}</span>}
    </div>
  );
}

function MsgBar({ solved, message }) {
  if (!message) return null;
  return <div style={{ textAlign: "center", padding: "10px 18px", background: solved ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))" : "rgba(15,23,42,0.6)", borderRadius: 14, border: `2px solid ${solved ? "#166534" : "#1e293b"}`, marginBottom: 14 }}><p style={{ fontSize: solved ? 18 : 13, fontWeight: solved ? 800 : 500, color: solved ? "#4ade80" : "#94a3b8", margin: 0 }}>{solved ? "🎉 " : "💡 "}{message}</p></div>;
}

function SplitBox({ count, greyed }) {
  return (
    <div style={{ minWidth: 46, padding: 5, borderRadius: 10, background: greyed ? "rgba(30,41,59,0.15)" : "rgba(30,41,59,0.4)", border: `2px solid ${greyed ? "#1e293b" : "#334155"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: greyed ? 0.3 : 1, transition: "opacity 0.4s ease" }}>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", maxWidth: 70 }}>
        {Array(count).fill(0).map((_, i) => <Pill key={i} small />)}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1", fontFamily: "'Courier New', monospace" }}>{count}</span>
    </div>
  );
}

function smBtn(a, b) { return { padding: "5px 12px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${a}, ${b})`, color: "white", fontWeight: 700, cursor: "pointer", fontSize: 12 }; }
function numInputStyle(c) { return { width: 46, height: 34, borderRadius: 8, border: "2px solid #334155", background: "rgba(15,23,42,0.8)", color: c, fontSize: 17, fontWeight: 800, textAlign: "center", fontFamily: "'Courier New', monospace", outline: "none" }; }
const resetBtnStyle = { padding: "7px 20px", borderRadius: 20, border: "1px solid #334155", background: "rgba(30,41,59,0.6)", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 12 };
const nextBtnStyle = { padding: "7px 20px", borderRadius: 20, border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: 12 };

// ── MAIN ──
export default function BoxAlgebra() {
  const [levels, setLevels] = useState(PRESET_LEVELS);
  const [levelIdx, setLevelIdx] = useState(0);
  const [mode, setMode] = useState("explore");
  const [gameKey, setGameKey] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");
  const goTo = (i) => { setLevelIdx(i); setGameKey(k => k + 1); };
  function addCustom() {
    const p = parseEquation(customInput);
    if (!p) { setCustomError("Try: x+3=8, 2x-4=10, 3x=12, x/5=3"); return; }
    setCustomError(""); setLevels(l => [...l, p]); setLevelIdx(levels.length); setGameKey(k => k + 1); setCustomInput("");
  }
  const lev = levels[levelIdx];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)", color: "white", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: "20px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px 0", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>📦 Box Algebra</h1>
        <p style={{ fontSize: 12, color: "#475569", margin: "0 0 12px 0" }}>What's hiding in the box?</p>
        <div style={{ display: "inline-flex", borderRadius: 20, overflow: "hidden", border: "2px solid #1e293b", marginBottom: 12 }}>
          {[["explore", "🖐 Explore"], ["solve", "✏️ Solve"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setGameKey(k => k + 1); }} style={{ padding: "6px 18px", border: "none", background: mode === m ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "transparent", color: mode === m ? "white" : "#64748b", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <input type="text" value={customInput} onChange={(e) => { setCustomInput(e.target.value); setCustomError(""); }} onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }} placeholder="Type: 3x+4=19, n/5=3" style={{ width: 210, height: 32, borderRadius: 10, border: "2px solid #334155", background: "rgba(15,23,42,0.8)", color: "#e2e8f0", fontSize: 13, fontWeight: 600, textAlign: "center", fontFamily: "'Courier New', monospace", outline: "none", padding: "0 10px" }} />
          <button onClick={addCustom} style={smBtn("#059669", "#047857")}>Build →</button>
        </div>
        {customError && <p style={{ fontSize: 11, color: "#f87171", margin: "0 0 8px 0" }}>{customError}</p>}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
          {levels.map((l, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ padding: "3px 9px", borderRadius: 14, border: "none", background: i === levelIdx ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#1e293b", color: i === levelIdx ? "#0f172a" : "#64748b", fontWeight: 700, cursor: "pointer", fontSize: 10, fontFamily: "'Courier New', monospace" }}>{levelEq(l)}</button>
          ))}
        </div>
      </div>

      {/* Title equation */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <EquationDisplay text={levelEq(lev)} size={24} />
      </div>

      {mode === "explore" ? (
        <ExploreMode key={`e-${gameKey}`} level={lev} onNext={() => { if (levelIdx < levels.length - 1) goTo(levelIdx + 1); }} hasNext={levelIdx < levels.length - 1} />
      ) : (
        <SolveMode key={`s-${gameKey}`} level={lev} onNext={() => { if (levelIdx < levels.length - 1) goTo(levelIdx + 1); }} hasNext={levelIdx < levels.length - 1} />
      )}
    </div>
  );
}
