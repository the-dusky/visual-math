export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
}

// Matches an integer or decimal number like 10, 0.25, .5
const NUM = String.raw`\d+\.?\d*|\.\d+`;
// Matches a possibly-negative number
const SNUM = String.raw`-?(?:${NUM})`;

export function parseEquation(input) {
  const s = input
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

  // Check for flipped format: c = expr (c can be negative)
  let flipped = false;
  let normalized = s;
  const flipMatch = s.match(new RegExp(`^(${SNUM})=(.+)$`));
  if (flipMatch && /[a-zA-Z]/.test(flipMatch[2])) {
    flipped = true;
    normalized = flipMatch[2] + "=" + flipMatch[1];
  }

  // x/d = c  →  multiply type (c can be negative for negative box values)
  const divMatch = normalized.match(new RegExp(`^([a-zA-Z])/(${NUM})=(${SNUM})$`));
  if (divMatch) {
    const v = divMatch[1];
    const d = parseFloat(divMatch[2]);
    const c = parseFloat(divMatch[3]);
    const xVal = d * c;
    if (d <= 0 || Math.abs(xVal) > 99999) return null;
    return {
      type: "multiply",
      boxValue: xVal,
      initBoxes: 1,
      initPills: 0,
      initSlots: 0,
      rightPills: c,
      divisor: d,
      variable: v,
      flipped,
    };
  }

  // ax ± b = c  (a may be negative, e.g. -5x = 10; b, c can be decimals; c can be negative)
  const match = normalized.match(new RegExp(`^(-?${NUM})?([a-zA-Z])([+-](?:${NUM}))?=(${SNUM})$`));
  if (!match) return null;

  const a = match[1] ? parseFloat(match[1]) : 1;
  const v = match[2];
  const bRaw = match[3] ? parseFloat(match[3]) : 0;
  const c = parseFloat(match[4]);

  if (isNaN(a) || isNaN(c) || a === 0) return null;

  const absA = Math.abs(a);
  const negCoeff = a < 0;
  const xVal = (c - bRaw) / a;
  if (Math.abs(xVal) > 99999 || Math.abs(c) > 99999) return null;

  const b = Math.abs(bRaw);
  const base = { boxValue: xVal, variable: v, flipped, ...(negCoeff && { negCoeff: true }) };

  if (absA === 1 && bRaw > 0)
    return { type: "addition", ...base, initBoxes: 1, initPills: b, initSlots: 0, rightPills: c };
  if (absA === 1 && bRaw < 0)
    return { type: "subtraction", ...base, initBoxes: 1, initPills: 0, initSlots: b, rightPills: c };
  if (absA === 1 && bRaw === 0)
    return { type: "identity", ...base, initBoxes: 1, initPills: 0, initSlots: 0, rightPills: c };
  if (!Number.isInteger(absA) || absA > 20) return null;
  if (absA > 1 && bRaw === 0)
    return { type: "division", ...base, initBoxes: absA, initPills: 0, initSlots: 0, rightPills: c };
  if (absA > 1 && bRaw > 0)
    return { type: "twostep", ...base, initBoxes: absA, initPills: b, initSlots: 0, rightPills: c };
  if (absA > 1 && bRaw < 0)
    return { type: "twostep_sub", ...base, initBoxes: absA, initPills: 0, initSlots: b, rightPills: c };

  return null;
}

export function levelEq(l) {
  const v = l.variable || "x";
  const fmt = (n) => Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(4)).toString();
  const neg = l.negCoeff ? "−" : "";
  let varSide, numSide;
  if (l.type === "addition") { varSide = `${neg}${v} + ${fmt(l.initPills)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "subtraction") { varSide = `${neg}${v} − ${fmt(l.initSlots)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "division") { varSide = `${neg}${fmt(l.initBoxes)}${v}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "multiply") { varSide = `${neg}${v}/${fmt(l.divisor)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "twostep") { varSide = `${neg}${fmt(l.initBoxes)}${v} + ${fmt(l.initPills)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "twostep_sub") { varSide = `${neg}${fmt(l.initBoxes)}${v} − ${fmt(l.initSlots)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "identity") { varSide = `${neg}${v}`; numSide = `${fmt(l.rightPills)}`; }
  else return "";
  return l.flipped ? `${numSide} = ${varSide}` : `${varSide} = ${numSide}`;
}
