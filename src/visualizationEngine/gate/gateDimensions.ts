export const gateBodyDimensions = {
  strokeWidth: 2,
  origin_X: 0,
  origin_Y: 0,
  midPoint_X: 25,
  midPoint_Y_not: 12,
  midPoint_Y: 25,
  end_X: 50,
  end_X_not: 35,
  end_Y: 50,
  end_Y_not: 25,
  protrusionDelta_X_and: 35,
  frontProtrusionDelta_X_or: 35,
  backProtrusionDelta_X_or: 15,
  backProtrusionDelta_Y_or: 10,
  displacement_X_xor: 10,
  negateCircleDelta_X_nand: 7,
  negateCircleDelta_X_nor: 6,
  negateCircleDelta_X_xnor: 16,
  negateCircleDelta_X_not: 7,
  negateCircleRadius: 5,
} as const;

export const selectionRectangeDimensions = {
  strokeWidth: 2,
  originDelta_X: 2,
  originDelta_Y: 4,
  widthDelta: 4,
  heightDelta: 4,
} as const;

export const inputTerminalDimensions = {} as const;

export const outputTerminalDimensions = {
  delta_X_and: 4,
  delta_X_or: 2,
  delta_X_not: 0,
  delta_X_nand: 14,
  delta_X_nor: 13,
  delta_X_xor: 12,
  delta_X_xnor: 23,
} as const;
