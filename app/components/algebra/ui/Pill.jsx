"use client";

export function Pill({ small, fraction = 1 }) {
  const deg = Math.round(fraction * 360);
  const bg =
    fraction >= 1
      ? "linear-gradient(135deg, #fbbf24, #f59e0b 50%, #d97706)"
      : `conic-gradient(from 0deg, #d97706 0deg, #f59e0b ${deg * 0.5}deg, #fbbf24 ${deg}deg, transparent ${deg}deg 360deg)`;

  return (
    <div
      className={`rounded-full shrink-0 ${small ? "w-5 h-5" : "w-7 h-7"}`}
      style={{ background: bg }}
    />
  );
}

export function PillGroup({ count, small }) {
  if (count <= 0) return null;
  const whole = Math.floor(count);
  const frac = +(count - whole).toFixed(4);
  const show = Math.min(whole, 30);

  return (
    <div className="flex gap-1 flex-wrap justify-center max-w-[200px]">
      {Array(show)
        .fill(0)
        .map((_, i) => (
          <Pill key={i} small={small} />
        ))}
      {frac > 0 && <Pill key="frac" small={small} fraction={frac} />}
      {whole > 30 && (
        <span className="text-[10px] text-text-faint">+{whole - 30}</span>
      )}
    </div>
  );
}
