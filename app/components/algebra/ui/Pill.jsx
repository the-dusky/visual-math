"use client";

// --- Positive pills ---

function UnitPill() {
  return (
    <div
      className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b 50%, #d97706)" }}
    >
      <span className="text-[8px] font-extrabold text-amber-900 leading-none">+1</span>
    </div>
  );
}

const denomStyles = {
  10000: { size: "w-9 h-9", colors: "from-purple-400 via-purple-500 to-purple-700", label: "+10K", text: "text-[9px]" },
  1000:  { size: "w-9 h-9", colors: "from-rose-400 via-rose-500 to-rose-600", label: "+1K", text: "text-[9px]" },
  100:   { size: "w-9 h-9", colors: "from-sky-400 via-sky-500 to-sky-600", label: "+100", text: "text-[9px]" },
  10:    { size: "w-9 h-9", colors: "from-emerald-400 via-emerald-500 to-emerald-600", label: "+10", text: "text-[9px]" },
};

function DenomPill({ value }) {
  const s = denomStyles[value];
  return (
    <div className={`${s.size} rounded-full shrink-0 bg-gradient-to-br ${s.colors} flex items-center justify-center`}>
      <span className={`${s.text} font-extrabold text-white leading-none drop-shadow-sm`}>{s.label}</span>
    </div>
  );
}

const decStyles = {
  0.25: { size: "w-6 h-6", label: ".25", text: "text-[7px]", grad: "linear-gradient(135deg, #c084fc, #a855f7 50%, #7c3aed)", textColor: "text-purple-950" },
  0.10: { size: "w-5.5 h-5.5", label: ".10", text: "text-[7px]", grad: "linear-gradient(135deg, #fb7185, #f43f5e 50%, #e11d48)", textColor: "text-rose-950" },
  0.05: { size: "w-5 h-5", label: ".05", text: "text-[6.5px]", grad: "linear-gradient(135deg, #7dd3fc, #38bdf8 50%, #0284c7)", textColor: "text-sky-950" },
  0.01: { size: "w-4.5 h-4.5", label: ".01", text: "text-[6px]", grad: "linear-gradient(135deg, #6ee7b7, #34d399 50%, #059669)", textColor: "text-emerald-950" },
};

function DecimalPill({ value, fraction = 1 }) {
  const s = decStyles[value];
  const deg = Math.round(fraction * 360);
  const bg = fraction >= 1
    ? s.grad
    : `conic-gradient(from 0deg, #059669 0deg, #34d399 ${deg * 0.5}deg, #6ee7b7 ${deg}deg, transparent ${deg}deg 360deg)`;
  return (
    <div
      className={`${s.size} rounded-full shrink-0 flex items-center justify-center`}
      style={{ background: bg }}
    >
      <span className={`${s.text} font-extrabold ${s.textColor} leading-none`}>{s.label}</span>
    </div>
  );
}

// --- Negative (hole) pills ---

function UnitHole() {
  return (
    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-surface">
      <span className="text-[8px] font-extrabold text-zinc-400 leading-none">−1</span>
    </div>
  );
}

const denomHoleLabels = { 10000: "−10K", 1000: "−1K", 100: "−100", 10: "−10" };

function DenomHole({ value }) {
  return (
    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center bg-surface">
      <span className="text-[9px] font-extrabold text-zinc-400 leading-none">{denomHoleLabels[value]}</span>
    </div>
  );
}

const decHoleLabels = { 0.25: "−.25", 0.10: "−.10", 0.05: "−.05", 0.01: "−.01" };
const decHoleSizes = { 0.25: "w-6 h-6", 0.10: "w-5.5 h-5.5", 0.05: "w-5 h-5", 0.01: "w-4.5 h-4.5" };

function DecimalHole({ value }) {
  return (
    <div className={`${decHoleSizes[value]} rounded-full shrink-0 flex items-center justify-center bg-surface`}>
      <span className="text-[6px] font-extrabold text-zinc-400 leading-none">{decHoleLabels[value]}</span>
    </div>
  );
}

// --- Decomposition ---

const DENOMS = [10000, 1000, 100, 10];
const DECIMALS = [0.25, 0.10, 0.05, 0.01];

function decompose(count) {
  const pills = [];
  let remaining = Math.floor(count);
  let frac = +(count - remaining).toFixed(4);

  // Whole denominations
  for (const d of DENOMS) {
    const n = Math.floor(remaining / d);
    for (let i = 0; i < n; i++) pills.push({ type: "denom", value: d });
    remaining -= n * d;
  }
  // Unit pills
  for (let i = 0; i < remaining; i++) pills.push({ type: "unit" });

  // Decimal denominations
  if (frac > 0) {
    for (const d of DECIMALS) {
      const n = Math.floor(+(frac / d).toFixed(4));
      if (n > 0) {
        // For .01, allow fractional last pill
        if (d === 0.01) {
          const leftover = +(frac).toFixed(4);
          const wholeOnes = Math.floor(+(leftover / 0.01).toFixed(4));
          const remainder = +(leftover - wholeOnes * 0.01).toFixed(4);
          for (let i = 0; i < wholeOnes; i++) pills.push({ type: "decimal", value: 0.01 });
          if (remainder > 0.0001) pills.push({ type: "decimal", value: 0.01, fraction: remainder / 0.01 });
          frac = 0;
        } else {
          for (let i = 0; i < n; i++) pills.push({ type: "decimal", value: d });
          frac = +(frac - n * d).toFixed(4);
        }
      }
    }
  }

  return pills;
}

// --- PillGroup ---

export function PillGroup({ count, holes = 0 }) {
  // Negative count auto-converts to holes
  const effectiveCount = count >= 0 ? count : 0;
  const effectiveHoles = holes + (count < 0 ? Math.abs(count) : 0);

  if (effectiveCount <= 0 && effectiveHoles <= 0) return null;

  const positive = effectiveCount > 0 ? decompose(effectiveCount) : [];
  const negative = effectiveHoles > 0 ? decompose(effectiveHoles) : [];

  return (
    <div className="flex gap-1 flex-wrap justify-center items-center max-w-[220px]">
      {positive.map((p, i) =>
        p.type === "denom" ? (
          <DenomPill key={`p${i}`} value={p.value} />
        ) : p.type === "decimal" ? (
          <DecimalPill key={`p${i}`} value={p.value} fraction={p.fraction} />
        ) : (
          <UnitPill key={`p${i}`} />
        )
      )}
      {negative.map((p, i) =>
        p.type === "denom" ? (
          <DenomHole key={`h${i}`} value={p.value} />
        ) : p.type === "decimal" ? (
          <DecimalHole key={`h${i}`} value={p.value} />
        ) : (
          <UnitHole key={`h${i}`} />
        )
      )}
    </div>
  );
}
