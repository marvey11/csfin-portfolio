const allEvalTypes = ["net", "gross"] as const;
type EvalType = (typeof allEvalTypes)[number];

export { allEvalTypes };
export type { EvalType };
