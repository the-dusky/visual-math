"use client";

const OPS = ["\u2212", "+", "\u00d7", "\u00f7"];

export function OperationRow({ label, op, num, setOp, setNum, go, err, done, inputRef }) {
  return (
    <div
      className={`flex flex-col items-center gap-3 p-4 px-5 rounded-xl border
        ${done ? "bg-ok/10 border-ok-dim" : "bg-surface-raised border-border"}`}
    >
      <span className="uppercase tracking-widest text-text-muted font-medium text-[10px]">{label}</span>
      <div className="flex items-center gap-1">
        {OPS.map((o) => (
          <button
            key={o}
            onClick={() => !done && setOp(o)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border text-sm font-extrabold transition-colors
              ${op === o
                ? "bg-accent border-accent-dim text-surface"
                : "bg-surface-raised border-border text-text-muted hover:text-text-secondary"
              }
              ${done ? "opacity-60 cursor-default" : "cursor-pointer"}`}
          >
            {o}
          </button>
        ))}
        <input
          ref={inputRef}
          type="number"
          value={num}
          disabled={done}
          onChange={(e) => setNum(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !done) go(); }}
          placeholder="?"
          className={`w-11 h-9 sm:h-10 rounded-lg border border-border text-[15px] font-extrabold text-center font-mono outline-none
            ${done ? "bg-surface text-ok-text" : "bg-surface text-accent focus:border-border-strong"}`}
        />
        {!done && (
          <button
            onClick={go}
            className="px-4 py-2 rounded-lg border-none bg-action text-white font-bold cursor-pointer text-xs hover:bg-action-dim transition-colors"
          >
            &rarr;
          </button>
        )}
      </div>
      {err && <span className="text-[11px] text-err-text text-center">{err}</span>}
    </div>
  );
}
