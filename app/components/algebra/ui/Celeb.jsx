"use client";

import { useState } from "react";

const COLORS = ["#fbbf24", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#f97316"];

export function Celeb() {
  const [particles] = useState(() =>
    Array(40)
      .fill(0)
      .map(() => ({
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 1.5 + Math.random() * 1.5,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        drift: -30 + Math.random() * 60,
        rot: Math.random() * 720,
        shape: Math.random() > 0.5 ? "circle" : "rect",
      }))
  );

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute -top-2.5"
          style={{
            left: `${p.x}%`,
            width: p.shape === "circle" ? p.size : p.size * 0.6,
            height: p.size,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            background: p.color,
            "--drift": `${p.drift}px`,
            "--rot": `${p.rot}deg`,
            animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
