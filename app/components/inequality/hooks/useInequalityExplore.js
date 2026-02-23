"use client";

import { useState } from "react";
import { useInequalityState } from "./useInequalityState";
import { INEQ_DISPLAY } from "../parser";

const FLIP_MAP = { ">": "<", "<": ">", ">=": "<=", "<=": ">=" };

export function useInequalityExplore(level) {
  const eq = useInequalityState(level);
  const {
    boxCount, sliceLines, loosePills, holeCount, filledHoles,
    rPills, setRPills, varName, steps, setSteps, unfilled,
    ineqDir, flipInequality, ineqSym,
    negCoeff, setNegCoeff,
    computeLeftOp, applyLeftState, isSolved, markSolved, resetToLevel,
  } = eq;

  const initialEq = eq.buildInitialEquationString();

  const [phase, setPhase] = useState("left");
  const [leftOp, setLeftOp] = useState(null);
  const [leftNum, setLeftNum] = useState(null);
  const [leftError, setLeftError] = useState("");
  const [rightError, setRightError] = useState("");
  const [snap, setSnap] = useState(null);
  const [opKey, setOpKey] = useState(0);
  const [workLines, setWorkLines] = useState([]);
  const [symbolError, setSymbolError] = useState("");

  // Pending resolution data for "choose_symbol" phase
  const [pendingResolve, setPendingResolve] = useState(null);

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

  function applyToLeft(op, n) {
    setSnap({ boxCount, sliceLines, loosePills, holeCount, filledHoles, rPills, ineqDir, negCoeff });
    setLeftError("");

    const result = computeLeftOp(op, n, { boxCount, sliceLines, loosePills, holeCount, filledHoles, negCoeff });
    if (result.error) {
      setLeftError(result.error);
      return;
    }

    applyLeftState(result);
    setLeftOp(op);
    setLeftNum(n);

    // Don't flip inequality yet — student will choose the symbol after balancing

    const vs = buildVarSide(result);
    const ns = fmt(rPills);
    const sym = ineqSym;
    const pendingEq = level.flipped ? `${ns} ${sym} ${vs}` : `${vs} ${sym} ${ns}`;

    setWorkLines((w) => [
      ...w,
      { type: "op", op, n, pending: true },
      { type: "eq", text: pendingEq, pending: true },
    ]);
    setPhase("right");
  }

  function applyToRight(op, n) {
    setRightError("");

    if (op === "×" && Math.abs(rPills * n) > 99999) { setRightError("Too many pills!"); return; }

    if (op === leftOp && n === leftNum) {
      // Balanced — enter symbol choice phase
      let newR = rPills;
      if (op === "+") newR += n;
      else if (op === "−") newR -= n;
      else if (op === "×") newR *= n;
      else if (op === "÷") newR /= n;
      setRPills(newR);

      const newLeft = computeLeftOp(leftOp, leftNum, {
        boxCount: snap.boxCount, sliceLines: snap.sliceLines,
        loosePills: snap.loosePills, holeCount: snap.holeCount, filledHoles: snap.filledHoles,
        negCoeff: snap.negCoeff,
      });

      // Determine if flip is needed
      const shouldFlip = (op === "×" || op === "÷") && n < 0;

      setPendingResolve({ newLeft, newR, op, n, shouldFlip });
      setSymbolError("");
      setPhase("choose_symbol");
    } else {
      // Unbalanced
      if (op === "+") setRPills((r) => r + n);
      else if (op === "−") setRPills((r) => r - n);
      else if (op === "×") setRPills((r) => r * n);
      else if (op === "÷") setRPills((r) => r / n);
      setPhase("unbalanced");
    }
  }

  function chooseSymbol(didFlip) {
    if (!pendingResolve) return;
    const { newLeft, newR, op, n, shouldFlip } = pendingResolve;

    if (didFlip !== shouldFlip) {
      // Wrong choice
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

    // Get the symbol AFTER potential flip
    const newDir = shouldFlip ? FLIP_MAP[ineqDir] : ineqDir;
    const sym = INEQ_DISPLAY[newDir] || newDir;
    const fromSym = INEQ_DISPLAY[ineqDir] || ineqDir;
    const symbolLine = { type: "symbol", from: fromSym, to: sym, flipped: shouldFlip };

    if (!newLeft.error && isSolved(newLeft)) {
      setPhase("solved");
      const solvedText = level.flipped ? `${fmt(newR)} ${sym} ${varName}` : `${varName} ${sym} ${fmt(newR)}`;
      setWorkLines((w) => [
        ...w.slice(0, -2),
        { type: "op", op, n },
        symbolLine,
        { type: "eq", text: solvedText, solved: true },
      ]);
      markSolved();
    } else {
      const vs = buildVarSide(newLeft);
      const eqText = level.flipped ? `${fmt(newR)} ${sym} ${vs}` : `${vs} ${sym} ${fmt(newR)}`;
      setWorkLines((w) => [
        ...w.slice(0, -2),
        { type: "op", op, n },
        symbolLine,
        { type: "eq", text: eqText },
      ]);
      setLeftOp(null);
      setLeftNum(null);
      setPhase("left");
      setOpKey((k) => k + 1);
    }

    setPendingResolve(null);
    setSymbolError("");
  }

  function undo() {
    if (snap) {
      eq.setBoxCount(snap.boxCount);
      eq.setSliceLines(snap.sliceLines);
      eq.setLoosePills(snap.loosePills);
      eq.setHoleCount(snap.holeCount);
      eq.setFilledHoles(snap.filledHoles);
      setRPills(snap.rPills);
      eq.setIneqDir(snap.ineqDir);
      setNegCoeff(snap.negCoeff);
    }
    setWorkLines((w) => {
      if (w.length >= 2 && w[w.length - 1].pending && w[w.length - 2].pending) return w.slice(0, -2);
      if (w.length > 0 && w[w.length - 1].pending) return w.slice(0, -1);
      return w;
    });
    setLeftOp(null);
    setLeftNum(null);
    setRightError("");
    setLeftError("");
    setSymbolError("");
    setPendingResolve(null);
    setPhase("left");
    setOpKey((k) => k + 1);
  }

  function fullReset() {
    resetToLevel();
    setPhase("left");
    setSnap(null);
    setLeftOp(null);
    setLeftNum(null);
    setRightError("");
    setLeftError("");
    setSymbolError("");
    setPendingResolve(null);
    setWorkLines([]);
    setOpKey((k) => k + 1);
  }

  const liveEq = eq.buildEquationString();

  return {
    ...eq,
    phase, leftOp, leftNum, leftError, rightError,
    snap, opKey, liveEq, workLines,
    initialEq,
    symbolError, pendingResolve,
    applyToLeft, applyToRight, chooseSymbol, undo, fullReset,
  };
}
