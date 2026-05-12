/** Matches reference export (~1.02) — thin hairline on 32×32 grid. */
export const ICON_STROKE = 1.02;

export const iconStroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: ICON_STROKE,
  strokeLinecap: "round" as const,
  strokeLinejoin: "miter" as const,
  strokeMiterlimit: 10,
};
