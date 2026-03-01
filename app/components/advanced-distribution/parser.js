const NUM = String.raw`\d+\.?\d*|\.\d+`;

export function parseAdvancedDist(input) {
  const s = input.replace(/\s+/g, "").replace(/−/g, "-").replace(/×/g, "*");

  const outer = s.match(new RegExp(`^(-?(?:${NUM}))\\((.+)\\)$`));
  if (!outer) return null;

  const multiplier = parseFloat(outer[1]);
  if (!isFinite(multiplier) || multiplier === 0) return null;
  if (Math.abs(multiplier) > 20) return null;

  const inner = outer[2];
  const termStrings = inner.match(/[+-]?[^+-]+/g);
  if (!termStrings || termStrings.length === 0) return null;

  const terms = [];
  for (const raw of termStrings) {
    const t = raw.trim();
    const m = t.match(new RegExp(`^([+-]?)(?:(${NUM}))?([a-zA-Z])?$`));
    if (!m) return null;

    const sign = m[1] === "-" ? -1 : 1;
    const numPart = m[2] ? parseFloat(m[2]) : (m[3] ? 1 : null);
    const variable = m[3] || undefined;

    if (numPart === null) return null;

    terms.push({
      coeff: sign * numPart,
      ...(variable && { variable }),
    });
  }

  if (terms.length === 0) return null;

  return { multiplier, terms };
}

const fmt = (n) => {
  const abs = Math.abs(n);
  return Number.isInteger(abs) ? String(abs) : parseFloat(abs.toFixed(4)).toString();
};

export function levelToString(level) {
  const parts = level.terms.map((t, i) => {
    const absCoeff = Math.abs(t.coeff);
    const isFirst = i === 0;
    const sign = t.coeff < 0 ? "−" : (isFirst ? "" : "+");
    const spacing = isFirst ? "" : " ";

    let body;
    if (t.variable) {
      body = absCoeff === 1 ? t.variable : `${fmt(absCoeff)}${t.variable}`;
    } else {
      body = fmt(absCoeff);
    }

    return `${spacing}${sign} ${body}`.replace(/^\s+/, "");
  });

  const inner = parts.join(" ");
  const mAbs = fmt(Math.abs(level.multiplier));
  const mSign = level.multiplier < 0 ? "−" : "";
  return `${mSign}${mAbs}(${inner})`;
}

export function distribute(level) {
  return level.terms.map((t) => ({
    coeff: level.multiplier * t.coeff,
    ...(t.variable && { variable: t.variable }),
  }));
}

export function distributedToString(terms) {
  return terms.map((t, i) => {
    const isFirst = i === 0;
    const sign = t.coeff < 0 ? "−" : (isFirst ? "" : "+");
    const absCoeff = Math.abs(t.coeff);
    let body;
    if (t.variable) {
      body = absCoeff === 1 ? t.variable : `${fmt(absCoeff)}${t.variable}`;
    } else {
      body = fmt(absCoeff);
    }
    return (isFirst ? "" : " ") + sign + (isFirst && t.coeff >= 0 ? "" : " ") + body;
  }).join("");
}
