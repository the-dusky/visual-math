"use client";

import { useState } from "react";
import { gcd } from "../parser";

export function useEquationState(level) {
  const isMulType = level.type === "multiply";

  const [boxCount, setBoxCount] = useState(level.initBoxes);
  const [sliceLines, setSliceLines] = useState(isMulType ? level.divisor : 1);
  const [loosePills, setLoosePills] = useState(level.initPills);
  const [holeCount, setHoleCount] = useState(level.initSlots);
  const [filledHoles, setFilledHoles] = useState(0);
  const [rPills, setRPills] = useState(level.rightPills);
  const [varName, setVarName] = useState(level.variable || "x");
  const [showPicker, setShowPicker] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false);
  const [showCeleb, setShowCeleb] = useState(false);
  const [steps, setSteps] = useState([]);

  const unfilled = holeCount - filledHoles;

  function togglePicker() {
    setShowPicker((p) => !p);
  }

  function closePicker() {
    setShowPicker(false);
  }

  // Compute new left-side state after applying an operation.
  // Returns { boxCount, sliceLines, loosePills, holeCount, filledHoles } or null if invalid.
  function computeLeftOp(op, n, state) {
    let { boxCount: bC, sliceLines: sL, loosePills: lP, holeCount: hC, filledHoles: fH } = state;
    const uf = hC - fH;

    if (op === "÷") {
      if (n === 0) return { error: "Can't divide by zero!" };
    }
    if (op === "×" && bC * n > 20) return { error: `${bC * n} boxes — too many!` };

    if (op === "+") {
      const fillable = Math.min(n, uf);
      fH += fillable;
      lP += n - fillable;
    } else if (op === "−") {
      const removable = Math.min(n, lP);
      lP -= removable;
      hC += n - removable;
    } else if (op === "×") {
      // Simplify: cancel filled holes before scaling
      hC = hC - fH;
      fH = 0;
      let newNum = bC * n;
      const g = gcd(newNum, sL);
      bC = newNum / g;
      sL = sL / g;
      lP *= n;
      hC *= n;
    } else if (op === "÷") {
      // Simplify: cancel filled holes before scaling
      hC = hC - fH;
      fH = 0;
      let newDen = sL * n;
      const g = gcd(bC, newDen);
      bC = bC / g;
      sL = newDen / g;
      lP = lP / n;
      hC = hC / n;
    }

    return { boxCount: bC, sliceLines: sL, loosePills: lP, holeCount: hC, filledHoles: fH };
  }

  // Apply computed state
  function applyLeftState(newState) {
    setBoxCount(newState.boxCount);
    setSliceLines(newState.sliceLines);
    setLoosePills(newState.loosePills);
    setHoleCount(newState.holeCount);
    setFilledHoles(newState.filledHoles);
  }

  // Check if the current (or given) state is solved
  function isSolved(state) {
    const s = state || { boxCount, sliceLines, loosePills, holeCount, filledHoles };
    return s.boxCount === 1 && s.sliceLines === 1 && s.loosePills === 0 && (s.holeCount - s.filledHoles) === 0;
  }

  function fmt(n) {
    return Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(4)).toString();
  }

  function buildEquationString() {
    let varSide = "";
    if (boxCount > 1 && sliceLines > 1) varSide = `${boxCount}${varName}/${sliceLines}`;
    else if (sliceLines > 1) varSide = `${varName}/${sliceLines}`;
    else if (boxCount > 1) varSide = `${boxCount}${varName}`;
    else varSide = varName;
    if (loosePills > 0) varSide += ` + ${fmt(loosePills)}`;
    if (unfilled > 0) varSide += ` − ${fmt(unfilled)}`;
    const numSide = fmt(rPills);
    return level.flipped ? `${numSide} = ${varSide}` : `${varSide} = ${numSide}`;
  }

  // Build equation string from the level definition (not from mutable state)
  function buildInitialEquationString() {
    const initSlice = isMulType ? level.divisor : 1;
    const v = varName;
    let varSide = "";
    if (level.initBoxes > 1 && initSlice > 1) varSide = `${level.initBoxes}${v}/${initSlice}`;
    else if (initSlice > 1) varSide = `${v}/${initSlice}`;
    else if (level.initBoxes > 1) varSide = `${level.initBoxes}${v}`;
    else varSide = v;
    if (level.initPills > 0) varSide += ` + ${fmt(level.initPills)}`;
    if (level.initSlots > 0) varSide += ` − ${fmt(level.initSlots)}`;
    const numSide = fmt(level.rightPills);
    return level.flipped ? `${numSide} = ${varSide}` : `${varSide} = ${numSide}`;
  }

  function markSolved() {
    setBoxOpen(true);
    setShowCeleb(true);
    setTimeout(() => setShowCeleb(false), 3000);
  }

  function resetToLevel() {
    setBoxCount(level.initBoxes);
    setSliceLines(isMulType ? level.divisor : 1);
    setLoosePills(level.initPills);
    setHoleCount(level.initSlots);
    setFilledHoles(0);
    setRPills(level.rightPills);
    setBoxOpen(false);
    setShowCeleb(false);
    setSteps([]);
  }

  return {
    boxCount, setBoxCount,
    sliceLines, setSliceLines,
    loosePills, setLoosePills,
    holeCount, setHoleCount,
    filledHoles, setFilledHoles,
    rPills, setRPills,
    varName, setVarName,
    showPicker, togglePicker, closePicker,
    boxOpen, setBoxOpen,
    showCeleb,
    steps, setSteps,
    unfilled,
    computeLeftOp, applyLeftState,
    isSolved, buildEquationString, buildInitialEquationString,
    markSolved, resetToLevel,
  };
}
