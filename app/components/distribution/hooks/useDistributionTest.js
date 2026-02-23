"use client";

import { useState } from "react";
import { useEquationState } from "../../algebra/hooks/useEquationState";

function toDistributedLevel(level) {
  const totalBoxes = level.multiplier * level.innerBoxes;
  const totalPills = level.multiplier * level.innerPills;
  const absPills = Math.abs(totalPills);

  let type;
  if (totalPills > 0) type = totalBoxes > 1 ? "twostep" : "addition";
  else if (totalPills < 0) type = totalBoxes > 1 ? "twostep_sub" : "subtraction";
  else type = "division";

  return {
    type,
    boxValue: level.boxValue,
    initBoxes: totalBoxes,
    initPills: totalPills > 0 ? absPills : 0,
    initSlots: totalPills < 0 ? absPills : 0,
    rightPills: level.rightPills,
    variable: level.variable || "x",
  };
}

function parseOp(str) {
  const s = str.trim()
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

  const m = s.match(/^([+\-*/])(-?\d+\.?\d*|-?\.\d+)$/);
  if (!m) return null;

  const n = parseFloat(m[2]);
  if (isNaN(n) || n === 0) return null;

  const opMap = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  return { op: opMap[m[1]], n };
}

export function useDistributionTest(level) {
  const distLevel = toDistributedLevel(level);
  const eq = useEquationState(distLevel);
  const {
    boxCount, sliceLines, loosePills, holeCount, filledHoles,
    rPills, setRPills, varName, unfilled, negCoeff,
    computeLeftOp, applyLeftState, isSolved, markSolved, resetToLevel,
  } = eq;

  const initialEq = eq.buildInitialEquationString();

  // Phase: "distribute" | "input" | "solved"
  const [phase, setPhase] = useState("distribute");
  const [distInput, setDistInput] = useState("");
  const [distError, setDistError] = useState("");
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [error, setError] = useState("");
  const [workLines, setWorkLines] = useState([]);
  const [solved, setSolved] = useState(false);

  const fmt = (v) => Number.isInteger(v) ? String(v) : parseFloat(v.toFixed(4)).toString();

  function tryDistribute() {
    setDistError("");
    const s = distInput.trim().replace(/\s+/g, "").replace(/−/g, "-");
    const totalBoxes = level.multiplier * level.innerBoxes;
    const totalPills = level.multiplier * level.innerPills;
    const v = level.variable || "x";

    const boxPart = totalBoxes === 1 ? v : `${totalBoxes}${v}`;
    const pillSign = totalPills >= 0 ? "+" : "-";
    const absPills = Math.abs(totalPills);

    let expected;
    if (totalPills === 0) {
      expected = `${boxPart}=${level.rightPills}`;
    } else {
      expected = `${boxPart}${pillSign}${absPills}=${level.rightPills}`;
    }

    if (s === expected) {
      setWorkLines([
        { type: "distribute", text: `Distribute the ${level.multiplier}` },
        { type: "eq", text: initialEq },
      ]);
      setPhase("input");
      setDistInput("");
    } else {
      const inner = level.innerBoxes === 1 ? v : `${level.innerBoxes}${v}`;
      const sign = level.innerPills >= 0 ? "+" : "−";
      setDistError(`Multiply ${level.multiplier} × each term in (${inner} ${sign} ${Math.abs(level.innerPills)})`);
    }
  }

  function tryIt() {
    setError("");

    const left = parseOp(leftInput);
    const right = parseOp(rightInput);

    if (!left) { setError("Left side: try something like −3, +5, ×2, ÷4"); return; }
    if (!right) { setError("Right side: try something like −3, +5, ×2, ÷4"); return; }

    const result = computeLeftOp(left.op, left.n, { boxCount, sliceLines, loosePills, holeCount, filledHoles, negCoeff });
    if (result.error) { setError(result.error); return; }

    let newR = rPills;
    if (right.op === "+") newR += right.n;
    else if (right.op === "−") newR -= right.n;
    else if (right.op === "×") newR *= right.n;
    else if (right.op === "÷") {
      if (right.n === 0) { setError("Can't divide by zero!"); return; }
      newR /= right.n;
    }

    if (Math.abs(newR) > 99999) { setError("Number too large!"); return; }

    const balanced = left.op === right.op && left.n === right.n;
    applyLeftState(result);
    setRPills(newR);

    const bC = result.boxCount, sL = result.sliceLines;
    const lP = result.loosePills, uf = result.holeCount - result.filledHoles;
    const neg = result.negCoeff ? "−" : "";
    let varSide = "";
    if (bC > 1 && sL > 1) varSide = `${neg}${bC}${varName}/${sL}`;
    else if (sL > 1) varSide = `${neg}${varName}/${sL}`;
    else if (bC > 1) varSide = `${neg}${bC}${varName}`;
    else varSide = `${neg}${varName}`;
    if (lP > 0) varSide += ` + ${fmt(lP)}`;
    if (uf > 0) varSide += ` − ${fmt(uf)}`;

    const nowSolved = isSolved(result);
    const eqText = nowSolved ? `${varName} = ${fmt(newR)}` : `${varSide} = ${fmt(newR)}`;

    const opLine = {
      type: "op",
      left: { op: left.op, n: left.n },
      right: { op: right.op, n: right.n },
      balanced,
    };
    const eqLine = { type: "eq", text: eqText, solved: nowSolved, unbalanced: !balanced };

    setWorkLines((w) => [...w, opLine, eqLine]);
    setLeftInput("");
    setRightInput("");

    if (nowSolved) {
      setSolved(true);
      setPhase("solved");
      markSolved();
    }
  }

  function reset() {
    resetToLevel();
    setPhase("distribute");
    setDistInput("");
    setDistError("");
    setLeftInput("");
    setRightInput("");
    setError("");
    setWorkLines([]);
    setSolved(false);
  }

  return {
    initialEq, varName,
    phase, distInput, setDistInput, distError,
    leftInput, setLeftInput, rightInput, setRightInput,
    error, workLines, solved,
    showCeleb: eq.showCeleb,
    tryDistribute, tryIt, reset,
    boxValue: level.boxValue,
    level,
  };
}
