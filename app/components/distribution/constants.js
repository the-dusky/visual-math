export const PRESET_LEVELS = [
  // 2(x + 3) = 14  →  x = 4
  { type: "distribution", multiplier: 2, innerBoxes: 1, innerPills: 3, rightPills: 14, boxValue: 4, variable: "x" },
  // 3(2x + 1) = 21  →  x = 3
  { type: "distribution", multiplier: 3, innerBoxes: 2, innerPills: 1, rightPills: 21, boxValue: 3, variable: "x" },
  // 4(n + 2) = 28  →  n = 5
  { type: "distribution", multiplier: 4, innerBoxes: 1, innerPills: 2, rightPills: 28, boxValue: 5, variable: "n" },
  // 2(3x − 1) = 16  →  x = 3
  { type: "distribution", multiplier: 2, innerBoxes: 3, innerPills: -1, rightPills: 16, boxValue: 3, variable: "x" },
  // 5(x + 1) = 30  →  x = 5
  { type: "distribution", multiplier: 5, innerBoxes: 1, innerPills: 1, rightPills: 30, boxValue: 5, variable: "x" },
  // 3(x − 2) = 12  →  x = 6
  { type: "distribution", multiplier: 3, innerBoxes: 1, innerPills: -2, rightPills: 12, boxValue: 6, variable: "x" },
];
