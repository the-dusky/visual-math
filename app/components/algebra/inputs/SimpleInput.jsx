"use client";

export function SimpleInput({ label, val, set, go, err, inputRef }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 px-5 rounded-xl bg-surface-raised border border-border">
      <span className="text-xs text-accent font-bold font-mono">{label}</span>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          value={val}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") go(); }}
          placeholder="?"
          className="w-13 h-10 rounded-lg border border-border bg-surface text-ok-text text-[17px] font-extrabold text-center font-mono outline-none focus:border-border-strong"
        />
        <button
          onClick={go}
          className="px-4 py-2.5 rounded-lg border-none bg-ok text-surface font-bold cursor-pointer text-xs hover:bg-ok-dim transition-colors"
        >
          Check
        </button>
      </div>
      {err && (
        <span className="text-[11px] text-err-text text-center max-w-60">{err}</span>
      )}
    </div>
  );
}
