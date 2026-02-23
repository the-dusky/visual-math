export const PRESET_LEVELS = [
  // Standard (variable on left)
  { type: "addition", boxValue: 5, initBoxes: 1, initPills: 3, initSlots: 0, rightPills: 8, variable: "x" },
  { type: "subtraction", boxValue: 8, initBoxes: 1, initPills: 0, initSlots: 3, rightPills: 5, variable: "x" },
  { type: "addition", boxValue: 7, initBoxes: 1, initPills: 5, initSlots: 0, rightPills: 12, variable: "x" },
  { type: "division", boxValue: 5, initBoxes: 3, initPills: 0, initSlots: 0, rightPills: 15, variable: "x" },
  { type: "multiply", boxValue: 12, initBoxes: 1, initPills: 0, initSlots: 0, rightPills: 3, divisor: 4, variable: "x" },
  { type: "twostep", boxValue: 4, initBoxes: 2, initPills: 3, initSlots: 0, rightPills: 11, variable: "x" },
  // Negative coefficient
  { type: "division", boxValue: -2, initBoxes: 5, initPills: 0, initSlots: 0, rightPills: 10, variable: "x", negCoeff: true },
  // Flipped (variable on right)
  { type: "addition", boxValue: 6, initBoxes: 1, initPills: 4, initSlots: 0, rightPills: 10, variable: "y", flipped: true },
  { type: "subtraction", boxValue: 9, initBoxes: 1, initPills: 0, initSlots: 2, rightPills: 7, variable: "n", flipped: true },
  { type: "division", boxValue: 4, initBoxes: 4, initPills: 0, initSlots: 0, rightPills: 16, variable: "x", flipped: true },
  { type: "twostep", boxValue: 3, initBoxes: 3, initPills: 2, initSlots: 0, rightPills: 11, variable: "y", flipped: true },
];
