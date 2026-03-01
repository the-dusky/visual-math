"use client";

import { useState } from "react";
import { distribute, distributedToString } from "../parser";

function normalize(s) {
  return s.replace(/\s+/g, "").replace(/−/g, "-");
}

export function useAdvancedDistributionTest(level) {
  const [phase, setPhase] = useState("input"); // "input" | "done"
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showCeleb, setShowCeleb] = useState(false);

  const resultTerms = distribute(level);
  const expected = distributedToString(resultTerms);

  function trySubmit() {
    setError("");
    if (normalize(input) === normalize(expected)) {
      setPhase("done");
      setShowCeleb(true);
      setTimeout(() => setShowCeleb(false), 3000);
    } else {
      setError(`Multiply ${level.multiplier} by each term. Try again!`);
    }
  }

  function reset() {
    setPhase("input");
    setInput("");
    setError("");
    setShowCeleb(false);
  }

  return {
    phase, input, setInput, error, showCeleb,
    resultTerms, expected,
    trySubmit, reset,
  };
}
