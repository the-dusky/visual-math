export const PRESET_LEVELS = [
  // 1. Simple, 2 terms
  // 2(3x + 4) → 6x + 8
  {
    multiplier: 2,
    terms: [
      { coeff: 3, variable: "x" },
      { coeff: 4 },
    ],
  },
  // 2. Subtraction
  // 3(2x - 5) → 6x - 15
  {
    multiplier: 3,
    terms: [
      { coeff: 2, variable: "x" },
      { coeff: -5 },
    ],
  },
  // 3. Two variables
  // 4(x + y) → 4x + 4y
  {
    multiplier: 4,
    terms: [
      { coeff: 1, variable: "x" },
      { coeff: 1, variable: "y" },
    ],
  },
  // 4. Two variables + constant
  // 2(3x - 2y + 5) → 6x - 4y + 10
  {
    multiplier: 2,
    terms: [
      { coeff: 3, variable: "x" },
      { coeff: -2, variable: "y" },
      { coeff: 5 },
    ],
  },
  // 5. Three variables + constant
  // 3(2x + y - h + 4) → 6x + 3y - 3h + 12
  {
    multiplier: 3,
    terms: [
      { coeff: 2, variable: "x" },
      { coeff: 1, variable: "y" },
      { coeff: -1, variable: "h" },
      { coeff: 4 },
    ],
  },
  // 6. Decimal multiplier
  // 2.5(4x - 2y + 6) → 10x - 5y + 15
  {
    multiplier: 2.5,
    terms: [
      { coeff: 4, variable: "x" },
      { coeff: -2, variable: "y" },
      { coeff: 6 },
    ],
  },
  // 7. Four variables
  // 2(x - 3y + 2z + n - 5) → 2x - 6y + 4z + 2n - 10
  {
    multiplier: 2,
    terms: [
      { coeff: 1, variable: "x" },
      { coeff: -3, variable: "y" },
      { coeff: 2, variable: "z" },
      { coeff: 1, variable: "n" },
      { coeff: -5 },
    ],
  },
  // 8. Negative multiplier
  // -3(2x - y + 4) → -6x + 3y - 12
  {
    multiplier: -3,
    terms: [
      { coeff: 2, variable: "x" },
      { coeff: -1, variable: "y" },
      { coeff: 4 },
    ],
  },
];
