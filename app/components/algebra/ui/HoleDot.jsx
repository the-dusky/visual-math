"use client";

export function HoleDot({ filled, fraction = 1, size = 18 }) {
  const deg = Math.round(fraction * 360);

  if (!filled) {
    // Empty hole — partial shows as partial outline circle
    const bg = fraction >= 1
      ? "#18181b"
      : `conic-gradient(from 0deg, #18181b 0deg ${deg}deg, transparent ${deg}deg 360deg)`;
    return (
      <div
        className="rounded-full shrink-0"
        style={{ width: size, height: size, background: bg, border: "1px solid #3f3f46" }}
      />
    );
  }

  // Filled hole — partial shows as partial pie
  const bg = fraction >= 1
    ? "#f59e0b"
    : `conic-gradient(from 0deg, #d97706 0deg, #f59e0b ${deg}deg, transparent ${deg}deg 360deg)`;
  return (
    <div
      className="rounded-full shrink-0"
      style={{ width: size, height: size, background: bg, border: "1px solid #d97706" }}
    />
  );
}
