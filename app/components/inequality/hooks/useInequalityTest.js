"use client";

import { useState } from "react";
import { useInequalityState } from "./useInequalityState";
import { INEQ_DISPLAY } from "../parser";

const FLIP_MAP = { ">": "<", "<": ">", ">=": "<=", "<=": ">=" };

function parseOp(str) {
  const s = str.trim()
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

  const m = s.match(/^([+\-*/])(-?\d+\.?\d*|-?\.\d+)$/);
  if (!m) return null;

  const rawOp = m[1] || "+";
  const n = parseFloat(m[2]);
  if (isNaN(n) || n === 0) return null;

  const opMap = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  return { op: opMap[rawOp], n };
}

export function useInequalityTest(level) {
  const eq = useInequalityState(level);
  const {
    boxCount, sliceLines, loosePills, holeCount, filledHoles,
    rPills, setRPills, varName, unfilled,
    ineqDir, flipInequality, ineqSym,
    negCoeff,
    computeLeftOp, applyLeftState, isSolved, markSolved, resetToLevel,
  } = eq;

  const initialEq = eq.buildInitialEquationString();

  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [error, setError] = useState("");
  const [workLines, setWorkLines] = useState([]);
  const [solved, setSolved] = useState(false);
  const [phase, setPhase] = useState("input"); // "input" | "choose_symbol" | "solved"
  const [pendingResolve, setPendingResolve] = useState(null);
  const [symbolError, setSymbolError] = useState("");

  const fmt = (v) => Number.isInteger(v) ? String(v) : parseFloat(v.toFixed(4)).toString();

  function buildVarSide(result) {
    const bC = result.boxCount, sL = result.sliceLines;
    const lP = result.loosePills, uf = result.holeCount - result.filledHoles;
    const neg = result.negCoeff ? "−" : "";
    let vs = "";
    if (bC > 1 && sL > 1) vs = `${neg}${bC}${varName}/${sL}`;
    else if (sL > 1) vs = `${neg}${varName}/${sL}`;
    else if (bC > 1) vs = `${neg}${bC}${varName}`;
    else vs = `${neg}${varName}`;
    if (lP > 0) vs += ` + ${fmt(lP)}`;
    if (uf > 0) vs += ` − ${fmt(uf)}`;
    return vs;
  }

  function tryIt() {
    setError("");

    const left = parseOp(leftInput);
    const right = parseOp(rightInput);

    if (!left) { setError("Left side: try something like −3, +5, ×2, ÷4"); return; }
    if (!right) { setError("Right side: try something like −3, +5, ×2, ÷4"); return; }

    // Apply left operation
    const result = computeLeftOp(left.op, left.n, { boxCount, sliceLines, loosePills, holeCount, filledHoles, negCoeff });
    if (result.error) { setError(result.error); return; }

    // Apply right operation
    let newR = rPills;
    if (right.op === "+") newR += right.n;
    else if (right.op === "−") newR -= right.n;
    else if (right.op === "×") newR *= right.n;
    else if (right.op === "÷") {
      if (right.n === 0) { setError("Can't divide by zero!"); return; }
      newR /= right.n;
    }

    if (Math.abs(newR) > 99999) { setError("Number too large!"); return; }

    // Check if balanced
    const balanced = left.op === right.op && left.n === right.n;

    // Don't flip yet — student will choose the symbol
    const shouldFlip = (left.op === "×" || left.op === "÷") && left.n < 0;

    // Commit state
    applyLeftState(result);
    setRPills(newR);

    const opLine = {
      type: "op",
      left: { op: left.op, n: left.n },
      right: { op: right.op, n: right.n },
      balanced,
    };

    // Add op line with pending equation (before symbol choice)
    const vs = buildVarSide(result);
    const sym = ineqSym;
    const pendingEq = level.flipped ? `${fmt(newR)} ${sym} ${vs}` : `${vs} ${sym} ${fmt(newR)}`;

    setWorkLines((w) => [...w, opLine, { type: "eq", text: pendingEq, pending: true, unbalanced: !balanced }]);
    setLeftInput("");
    setRightInput("");

    // Enter symbol choice phase
    setPendingResolve({ result, newR, shouldFlip, balanced });
    setSymbolError("");
    setPhase("choose_symbol");
  }

  function chooseSymbol(didFlip) {
    if (!pendingResolve) return;
    const { result, newR, shouldFlip, balanced } = pendingResolve;

    if (didFlip !== shouldFlip) {
      if (shouldFlip) {
        setSymbolError("When you multiply or divide by a negative, the inequality flips!");
      } else {
        setSymbolError("The inequality only flips when you multiply or divide by a negative number.");
      }
      return;
    }

    // Correct choice — apply the flip if needed
    if (shouldFlip) {
      flipInequality();
    }

    const newDir = shouldFlip ? FLIP_MAP[ineqDir] : ineqDir;
    const sym = INEQ_DISPLAY[newDir] || newDir;
    const fromSym = INEQ_DISPLAY[ineqDir] || ineqDir;
    const symbolLine = { type: "symbol", from: fromSym, to: sym, flipped: shouldFlip };

    const vs = buildVarSide(result);
    const nowSolved = isSolved(result);

    const eqText = nowSolved
      ? (level.flipped ? `${fmt(newR)} ${sym} ${varName}` : `${varName} ${sym} ${fmt(newR)}`)
      : (level.flipped ? `${fmt(newR)} ${sym} ${vs}` : `${vs} ${sym} ${fmt(newR)}`);

    setWorkLines((w) => [
      ...w.slice(0, -1),  // Remove pending eq line
      symbolLine,
      { type: "eq", text: eqText, solved: nowSolved, unbalanced: !balanced },
    ]);

    if (nowSolved) {
      setSolved(true);
      setPhase("solved");
      markSolved();
    } else {
      setPhase("input");
    }

    setPendingResolve(null);
    setSymbolError("");
  }

  function reset() {
    resetToLevel();
    setLeftInput("");
    setRightInput("");
    setError("");
    setWorkLines([]);
    setSolved(false);
    setPhase("input");
    setPendingResolve(null);
    setSymbolError("");
  }

  return {
    initialEq,
    varName,
    ineqDir, ineqSym,
    leftInput, setLeftInput,
    rightInput, setRightInput,
    error, workLines, solved,
    phase, symbolError, pendingResolve,
    showCeleb: eq.showCeleb,
    tryIt, chooseSymbol, reset,
    boxValue: level.boxValue,
    inequality: level.inequality,
    flipped: level.flipped,
  };
}
