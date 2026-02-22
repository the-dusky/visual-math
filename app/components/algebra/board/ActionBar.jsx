"use client";

export function ActionBar({ onReset, onNext, showNext }) {
  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={onReset}
        className="py-2.5 px-6 rounded-lg border border-border bg-transparent text-text-muted font-semibold cursor-pointer text-sm hover:border-border-strong hover:text-text-secondary transition-colors"
      >
        Reset
      </button>
      {showNext && (
        <button
          onClick={onNext}
          className="py-2.5 px-6 rounded-lg border-none bg-cta text-surface font-bold cursor-pointer text-sm hover:bg-cta-hover transition-colors"
        >
          Next &rarr;
        </button>
      )}
    </div>
  );
}
