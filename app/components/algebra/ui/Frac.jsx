"use client";

export function Frac({ top, bottom, size = 20 }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-[3px] leading-none">
      <span className="font-extrabold font-mono text-text" style={{ fontSize: size }}>
        {top}
      </span>
      <span className="w-[110%] h-[1px] rounded-sm bg-text-muted" />
      <span className="font-extrabold font-mono text-text" style={{ fontSize: size }}>
        {bottom}
      </span>
    </span>
  );
}

export function EquationDisplay({ text, size = 22, equalsOverride, colorClass }) {
  const parts = text.split(/(\s+|(?<=[=><≥≤])|(?=[=><≥≤]))/g).filter(Boolean);

  return (
    <span
      className={`font-extrabold font-mono tracking-wider ${colorClass || "text-text"}`}
      style={{ fontSize: size }}
    >
      {parts.map((part, i) => {
        if (/^[=><≥≤]$/.test(part) && equalsOverride) {
          return <span key={i}>{equalsOverride}</span>;
        }
        const fracMatch = part.match(/^(\d*[a-zA-Z]?)\/(\d+)$/);
        if (fracMatch) {
          return <Frac key={i} top={fracMatch[1]} bottom={fracMatch[2]} size={size * 0.75} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
