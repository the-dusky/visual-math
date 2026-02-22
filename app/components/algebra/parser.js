export function gcd(a, b) {
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

  // ax ± b = c  (a, b, c can be decimals; c can be negative)
  const match = normalized.match(new RegExp(`^(${NUM})?([a-zA-Z])([+-](?:${NUM}))?=(${SNUM})$`));
  if (!match) return null;

  const a = match[1] ? parseFloat(match[1]) : 1;
  const v = match[2];
  const bRaw = match[3] ? parseFloat(match[3]) : 0;
  const c = parseFloat(match[4]);

  if (isNaN(a) || isNaN(c) || a <= 0) return null;

  const xVal = (c - bRaw) / a;
  if (xVal <= 0 || xVal > 99999 || Math.abs(c) > 99999) return null;

  const b = Math.abs(bRaw);

  if (a === 1 && bRaw > 0)
    return { type: "addition", boxValue: xVal, initBoxes: 1, initPills: b, initSlots: 0, rightPills: c, variable: v, flipped };
  if (a === 1 && bRaw < 0)
    return { type: "subtraction", boxValue: xVal, initBoxes: 1, initPills: 0, initSlots: b, rightPills: c, variable: v, flipped };
  if (a === 1) return null;
  if (!Number.isInteger(a) || a > 20) return null; // box count must be a reasonable integer
  if (a > 1 && bRaw === 0)
    return { type: "division", boxValue: xVal, initBoxes: a, initPills: 0, initSlots: 0, rightPills: c, variable: v, flipped };
  if (a > 1 && bRaw > 0)
    return { type: "twostep", boxValue: xVal, initBoxes: a, initPills: b, initSlots: 0, rightPills: c, variable: v, flipped };
  if (a > 1 && bRaw < 0)
    return { type: "twostep_sub", boxValue: xVal, initBoxes: a, initPills: 0, initSlots: b, rightPills: c, variable: v, flipped };

  return null;
}

export function levelEq(l) {
  const v = l.variable || "x";
  const fmt = (n) => Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(4)).toString();
  let varSide, numSide;
  if (l.type === "addition") { varSide = `${v} + ${fmt(l.initPills)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "subtraction") { varSide = `${v} − ${fmt(l.initSlots)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "division") { varSide = `${fmt(l.initBoxes)}${v}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "multiply") { varSide = `${v}/${fmt(l.divisor)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "twostep") { varSide = `${fmt(l.initBoxes)}${v} + ${fmt(l.initPills)}`; numSide = `${fmt(l.rightPills)}`; }
  else if (l.type === "twostep_sub") { varSide = `${fmt(l.initBoxes)}${v} − ${fmt(l.initSlots)}`; numSide = `${fmt(l.rightPills)}`; }
  else return "";
  return l.flipped ? `${numSide} = ${varSide}` : `${varSide} = ${numSide}`;
}
