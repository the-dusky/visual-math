"use client";

import { CONCEPTS } from "../constants";

const CX = 200;
const CY = 200;
const R = 140;

const toRad = (deg) => (deg * Math.PI) / 180;
const ptOn = (angle) => ({
  x: CX + R * Math.cos(toRad(angle)),
  y: CY - R * Math.sin(toRad(angle)),
});

/* ── pre-compute geometry for each concept ── */

const radiusEnd = ptOn(50);

const diam1 = ptOn(10);
const diam2 = ptOn(190);

const chord1 = ptOn(120);
const chord2 = ptOn(240);

const sec1 = ptOn(65);
const sec2 = ptOn(200);
const secDx = sec2.x - sec1.x;
const secDy = sec2.y - sec1.y;
const secLen = Math.sqrt(secDx * secDx + secDy * secDy);
const EXT = 50;
const secExt1 = {
  x: sec1.x - (secDx / secLen) * EXT,
  y: sec1.y - (secDy / secLen) * EXT,
};
const secExt2 = {
  x: sec2.x + (secDx / secLen) * EXT,
  y: sec2.y + (secDy / secLen) * EXT,
};

const tanPt = ptOn(315);
const tanAngle = toRad(315);
const tanDirX = -Math.sin(tanAngle);
const tanDirY = -Math.cos(tanAngle);
const TAN_LEN = 120;
const tan1 = {
  x: tanPt.x - tanDirX * TAN_LEN,
  y: tanPt.y - tanDirY * TAN_LEN,
};
const tan2 = {
  x: tanPt.x + tanDirX * TAN_LEN,
  y: tanPt.y + tanDirY * TAN_LEN,
};

/* right-angle indicator for tangent: small square where radius meets tangent */
const RA = 12; // size of right-angle mark
const raRadDir = {
  x: (CX - tanPt.x) / R, // unit vector from touch point toward center
  y: (CY - tanPt.y) / R,
};
const raTanDir = { x: tanDirX, y: tanDirY };
const raP1 = { x: tanPt.x + raRadDir.x * RA, y: tanPt.y + raRadDir.y * RA };
const raP2 = {
  x: tanPt.x + raRadDir.x * RA + raTanDir.x * RA,
  y: tanPt.y + raRadDir.y * RA + raTanDir.y * RA,
};
const raP3 = { x: tanPt.x + raTanDir.x * RA, y: tanPt.y + raTanDir.y * RA };

const GEOMETRY = {
  radius: {
    lines: [{ from: { x: CX, y: CY }, to: radiusEnd }],
    dots: [radiusEnd],
    labelPos: {
      x: (CX + radiusEnd.x) / 2 + 8,
      y: (CY + radiusEnd.y) / 2 - 10,
    },
    labelAnchor: "start",
  },
  diameter: {
    lines: [{ from: diam1, to: diam2 }],
    dots: [diam1, diam2],
    labelPos: { x: diam2.x + 8, y: diam2.y + 4 },
    labelAnchor: "start",
  },
  chord: {
    lines: [{ from: chord1, to: chord2 }],
    dots: [chord1, chord2],
    labelPos: { x: chord1.x - 8, y: chord1.y - 10 },
    labelAnchor: "end",
  },
  secant: {
    lines: [
      { from: secExt1, to: sec1, dashed: true },
      { from: sec1, to: sec2 },
      { from: sec2, to: secExt2, dashed: true },
    ],
    dots: [sec1, sec2],
    labelPos: { x: secExt1.x + 8, y: secExt1.y - 6 },
    labelAnchor: "start",
  },
  tangent: {
    lines: [{ from: tan1, to: tan2 }],
    dots: [tanPt],
    labelPos: { x: tan2.x - 4, y: tan2.y - 10 },
    labelAnchor: "end",
  },
};

/* ── component ── */

