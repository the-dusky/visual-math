import { gcd } from "../algebra/parser";

const NUM = String.raw`\d+\.?\d*|\.\d+`;
const SNUM = String.raw`-?(?:${NUM})`;

export function parseDistribution(input) {
  const s = input
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

  // Match: a(bx+c)=d  or  a(bx-c)=d  or  a(x+c)=d
  const m = s.match(
    new RegExp(`^(${NUM})\\((${NUM})?([a-zA-Z])([+-]${NUM})\\)=(${SNUM})$`)
  );
  if (!m) return null;

  const multiplier = parseFloat(m[1]);
  const innerBoxes = m[2] ? parseFloat(m[2]) : 1;
  const variable = m[3];
  const innerPills = parseFloat(m[4]);
  const rightPills = parseFloat(m[5]);

  if (multiplier <= 0 || !Number.isInteger(multiplier) || multiplier > 20) return null;
  if (!Number.isInteger(innerBoxes) || innerBoxes <= 0 || innerBoxes > 20) return null;
  if (!Number.isInteger(innerPills)) return null;

  const totalBoxes = multiplier * innerBoxes;
  const totalPills = multiplier * innerPills;
  const boxValue = (rightPills - totalPills) / totalBoxes;

  if (!isFinite(boxValue) || Math.abs(boxValue) > 99999) return null;

  return {
    type: "distribution",
    multiplier,
    innerBoxes,
    innerPills,
    rightPills,
    boxValue,
    variable,
  };
}

export function levelDistEq(l) {
  const v = l.variable || "x";
  const fmt = (n) => Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(4)).toString();
  const inner = l.innerBoxes === 1 ? v : `${l.innerBoxes}${v}`;
  const sign = l.innerPills >= 0 ? "+" : "−";
  const absP = Math.abs(l.innerPills);
  return `${l.multiplier}(${inner} ${sign} ${absP}) = ${fmt(l.rightPills)}`;
}

export { gcd };
