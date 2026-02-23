"use client";

import { useState } from "react";
import { useEquationState } from "./useEquationState";

export function useExploreLogic(level) {
  const eq = useEquationState(level);
  const {
    boxCount, sliceLines, loosePills, holeCount, filledHoles,
    rPills, setRPills, varName, steps, setSteps, unfilled,
    negCoeff, setNegCoeff,
    computeLeftOp, applyLeftState, isSolved, markSolved, resetToLevel,
  } = eq;

  const initialEq = eq.buildInitialEquationString();

  const [phase, setPhase] = useState("left"); // left | right | unbalanced | solved
  const [leftOp, setLeftOp] = useState(null);
  const [leftNum, setLeftNum] = useState(null);
  const [leftError, setLeftError] = useState("");
  const [rightError, setRightError] = useState("");
  const [snap, setSnap] = useState(null);
  const [opKey, setOpKey] = useState(0);
  const [workLines, setWorkLines] = useState([]);

  function buildVarSide(result) {
    const fmt = (v) => Number.isInteger(v) ? String(v) : parseFloat(v.toFixed(4)).toString();
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
    setSnap({ boxCount, sliceLines, loosePills, holeCount, filledHoles, rPills, negCoeff });
    setLeftError("");

    const result = computeLeftOp(op, n, { boxCount, sliceLines, loosePills, holeCount, filledHoles, negCoeff });
    if (result.error) {
      setLeftError(result.error);
      return;
    }

    applyLeftState(result);
    setLeftOp(op);
    setLeftNum(n);

    const fmt = (v) => Number.isInteger(v) ? String(v) : parseFloat(v.toFixed(4)).toString();
    const vs = buildVarSide(result);
    const ns = fmt(rPills);
    const pendingEq = level.flipped ? `${ns} = ${vs}` : `${vs} = ${ns}`;

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
      // Balanced
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

      if (!newLeft.error && isSolved(newLeft)) {
        setPhase("solved");
        const fmt = (v) => Number.isInteger(v) ? String(v) : parseFloat(v.toFixed(4)).toString();
        const solvedText = level.flipped ? `${fmt(newR)} = ${varName}` : `${varName} = ${fmt(newR)}`;
        setWorkLines((w) => [
          ...w.slice(0, -2),
          { type: "op", op, n },
          { type: "eq", text: solvedText, solved: true },
        ]);
        markSolved();
      } else {
        const fmt = (v) => Number.isInteger(v) ? String(v) : parseFloat(v.toFixed(4)).toString();
        const varSide = buildVarSide(newLeft);
        const eqText = level.flipped ? `${fmt(newR)} = ${varSide}` : `${varSide} = ${fmt(newR)}`;
        setWorkLines((w) => [
          ...w.slice(0, -2),
          { type: "op", op, n },
          { type: "eq", text: eqText },
        ]);
        setLeftOp(null);
        setLeftNum(null);
        setPhase("left");
        setOpKey((k) => k + 1);
      }
    } else {
      // Unbalanced
      if (op === "+") setRPills((r) => r + n);
      else if (op === "−") setRPills((r) => r - n);
      else if (op === "×") setRPills((r) => r * n);
      else if (op === "÷") setRPills((r) => r / n);
      setPhase("unbalanced");
    }
  }

  function undo() {
    if (snap) {
      eq.setBoxCount(snap.boxCount);
      eq.setSliceLines(snap.sliceLines);
      eq.setLoosePills(snap.loosePills);
      eq.setHoleCount(snap.holeCount);
      eq.setFilledHoles(snap.filledHoles);
      setRPills(snap.rPills);
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
    setWorkLines([]);
    setOpKey((k) => k + 1);
  }

  const liveEq = eq.buildEquationString();

  return {
    ...eq,
    phase, leftOp, leftNum, leftError, rightError,
    snap, opKey, liveEq, workLines,
    initialEq,
    applyToLeft, applyToRight, undo, fullReset,
  };
}
