import { adaptEffect } from "promethium-js";
import Gate from "./Gate";
import { stroke } from "@/colors";
import { gateBodyDimensions } from "./gateDimensions";
import { adjustOpacityOnInteract } from "./utils";

const gateBodyBuilderFns = {
  and: (gate: Gate) => {
    gate.gateBody
      .lineStyle({
        width: gateBodyDimensions.gateStrokeWidth,
        color: stroke[10],
      })
      .moveTo(
        gateBodyDimensions.gateBodyOrigin_X,
        gateBodyDimensions.gateBodyOrigin_Y
      )
      .lineTo(
        gateBodyDimensions.gateBodyMidPoint_X,
        gateBodyDimensions.gateBodyOrigin_Y
      )
      .bezierCurveTo(
        gateBodyDimensions.gateBodyMidPoint_X +
          gateBodyDimensions.andGateBodyProtrusionDelta_X,
        gateBodyDimensions.gateBodyOrigin_Y,
        gateBodyDimensions.gateBodyMidPoint_X +
          gateBodyDimensions.andGateBodyProtrusionDelta_X,
        gateBodyDimensions.gateBodyEnd_Y,
        gateBodyDimensions.gateBodyMidPoint_X,
        gateBodyDimensions.gateBodyEnd_Y
      )
      .lineTo(
        gateBodyDimensions.gateBodyOrigin_X,
        gateBodyDimensions.gateBodyEnd_Y
      )
      .lineTo(
        gateBodyDimensions.gateBodyOrigin_X,
        gateBodyDimensions.gateBodyOrigin_Y
      );
    adaptEffect(() => adjustOpacityOnInteract(gate, "gateBody"));
  },
  // displacement parameter is used here to enable proper rendering of `selectionRectange` on the xor gate
  or: (gate: Gate, xDisplacement?: number) => {
    gate.gateBody
      .lineStyle({ width: 2, color: stroke[10] })
      .moveTo(
        gateBodyDimensions.gateBodyOrigin_X + (xDisplacement || 0),
        gateBodyDimensions.gateBodyOrigin_Y
      )
      .quadraticCurveTo(
        gateBodyDimensions.orGateBodyFrontProtrusionDelta_X +
          (xDisplacement || 0),
        gateBodyDimensions.gateBodyOrigin_Y,
        gateBodyDimensions.gateBodyEnd_X + (xDisplacement || 0),
        gateBodyDimensions.gateBodyMidPoint_Y
      )
      .moveTo(
        gateBodyDimensions.gateBodyOrigin_X + (xDisplacement || 0),
        gateBodyDimensions.gateBodyEnd_Y
      )
      .quadraticCurveTo(
        gateBodyDimensions.orGateBodyFrontProtrusionDelta_X +
          (xDisplacement || 0),
        gateBodyDimensions.gateBodyEnd_Y,
        gateBodyDimensions.gateBodyEnd_X + (xDisplacement || 0),
        gateBodyDimensions.gateBodyMidPoint_Y
      )
      .moveTo(
        gateBodyDimensions.gateBodyOrigin_X + (xDisplacement || 0),
        gateBodyDimensions.gateBodyOrigin_Y
      )
      .bezierCurveTo(
        gateBodyDimensions.orGateBodyBackProtrusionDelta_X +
          (xDisplacement || 0),
        gateBodyDimensions.gateBodyOrigin_Y +
          gateBodyDimensions.orGateBodyBackProtrusionDelta_Y,
        gateBodyDimensions.orGateBodyBackProtrusionDelta_X +
          (xDisplacement || 0),
        gateBodyDimensions.gateBodyEnd_Y -
          gateBodyDimensions.orGateBodyBackProtrusionDelta_Y,
        gateBodyDimensions.gateBodyOrigin_X + (xDisplacement || 0),
        gateBodyDimensions.gateBodyEnd_Y
      );
    adaptEffect(() => adjustOpacityOnInteract(gate, "gateBody"));
    return gate.gateBody;
  },
  not: () => {},
  nand: () => {},
  nor: () => {},
  xor: (gate: Gate) => {
    gate.gateBody.moveTo(
      gateBodyDimensions.gateBodyOrigin_X +
        gateBodyDimensions.xorGateBodyDisplacement_X,
      gateBodyDimensions.gateBodyOrigin_Y
    );
    gateBodyBuilderFns
      .or(gate, gateBodyDimensions.xorGateBodyDisplacement_X)
      .moveTo(
        gateBodyDimensions.gateBodyOrigin_X,
        gateBodyDimensions.gateBodyOrigin_Y
      )
      .bezierCurveTo(
        gateBodyDimensions.orGateBodyBackProtrusionDelta_X,
        gateBodyDimensions.gateBodyOrigin_Y +
          gateBodyDimensions.orGateBodyBackProtrusionDelta_Y,
        gateBodyDimensions.orGateBodyBackProtrusionDelta_X,
        gateBodyDimensions.gateBodyEnd_Y -
          gateBodyDimensions.orGateBodyBackProtrusionDelta_Y,
        gateBodyDimensions.gateBodyOrigin_X,
        gateBodyDimensions.gateBodyEnd_Y
      );
  },
  xnor: () => {},
};

export default function buildGateBody(gate: Gate) {
  gateBodyBuilderFns[gate.gate](gate);
}
