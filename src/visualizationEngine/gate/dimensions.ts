export const gateBodyDimensions = {
  strokeWidth: 2,
  origin_X: 0,
  origin_Y: 0,
  midPoint_X: 20,
  midPoint_Y_not: 10,
  midPoint_Y: 20,
  end_X: 38,
  end_X_not: 26,
  end_Y: 40,
  end_Y_not: 20,
  protrusionDelta_X_and: 23,
  frontProtrusionDelta_X_or: 35,
  backProtrusionDelta_X_or: 15,
  backProtrusionDelta_Y_or: 10,
  displacement_X_xor: 10,
  negateCircleDelta_X_nand: 4,
  negateCircleDelta_X_nor: 5,
  negateCircleDelta_X_xnor: 15,
  negateCircleDelta_X_not: 7,
  negateCircleRadius: 5,
} as const;

export const selectionRectangeDimensions = {
  strokeWidth: 2,
  originDelta_X: -8,
  originDelta_Y: -8,
  widthDelta: 12,
  heightDelta: 12,
} as const;

export const inputTerminalDimensions = {
  strokeWidth: 2,
  displacement_X: -10,
  origin_X: 0,
  origin_Y: 0,
  terminalGap: 10,
  terminalRadius: 2,
} as const;

export const outputTerminalDimensions = {
  delta_X_and: 2,
  delta_X_or: 2,
  delta_X_not: 2,
  delta_X_nand: 11,
  delta_X_nor: 12,
  delta_X_xor: 12,
  delta_X_xnor: 22,
  terminalRadius: 2,
} as const;
