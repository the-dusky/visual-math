"use client";

import { useState, useCallback } from "react";
import { distribute, distributedToString } from "../parser";

export function useAdvancedDistribution(level) {
  const [phase, setPhase] = useState("distribute"); // "distribute" | "done"
  const [showCeleb, setShowCeleb] = useState(false);

  const resultTerms = distribute(level);
  const resultString = distributedToString(resultTerms);

  const onDistributeComplete = useCallback(() => {
    setPhase("done");
    setShowCeleb(true);
    const t = setTimeout(() => setShowCeleb(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const reset = useCallback(() => {
    setPhase("distribute");
    setShowCeleb(false);
  }, []);

  return {
    phase,
    showCeleb,
    resultTerms,
    resultString,
    onDistributeComplete,
    reset,
  };
}
