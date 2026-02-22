"use client";

import { useState, useEffect } from "react";
import { useEquationState } from "./useEquationState";

export function useExploreLogic(level) {
  const eq = useEquationState(level);
  const {
    boxCount, sliceLines, loosePills, holeCount, filledHoles,
    rPills, setRPills, varName, steps, setSteps, unfilled,
    computeLeftOp, applyLeftState, isSolved, markSolved, resetToLevel,
  } = eq;

  const [phase, setPhase] = useState("left"); // left | right | unbalanced | solved
  const [leftOp, setLeftOp] = useState(null);
  const [leftNum, setLeftNum] = useState(null);
  const [rightError, setRightError] = useState("");
  const [leftError, setLeftError] = useState("");
  const [snap, setSnap] = useState(null);
  const [opKey, setOpKey] = useState(0);

  // Auto-celebrate when variable is isolated AND equation is balanced
  // Only trigger in "left" phase (both sides have been updated equally)
  useEffect(() => {
    if (phase === "left" && isSolved()) {
      setPhase("solved");
      setSteps((s) => [...s, `${varName} = ${rPills}`]);
      markSolved();
    }
  }, [boxCount, sliceLines, loosePills, unfilled, phase]);

  function applyToLeft(op, n) {
    setSnap({ boxCount, sliceLines, loosePills, holeCount, filledHoles, rPills });
    setLeftError("");

    const result = computeLeftOp(op, n, { boxCount, sliceLines, loosePills, holeCount, filledHoles });
    if (result.error) {
      setLeftError(result.error);
      return;
    }

    applyLeftState(result);
    setLeftOp(op);
    setLeftNum(n);
    setPhase("right");
  }

  function applyToRight(op, n) {
    setRightError("");

    if (op === "−" && n > rPills) { setRightError("Not enough pills!"); return; }
    if (op === "×" && rPills * n > 200) { setRightError("Too many pills!"); return; }

    if (op === leftOp && n === leftNum) {
      // Balanced
      let newR = rPills;
      if (op === "+") newR += n;
      else if (op === "−") newR -= n;
      else if (op === "×") newR *= n;
      else if (op === "÷") newR /= n;
      setRPills(newR);

      // Check if solved after this move (compute manually since state is async)
      const newLeft = computeLeftOp(leftOp, leftNum, {
        boxCount: snap.boxCount, sliceLines: snap.sliceLines,
        loosePills: snap.loosePills, holeCount: snap.holeCount, filledHoles: snap.filledHoles,
      });

      if (!newLeft.error && isSolved(newLeft)) {
        setPhase("solved");
        setSteps((s) => [...s, `${op}${n} both sides`, `${varName} = ${newR}`]);
        markSolved();
      } else {
        setSteps((s) => [...s, `${op}${n} both sides`]);
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
    }
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
    setOpKey((k) => k + 1);
  }

  const liveEq = eq.buildEquationString();

  return {
    ...eq,
    phase, leftOp, leftNum, rightError, leftError,
    snap, opKey, liveEq,
    applyToLeft, applyToRight, undo, fullReset,
  };
}
