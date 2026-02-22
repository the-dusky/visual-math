"use client";

import { useState, useEffect, useRef } from "react";
import { useEquationState } from "./useEquationState";

export function useSolveLogic(level) {
  const eq = useEquationState(level);
  const {
    boxCount, sliceLines, holeCount, filledHoles,
    rPills, setRPills, varName, steps, setSteps,
    markSolved, resetToLevel,
  } = eq;

  const isSubFirst = level.type === "subtraction" || level.type === "twostep_sub";
  const isTwoStep = level.type === "twostep" || level.type === "twostep_sub";
  const isMulType = level.type === "multiply";
  const isDivType = level.type === "division";
  const needsBoxStep = isDivType || isMulType;

  // Visual state (for wrong answer display)
  const [visBoxCount, setVisBoxCount] = useState(level.initBoxes);
  const [visSliceLines, setVisSliceLines] = useState(isMulType ? level.divisor : 1);
  const [visRPills, setVisRPills] = useState(level.rightPills);
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [visSplitBoxes, setVisSplitBoxes] = useState(null);
  const [visSplitCount, setVisSplitCount] = useState(null);

  // Phase
  const initPhase = needsBoxStep ? "boxOp" : "left";
  const [solvePhase, setSolvePhase] = useState(initPhase);
  const [stepIndex, setStepIndex] = useState(0);

  // Box operation inputs
  const [boxOpChoice, setBoxOpChoice] = useState(null);
  const [boxOpNum, setBoxOpNum] = useState("");
  const [boxOpError, setBoxOpError] = useState("");
  const [boxOpDone, setBoxOpDone] = useState(false);

  // Per-box input
  const [perBoxInput, setPerBoxInput] = useState("");
  const [perBoxError, setPerBoxError] = useState("");

  // Left/right step inputs
  const [leftOp, setLeftOp] = useState(isSubFirst ? "+" : "−");
  const [leftNum, setLeftNum] = useState("");
  const [leftError, setLeftError] = useState("");
  const [leftDone, setLeftDone] = useState(false);

  const [rightOp, setRightOp] = useState(isSubFirst ? "+" : "−");
  const [rightNum, setRightNum] = useState("");
  const [rightError, setRightError] = useState("");
  const [rightDone, setRightDone] = useState(false);

  // Compute input
  const [computeVal, setComputeVal] = useState("");
  const [computeError, setComputeError] = useState("");

  // Refs
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const computeRef = useRef(null);
  const boxNumRef = useRef(null);
  const perBoxRef = useRef(null);

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => {
      if (solvePhase === "left" && leftRef.current) leftRef.current.focus();
      if (solvePhase === "right" && rightRef.current) rightRef.current.focus();
      if (solvePhase === "compute" && computeRef.current) computeRef.current.focus();
      if (solvePhase === "boxOp" && boxOpChoice && boxNumRef.current) boxNumRef.current.focus();
      if (solvePhase === "perBox" && perBoxRef.current) perBoxRef.current.focus();
      if (solvePhase === "finalAnswer" && computeRef.current) computeRef.current.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [solvePhase, stepIndex, boxOpChoice]);

  const solved = eq.boxOpen;

  function getExp() {
    if (level.type === "addition") return { op: "−", num: level.initPills, rBefore: level.rightPills, rAfter: level.boxValue };
    if (level.type === "subtraction") return { op: "+", num: level.initSlots, rBefore: level.rightPills, rAfter: level.boxValue };
    if (level.type === "division") return { op: "÷", num: level.initBoxes, rBefore: level.rightPills, rAfter: level.boxValue };
    if (level.type === "multiply") return { op: "×", num: level.divisor, rBefore: level.rightPills, rAfter: level.boxValue };
    if (level.type === "twostep") {
      const m = level.rightPills - level.initPills;
      return stepIndex === 0
        ? { op: "−", num: level.initPills, rBefore: level.rightPills, rAfter: m }
        : { op: "÷", num: level.initBoxes, rBefore: m, rAfter: level.boxValue };
    }
    if (level.type === "twostep_sub") {
      const m = level.rightPills + level.initSlots;
      return stepIndex === 0
        ? { op: "+", num: level.initSlots, rBefore: level.rightPills, rAfter: m }
        : { op: "÷", num: level.initBoxes, rBefore: m, rAfter: level.boxValue };
    }
    return null;
  }

  const exp = getExp();
  const isDivStep = exp && (exp.op === "÷" || exp.op === "×");

  function submitBoxOp() {
    const n = parseFloat(boxOpNum);
    if (isNaN(n) || n <= 0) { setBoxOpError("Enter a number"); return; }

    if (boxOpChoice === exp.op && n === exp.num) {
      setBoxOpError("");
      setBoxOpDone(true);
      setWrongAnswer(null);
      if (exp.op === "÷") {
        setVisSplitBoxes(n);
        setVisSplitCount(rPills / n);
        setSteps((s) => [...s, `÷${n} both sides`]);
        setSolvePhase("perBox");
      } else {
        setVisSliceLines(1);
        setVisRPills(rPills * n);
        setRPills(rPills * n);
        setSteps((s) => [...s, `×${n} both sides`]);
        setSolvePhase("boxCompute");
      }
      return;
    }

    setBoxOpError("");
    if (boxOpChoice === "×") {
      const nc = visBoxCount * n;
      if (nc > 20) { setBoxOpError("Too many!"); return; }
      setVisBoxCount(nc);
      setVisRPills(rPills * n);
      setWrongAnswer({ desc: `${nc} boxes now — more, not one ${varName}!` });
    } else {
      const ns = visSliceLines * n;
      setVisSliceLines(ns);
      setVisRPills(Math.max(1, Math.round(rPills / n)));
      setWrongAnswer({
        desc: isDivType
          ? `Each box sliced ÷${n} — fragments!`
          : `Box now ÷${ns} — even smaller!`,
      });
    }
    setBoxOpNum("");
  }

  function undoWrong() {
    setWrongAnswer(null);
    setVisBoxCount(boxCount);
    setVisSliceLines(sliceLines);
    setVisRPills(rPills);
    setVisSplitBoxes(null);
    setVisSplitCount(null);
    setBoxOpChoice(null);
    setBoxOpNum("");
    setBoxOpError("");
  }

  function submitPerBox() {
    const a = parseFloat(perBoxInput);
    if (isNaN(a)) { setPerBoxError("?"); return; }
    if (a !== exp.rAfter) { setPerBoxError(`What is ${rPills} ÷ ${exp.num}?`); return; }
    setPerBoxError("");
    setSolvePhase("finalAnswer");
    setComputeVal("");
  }

  function submitBoxCompute() {
    const a = parseFloat(computeVal);
    if (isNaN(a)) { setComputeError("?"); return; }
    if (a !== level.boxValue) { setComputeError(`What is ${level.rightPills} × ${level.divisor}?`); return; }
    setComputeError("");
    setSolvePhase("finalAnswer");
    setComputeVal("");
  }

  function submitLeft() {
    const n = parseFloat(leftNum);
    if (isNaN(n) || n <= 0) { setLeftError("Enter a number"); return; }
    if (leftOp !== exp.op || n !== exp.num) {
      setLeftError(leftOp !== exp.op ? "Think about what undoes what you see" : "Right op! Check the number");
      return;
    }
    setLeftError("");
    setLeftDone(true);
    setSolvePhase("right");
    setRightOp(exp.op);
  }

  function submitRight() {
    const n = parseFloat(rightNum);
    if (isNaN(n) || n <= 0) { setRightError("Enter a number"); return; }
    if (rightOp !== exp.op || n !== exp.num) { setRightError("Both sides need the same!"); return; }
    setRightError("");
    setRightDone(true);

    if (exp.op === "−") {
      eq.setLoosePills(0);
      setRPills(exp.rAfter);
      setVisRPills(exp.rAfter);
    } else if (exp.op === "+") {
      eq.setFilledHoles(holeCount);
      setRPills(exp.rAfter);
      setVisRPills(exp.rAfter);
    }
    setSteps((s) => [...s, `${exp.op}${exp.num} both sides`]);
    setSolvePhase("compute");
  }

  function submitCompute() {
    const a = parseFloat(computeVal);
    if (isNaN(a)) { setComputeError("?"); return; }
    if (a !== exp.rAfter) { setComputeError("Not quite!"); return; }
    setComputeError("");

    if (isTwoStep && stepIndex === 0) {
      setStepIndex(1);
      setLeftOp("÷"); setLeftNum(""); setLeftError(""); setLeftDone(false);
      setRightOp("÷"); setRightNum(""); setRightError(""); setRightDone(false);
      setComputeVal("");
      setBoxOpChoice(null); setBoxOpNum(""); setBoxOpError(""); setBoxOpDone(false);
      setPerBoxInput(""); setPerBoxError("");
      setVisBoxCount(level.initBoxes); setVisSliceLines(1);
      setVisSplitBoxes(null); setVisSplitCount(null);
      setSolvePhase("boxOp");
    } else {
      setSolvePhase("finalAnswer");
      setComputeVal("");
    }
  }

  function submitFinal() {
    const a = parseFloat(computeVal);
    if (a !== level.boxValue) { setComputeError("Not quite!"); return; }
    eq.setBoxOpen(true);
    setVisSliceLines(1);
    setSteps((s) => [...s, `${varName} = ${level.boxValue}`]);
    markSolved();
  }

  function reset() {
    resetToLevel();
    setVisRPills(level.rightPills);
    setStepIndex(0);
    setSolvePhase(initPhase);
    setVisBoxCount(level.initBoxes);
    setVisSliceLines(isMulType ? level.divisor : 1);
    setVisSplitBoxes(null);
    setVisSplitCount(null);
    setWrongAnswer(null);
    setBoxOpChoice(null); setBoxOpNum(""); setBoxOpError(""); setBoxOpDone(false);
    setPerBoxInput(""); setPerBoxError("");
    setLeftOp(isSubFirst ? "+" : "−"); setLeftNum(""); setLeftError(""); setLeftDone(false);
    setRightOp(isSubFirst ? "+" : "−"); setRightNum(""); setRightError(""); setRightDone(false);
    setComputeVal(""); setComputeError("");
  }

  const showSplit = visSplitBoxes && (solvePhase === "perBox" || solvePhase === "finalAnswer" || solved);

  const msg = solved ? `${varName} = ${level.boxValue}`
    : wrongAnswer ? wrongAnswer.desc
    : solvePhase === "boxOp" ? `How do we get just one ${varName}?`
    : solvePhase === "perBox" ? "How many pills in each group?"
    : solvePhase === "boxCompute" ? `${level.rightPills} × ${level.divisor} = ?`
    : solvePhase === "left" ? "What do you do to the left?"
    : solvePhase === "right" ? "Now the right?"
    : solvePhase === "compute" ? `${exp ? exp.rBefore : ""} ${exp ? exp.op : ""} ${exp ? exp.num : ""} = ?`
    : solvePhase === "finalAnswer" ? `${varName} = ?`
    : "";

  return {
    ...eq,
    solved, solvePhase, stepIndex, exp, isDivStep, msg,
    // Visual state
    visBoxCount, visSliceLines, visRPills, visSplitBoxes, visSplitCount, showSplit,
    wrongAnswer,
    // Box op
    boxOpChoice, setBoxOpChoice, boxOpNum, setBoxOpNum, boxOpError, setBoxOpError, boxOpDone,
    // Per box
    perBoxInput, setPerBoxInput, perBoxError, setPerBoxError,
    // Left/right
    leftOp, setLeftOp, leftNum, setLeftNum, leftError, leftDone,
    rightOp, setRightOp, rightNum, setRightNum, rightError, rightDone,
    // Compute
    computeVal, setComputeVal, computeError, setComputeError,
    // Refs
    leftRef, rightRef, computeRef, boxNumRef, perBoxRef,
    // Actions
    submitBoxOp, undoWrong, submitPerBox, submitBoxCompute,
    submitLeft, submitRight, submitCompute, submitFinal, reset,
  };
}
