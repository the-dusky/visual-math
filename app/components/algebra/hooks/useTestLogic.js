"use client";

import { useState } from "react";
import { useEquationState } from "./useEquationState";

function parseOp(str) {
  const s = str.trim()
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

  // Match: optional op (+, -, *, /) followed by a number
  const m = s.match(/^([+\-*/])?(\d+\.?\d*|\.\d+)$/);
  if (!m) return null;

  const rawOp = m[1] || "+";
  const n = parseFloat(m[2]);
  if (isNaN(n) || n === 0) return null;

  const opMap = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  return { op: opMap[rawOp], n };
}

export function useTestLogic(level) {
  const eq = useEquationState(level);
  const {
    boxCount, sliceLines, loosePills, holeCount, filledHoles,
    rPills, setRPills, varName, unfilled,
    computeLeftOp, applyLeftState, isSolved, markSolved, resetToLevel,
  } = eq;

  const initialEq = eq.buildInitialEquationString();

  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [error, setError] = useState("");
  const [workLines, setWorkLines] = useState([]);
  const [solved, setSolved] = useState(false);

  const fmt = (v) => Number.isInteger(v) ? String(v) : parseFloat(v.toFixed(4)).toString();

  function tryIt() {
    setError("");

    const left = parseOp(leftInput);
    const right = parseOp(rightInput);

    if (!left) { setError("Left side: try something like −3, +5, ×2, ÷4"); return; }
    if (!right) { setError("Right side: try something like −3, +5, ×2, ÷4"); return; }

    // Apply left operation
    const result = computeLeftOp(left.op, left.n, { boxCount, sliceLines, loosePills, holeCount, filledHoles });
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

    // Commit state
    applyLeftState(result);
    setRPills(newR);

    // Build equation string from new state
    const bC = result.boxCount, sL = result.sliceLines;
    const lP = result.loosePills, uf = result.holeCount - result.filledHoles;
    let varSide = "";
    if (bC > 1 && sL > 1) varSide = `${bC}${varName}/${sL}`;
    else if (sL > 1) varSide = `${varName}/${sL}`;
    else if (bC > 1) varSide = `${bC}${varName}`;
    else varSide = varName;
    if (lP > 0) varSide += ` + ${fmt(lP)}`;
    if (uf > 0) varSide += ` − ${fmt(uf)}`;

    const eqText = level.flipped
      ? `${fmt(newR)} = ${varSide}`
      : `${varSide} = ${fmt(newR)}`;

    // Check solved
    const nowSolved = isSolved(result);

    const opLine = {
      type: "op",
      left: { op: left.op, n: left.n },
      right: { op: right.op, n: right.n },
      balanced,
    };
    const eqLine = {
      type: "eq",
      text: nowSolved
        ? (level.flipped ? `${fmt(newR)} = ${varName}` : `${varName} = ${fmt(newR)}`)
        : eqText,
      solved: nowSolved,
      unbalanced: !balanced,
    };

    setWorkLines((w) => [...w, opLine, eqLine]);
    setLeftInput("");
    setRightInput("");

    if (nowSolved) {
      setSolved(true);
      markSolved();
    }
  }

  function reset() {
    resetToLevel();
    setLeftInput("");
    setRightInput("");
    setError("");
    setWorkLines([]);
    setSolved(false);
  }

  return {
    initialEq,
    varName,
    leftInput, setLeftInput,
    rightInput, setRightInput,
    error, workLines, solved,
    showCeleb: eq.showCeleb,
    tryIt, reset,
    boxValue: level.boxValue,
    flipped: level.flipped,
  };
}
