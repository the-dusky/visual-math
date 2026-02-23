export const PRESET_LEVELS = [
  { type: "addition", inequality: ">", boxValue: 5, initBoxes: 1, initPills: 3, initSlots: 0, rightPills: 8, variable: "x" },
  { type: "subtraction", inequality: "<", boxValue: 11, initBoxes: 1, initPills: 0, initSlots: 3, rightPills: 8, variable: "x" },
  { type: "division", inequality: ">=", boxValue: 4, initBoxes: 3, initPills: 0, initSlots: 0, rightPills: 12, variable: "x" },
  { type: "multiply", inequality: "<=", boxValue: 15, initBoxes: 1, initPills: 0, initSlots: 0, rightPills: 3, divisor: 5, variable: "x" },
  { type: "twostep", inequality: ">", boxValue: 3, initBoxes: 2, initPills: 4, initSlots: 0, rightPills: 10, variable: "n" },
  { type: "division", inequality: "<", boxValue: -2, initBoxes: 5, initPills: 0, initSlots: 0, rightPills: 10, variable: "x", negCoeff: true },
];
