import { adaptEffect } from "promethium-js";
import Gate from "./Gate";
import { stroke } from "@/colors";
import { gateBodyDimensions } from "./gateDimensions";
import { adjustOpacityOnInteract } from "./utils";

const gateBodyBuilderFns = {
  and: (gate: Gate) => {
    gate.gateBody
      .lineTo(gateBodyDimensions.midPoint_X, gateBodyDimensions.origin_Y)
      .bezierCurveTo(
        gateBodyDimensions.midPoint_X +
          gateBodyDimensions.protrusionDelta_X_and,
        gateBodyDimensions.origin_Y,
        gateBodyDimensions.midPoint_X +
          gateBodyDimensions.protrusionDelta_X_and,
        gateBodyDimensions.end_Y,
        gateBodyDimensions.midPoint_X,
        gateBodyDimensions.end_Y
      )
      .lineTo(gateBodyDimensions.origin_X, gateBodyDimensions.end_Y)
      .lineTo(gateBodyDimensions.origin_X, gateBodyDimensions.origin_Y);

    return gate.gateBody;
  },
  // displacement parameter is used here to enable proper rendering of `selectionRectange` on the xor gate
  or: (gate: Gate, xDisplacement?: number) => {
    gate.gateBody
      .quadraticCurveTo(
        gateBodyDimensions.frontProtrusionDelta_X_or + (xDisplacement || 0),
        gateBodyDimensions.origin_Y,
        gateBodyDimensions.end_X + (xDisplacement || 0),
        gateBodyDimensions.midPoint_Y
      )
      .moveTo(
        gateBodyDimensions.origin_X + (xDisplacement || 0),
        gateBodyDimensions.end_Y
      )
      .quadraticCurveTo(
        gateBodyDimensions.frontProtrusionDelta_X_or + (xDisplacement || 0),
        gateBodyDimensions.end_Y,
        gateBodyDimensions.end_X + (xDisplacement || 0),
        gateBodyDimensions.midPoint_Y
      )
      .moveTo(
        gateBodyDimensions.origin_X + (xDisplacement || 0),
        gateBodyDimensions.origin_Y
      )
      .bezierCurveTo(
        gateBodyDimensions.backProtrusionDelta_X_or + (xDisplacement || 0),
        gateBodyDimensions.origin_Y +
          gateBodyDimensions.backProtrusionDelta_Y_or,
        gateBodyDimensions.backProtrusionDelta_X_or + (xDisplacement || 0),
        gateBodyDimensions.end_Y - gateBodyDimensions.backProtrusionDelta_Y_or,
        gateBodyDimensions.origin_X + (xDisplacement || 0),
        gateBodyDimensions.end_Y
      );

    return gate.gateBody;
  },
  not: (gate: Gate) => {
    gate.gateBody
      .lineTo(gateBodyDimensions.end_X_not, gateBodyDimensions.midPoint_Y_not)
      .lineTo(gateBodyDimensions.origin_X, gateBodyDimensions.end_Y_not)
      .lineTo(gateBodyDimensions.origin_X, gateBodyDimensions.origin_Y)
      .drawCircle(
        gateBodyDimensions.end_X_not +
          gateBodyDimensions.negateCircleDelta_X_not,
        gateBodyDimensions.midPoint_Y_not,
        gateBodyDimensions.negateCircleRadius
      );
  },
  nand: (gate: Gate) => {
    gateBodyBuilderFns
      .and(gate)
      .drawCircle(
        gateBodyDimensions.end_X + gateBodyDimensions.negateCircleDelta_X_nand,
        gateBodyDimensions.midPoint_Y,
        gateBodyDimensions.negateCircleRadius
      );
  },
  nor: (gate: Gate) => {
    gateBodyBuilderFns
      .or(gate)
      .drawCircle(
        gateBodyDimensions.end_X + gateBodyDimensions.negateCircleDelta_X_nor,
        gateBodyDimensions.midPoint_Y,
        gateBodyDimensions.negateCircleRadius
      );
  },
  xor: (gate: Gate) => {
    gate.gateBody.moveTo(
      gateBodyDimensions.origin_X + gateBodyDimensions.displacement_X_xor,
      gateBodyDimensions.origin_Y
    );
    gateBodyBuilderFns
      .or(gate, gateBodyDimensions.displacement_X_xor)
      .moveTo(gateBodyDimensions.origin_X, gateBodyDimensions.origin_Y)
      .bezierCurveTo(
        gateBodyDimensions.backProtrusionDelta_X_or,
        gateBodyDimensions.origin_Y +
          gateBodyDimensions.backProtrusionDelta_Y_or,
        gateBodyDimensions.backProtrusionDelta_X_or,
        gateBodyDimensions.end_Y - gateBodyDimensions.backProtrusionDelta_Y_or,
        gateBodyDimensions.origin_X,
        gateBodyDimensions.end_Y
      );

    return gate.gateBody;
  },
  xnor: (gate: Gate) => {
    gateBodyBuilderFns
      .xor(gate)
      .drawCircle(
        gateBodyDimensions.end_X + gateBodyDimensions.negateCircleDelta_X_xnor,
        gateBodyDimensions.midPoint_Y,
        gateBodyDimensions.negateCircleRadius
      );
  },
};

export default function buildGateBody(gate: Gate) {
  gate.gateBody.lineStyle({
    width: gateBodyDimensions.strokeWidth,
    color: stroke[10],
  });
  gateBodyBuilderFns[gate.gate](gate);
  adaptEffect(() => adjustOpacityOnInteract(gate, "gateBody"));
}
