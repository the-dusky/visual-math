const VAR_COLORS = {
  x: { text: "text-amber-400",   stroke: "#fbbf24" },
  y: { text: "text-violet-400",  stroke: "#a78bfa" },
  z: { text: "text-emerald-400", stroke: "#34d399" },
  n: { text: "text-sky-400",     stroke: "#38bdf8" },
  h: { text: "text-rose-400",    stroke: "#fb7185" },
  a: { text: "text-orange-400",  stroke: "#fb923c" },
  b: { text: "text-cyan-400",    stroke: "#22d3ee" },
  c: { text: "text-pink-400",    stroke: "#f472b6" },
};

const FALLBACK = [
  { text: "text-lime-400",   stroke: "#a3e635" },
  { text: "text-indigo-400", stroke: "#818cf8" },
  { text: "text-teal-400",   stroke: "#2dd4bf" },
];

const CONSTANT_COLOR = { text: "text-zinc-300", stroke: "#a1a1aa" };

let fallbackIdx = 0;
const dynamicMap = {};

export function getTermColor(variable) {
  if (!variable) return CONSTANT_COLOR;
  if (VAR_COLORS[variable]) return VAR_COLORS[variable];
  if (!dynamicMap[variable]) {
    dynamicMap[variable] = FALLBACK[fallbackIdx % FALLBACK.length];
    fallbackIdx++;
  }
  return dynamicMap[variable];
}

export { VAR_COLORS, CONSTANT_COLOR };
