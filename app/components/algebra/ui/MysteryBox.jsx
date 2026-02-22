"use client";

function VarPicker({ current, onPick, onClose }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 bg-surface-raised border border-border rounded-xl p-2 flex flex-wrap gap-1 max-w-[200px] justify-center">
      {"abcdefghijklmnopqrstuvwxyz".split("").map((l) => (
        <button
          key={l}
          onClick={() => { onPick(l); onClose(); }}
          className={`w-[26px] h-[26px] rounded-md border-none text-[13px] font-bold cursor-pointer font-mono
            ${l === current
              ? "bg-accent text-surface"
              : "bg-surface text-text-muted hover:text-text-secondary"
            }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function MysteryBox({
  open, value, small,
  sliceLines: lines = 1, variable, onClickVar, showPicker,
  onPickVar, onClosePicker, greyed, activeSlice,
}) {
  const sz = small ? 56 : 86;
  const v = variable || "x";
  const showSliceGreying = activeSlice && lines > 1 && !open;
  const showLines = lines > 1 && !open && !greyed;
  const bleed = 10;
  const lidH = sz;
  const r = small ? 6 : 8;

  const boxBg = greyed ? "#27272a" : "#92400e";
  const borderColor = greyed ? "#3f3f46" : "#f59e0b";
  const springH = Math.round(sz * 0.18);

  // Badge grows with digit length
  const valStr = String(value ?? "");
  const len = valStr.length;
  const baseBadge = small ? sz * 0.55 : sz * 0.65;
  const numBadge = len <= 2 ? baseBadge : baseBadge + (len - 2) * (small ? 8 : 12);
  const badgeFont = len <= 2
    ? (small ? 20 : 28)
    : Math.max(small ? 12 : 14, (small ? 20 : 28) - (len - 2) * (small ? 3 : 4));

  return (
    <div className="flex flex-col items-center relative">
      <div className="relative overflow-visible" style={{ width: sz + bleed * 2, height: sz }}>

        {/* Jack-in-the-box: number on a spring */}
        <div
          className="absolute left-1/2 z-5 flex flex-col items-center pointer-events-none"
          style={{
            bottom: sz / 2,
            transform: open
              ? `translateX(-50%) translateY(0px)`
              : `translateX(-50%) translateY(${springH + numBadge}px)`,
            opacity: open ? 1 : 0,
            transition: open
              ? "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s, opacity 0.2s ease 0.15s"
              : "transform 0.3s ease, opacity 0.15s ease",
          }}
        >
          {/* Number badge */}
          <div
            className="rounded-full flex items-center justify-center font-extrabold shadow-lg"
            style={{
              width: numBadge,
              height: numBadge,
              fontSize: badgeFont,
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              border: "2px solid #d97706",
              color: "#92400e",
            }}
          >
            {value}
          </div>
          {/* Spring coil — foreshortened */}
          <svg
            width={small ? 14 : 18}
            height={springH}
            viewBox="0 0 20 44"
            preserveAspectRatio="none"
            className="block"
            style={{ transform: "perspective(200px) rotateX(25deg)" }}
          >
            <path
              d="M10 0 Q24 5.5 10 11 Q-4 16.5 10 22 Q24 27.5 10 33 Q-4 38.5 10 44"
              stroke="#d97706"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Box body (interior, visible when doors open) */}
        <div
          className="absolute rounded-lg"
          style={{
            left: bleed, top: 0, width: sz, height: sz,
            background: open ? "#78350f" : boxBg,
            border: `1px solid ${borderColor}`,
            opacity: greyed ? 0.35 : 1,
            transition: "background 0.4s ease",
          }}
        />

        {/* Lid — splits into two halves that swing open outward */}
        {[
          { side: "left", originX: "left", angle: open ? 145 : 0, rLeft: bleed, br: `${r}px 0 0 ${r}px`,
            borderW: `1px 0 1px 1px` },
          { side: "right", originX: "right", angle: open ? -145 : 0, rLeft: bleed + sz / 2, br: `0 ${r}px ${r}px 0`,
            borderW: `1px 1px 1px 0` },
        ].map(({ side, originX, angle, rLeft, br, borderW }) => (
          <div
            key={side}
            className="absolute z-4"
            style={{
              left: rLeft, top: 0, width: sz / 2, height: lidH,
              transformOrigin: `${originX} center`,
              transform: `perspective(600px) rotateY(${angle}deg)`,
              transition: "transform 0.55s cubic-bezier(0.8, 0, 0.2, 1)",
              background: boxBg,
              borderRadius: br,
              borderStyle: "solid",
              borderColor,
              borderWidth: borderW,
              opacity: greyed ? 0.35 : 1,
            }}
          />
        ))}

        {/* Slice greying overlays — on top of doors */}
        {showSliceGreying &&
          Array(lines)
            .fill(0)
            .map((_, i) => (
              <div
                key={`s${i}`}
                className="absolute pointer-events-none z-5 transition-[background] duration-400"
                style={{
                  left: bleed,
                  top: (i * sz) / lines,
                  width: sz,
                  height: sz / lines,
                  background: i === 0 ? "transparent" : "rgba(0,0,0,0.55)",
                }}
              />
            ))}

        {/* Clickable box face + variable text */}
        {!open && (
          <div
            onClick={greyed ? undefined : (e) => { e.stopPropagation(); onClickVar?.(); }}
            className={`absolute z-6 flex items-center justify-center
              ${greyed ? "pointer-events-none" : "cursor-pointer"}
            `}
            style={{
              left: bleed, top: 0, width: sz, height: sz,
              opacity: greyed ? 0.35 : 1,
            }}
          >
            <span
              className={`font-extrabold font-mono select-none
                ${small ? "text-[26px]" : "text-[40px]"}
                ${greyed ? "text-text-faint" : "text-accent-bright"}
              `}
            >
              {v}
            </span>
          </div>
        )}

        {/* Slice lines that bleed past the box edges */}
        {showLines &&
          Array(lines - 1)
            .fill(0)
            .map((_, i) => (
              <div
                key={`cut${i}`}
                className="absolute left-0 right-0 h-0 pointer-events-none z-5"
                style={{
                  top: ((i + 1) / lines) * sz,
                  borderTop: "1px dashed rgba(251,191,36,0.5)",
                }}
              />
            ))}
      </div>

      {showPicker && <VarPicker current={v} onPick={onPickVar} onClose={onClosePicker} />}
    </div>
  );
}