export default function CircleDiagram({ selected, onSelect }) {
  const anySelected = selected !== null;

  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full max-w-[400px] mx-auto block"
      role="img"
      aria-label="Interactive circle diagram showing radius, diameter, chord, secant, and tangent"
    >
      {/* Main circle */}
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="#3f3f46"
        strokeWidth={2}
      />

      {/* Center dot (always visible) */}
      <circle cx={CX} cy={CY} r={4} fill="#71717a" />

      {/* Concept lines */}
      {CONCEPTS.map((concept) => {
        const geo = GEOMETRY[concept.id];
        const isSel = selected === concept.id;
        const opacity = anySelected ? (isSel ? 1 : 0.15) : 0.7;
        const sw = isSel ? 3.5 : 2.5;

        return (
          <g
            key={concept.id}
            style={{
              cursor: "pointer",
              opacity,
              transition: "opacity 0.3s ease",
            }}
            onClick={() => onSelect(isSel ? null : concept.id)}
          >
            {/* Invisible wide hit area for every segment */}
            {geo.lines.map((l, i) => (
              <line
                key={`hit-${i}`}
                x1={l.from.x}
                y1={l.from.y}
                x2={l.to.x}
                y2={l.to.y}
                stroke="transparent"
                strokeWidth={24}
              />
            ))}

            {/* Glow layer when selected */}
            {isSel &&
              geo.lines.map((l, i) => (
                <line
                  key={`glow-${i}`}
                  x1={l.from.x}
                  y1={l.from.y}
                  x2={l.to.x}
                  y2={l.to.y}
                  stroke={concept.color}
                  strokeWidth={10}
                  opacity={0.2}
                  strokeLinecap="round"
                />
              ))}

            {/* Visible lines */}
            {geo.lines.map((l, i) => (
              <line
                key={`line-${i}`}
                x1={l.from.x}
                y1={l.from.y}
                x2={l.to.x}
                y2={l.to.y}
                stroke={concept.color}
                strokeWidth={sw}
                strokeDasharray={l.dashed ? "7 5" : "none"}
                strokeLinecap="round"
              />
            ))}

            {/* Dots at circle intersection points */}
            {geo.dots.map((d, i) => (
              <circle
                key={`dot-${i}`}
                cx={d.x}
                cy={d.y}
                r={isSel ? 5.5 : 4}
                fill={concept.color}
              />
            ))}

            {/* Label */}
            <text
              x={geo.labelPos.x}
              y={geo.labelPos.y}
              fill={concept.color}
              fontSize={isSel ? 14 : 11}
              fontWeight={isSel ? 700 : 500}
              textAnchor={geo.labelAnchor}
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {concept.name}
            </text>
          </g>
        );
      })}

      {/* Radius: highlight center dot when selected */}
      {selected === "radius" && (
        <circle cx={CX} cy={CY} r={5.5} fill="#f59e0b" />
      )}

      {/* Diameter: highlight center dot + label */}
      {selected === "diameter" && (
        <>
          <circle cx={CX} cy={CY} r={5.5} fill="#3b82f6" />
          <text
            x={CX + 10}
            y={CY - 8}
            fill="#3b82f6"
            fontSize={10}
            fontWeight={600}
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            center
          </text>
        </>
      )}

      {/* Tangent: show dashed radius + right-angle mark when selected */}
      {selected === "tangent" && (
        <>
          <line
            x1={CX}
            y1={CY}
            x2={tanPt.x}
            y2={tanPt.y}
            stroke="#f43f5e"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            opacity={0.5}
          />
          <polyline
            points={`${raP1.x},${raP1.y} ${raP2.x},${raP2.y} ${raP3.x},${raP3.y}`}
            fill="none"
            stroke="#f43f5e"
            strokeWidth={1.5}
            opacity={0.7}
          />
          <text
            x={CX + 10}
            y={CY - 8}
            fill="#f43f5e"
            fontSize={10}
            fontWeight={600}
            opacity={0.6}
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            center
          </text>
        </>
      )}

      {/* Prompt when nothing selected */}
      {!anySelected && (
        <text
          x={CX}
          y={CY + R + 30}
          fill="#71717a"
          fontSize={12}
          textAnchor="middle"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          Tap a line to explore
        </text>
      )}
    </svg>
  );
}
