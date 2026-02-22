export function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

export function parseEquation(input) {
  const s = input
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

  // x/d = c  →  multiply type
  const divMatch = s.match(/^([a-zA-Z])\/(\d+)=(\d+)$/);
  if (divMatch) {
    const v = divMatch[1];
    const d = parseInt(divMatch[2]);
    const c = parseInt(divMatch[3]);
    const xVal = d * c;
    if (d <= 0 || c <= 0 || xVal > 50) return null;
    return {
      type: "multiply",
      boxValue: xVal,
      initBoxes: 1,
      initPills: 0,
      initSlots: 0,
      rightPills: c,
      divisor: d,
      variable: v,
    };
  }

  // ax ± b = c
  const match = s.match(/^(\d*)([a-zA-Z])([+-]\d+)?=(\d+)$/);
  if (!match) return null;

  const a = match[1] ? parseInt(match[1]) : 1;
  const v = match[2];
  const bRaw = match[3] ? parseInt(match[3]) : 0;
  const c = parseInt(match[4]);

  if (isNaN(a) || isNaN(c) || a <= 0 || c < 0) return null;

  const xVal = (c - bRaw) / a;
  if (xVal <= 0 || !Number.isInteger(xVal) || xVal > 50 || c > 50) return null;

  const b = Math.abs(bRaw);

  if (a === 1 && bRaw > 0)
    return { type: "addition", boxValue: xVal, initBoxes: 1, initPills: b, initSlots: 0, rightPills: c, variable: v };
  if (a === 1 && bRaw < 0)
    return { type: "subtraction", boxValue: xVal, initBoxes: 1, initPills: 0, initSlots: b, rightPills: c, variable: v };
  if (a === 1) return null;
  if (a > 1 && bRaw === 0)
    return { type: "division", boxValue: xVal, initBoxes: a, initPills: 0, initSlots: 0, rightPills: c, variable: v };
  if (a > 1 && bRaw > 0)
    return { type: "twostep", boxValue: xVal, initBoxes: a, initPills: b, initSlots: 0, rightPills: c, variable: v };
  if (a > 1 && bRaw < 0)
    return { type: "twostep_sub", boxValue: xVal, initBoxes: a, initPills: 0, initSlots: b, rightPills: c, variable: v };

  return null;
}

export function levelEq(l) {
  const v = l.variable || "x";
  if (l.type === "addition") return `${v} + ${l.initPills} = ${l.rightPills}`;
  if (l.type === "subtraction") return `${v} − ${l.initSlots} = ${l.rightPills}`;
  if (l.type === "division") return `${l.initBoxes}${v} = ${l.rightPills}`;
  if (l.type === "multiply") return `${v}/${l.divisor} = ${l.rightPills}`;
  if (l.type === "twostep") return `${l.initBoxes}${v} + ${l.initPills} = ${l.rightPills}`;
  if (l.type === "twostep_sub") return `${l.initBoxes}${v} − ${l.initSlots} = ${l.rightPills}`;
  return "";
}
