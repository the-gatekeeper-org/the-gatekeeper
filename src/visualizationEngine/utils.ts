import { DisplayObject, Graphics, IPointData } from "pixi.js";
import { CircuitElement } from "./CircuitElement";
import { gridGap } from "./dimensions";
import { Getter, State } from "promethium-js";
import {
  ConnectionPoints,
  inputConnectionPoints,
  outputConnectionPoints,
} from "@/entities/visualizationEntities";
import { elementInstances } from "@/entities/sharedEntities";
import { CircuitElementId } from "@/entities/utils";

export function round(dimension: number) {
  return Math.round(dimension / gridGap) * gridGap;
}

export function adjustOpacityOnInteract(
  circuitElement: CircuitElement,
  part: Graphics
) {
  if (circuitElement.isBeingDragged()) {
    part.alpha = 0.5;
  } else {
    part.alpha = 1;
  }
  console.log(part.alpha);
}

export function checkForHoverOverConnectionPointInConnectionPointsEntries(
  hoverPoint: IPointData,
  connectionPointsEntries: [string, State<ConnectionPoints>][]
) {
  let returnData: [boolean, Getter<DisplayObject> | null, IPointData | null] = [
    false,
    null,
    null,
  ];
  for (let i = 0; i < connectionPointsEntries.length; i++) {
    const [elementId, [connectionPoints, _]] = connectionPointsEntries[i];
    const elementInstance = elementInstances.adaptParticle(
      elementId as CircuitElementId
    )[0];
    for (let j = 0; j < connectionPoints().length; j++) {
      const connectionPoint = connectionPoints()[j];
      const globalConnectionPoint = elementInstance().toGlobal(connectionPoint);
      if (
        hoverPoint.x === globalConnectionPoint.x &&
        hoverPoint.y === globalConnectionPoint.y
      ) {
        returnData = [true, elementInstance, connectionPoint];

        return returnData;
      }
    }
  }

  return returnData;
}

export function checkForHoverOverConnectionPointInConductorConnectionPointsEntries() {}

export function checkForHoverOverConnectionPoint(hoverPoint: IPointData) {
  const inputConnectionPointsEntries = Object.entries(
    inputConnectionPoints.getParticles()
  );
  let [
    inputConnectionPointIsBeingHoveredOver,
    inputConnectionPointElementInstance,
    inputConnectionPoint,
  ] = checkForHoverOverConnectionPointInConnectionPointsEntries(
    hoverPoint,
    inputConnectionPointsEntries
  );
  if (inputConnectionPointIsBeingHoveredOver === true) {
    return [
      inputConnectionPointIsBeingHoveredOver,
      inputConnectionPointElementInstance,
      inputConnectionPoint,
    ] as ReturnType<
      typeof checkForHoverOverConnectionPointInConnectionPointsEntries
    >;
  }
  const outputConnectionPointsEntries = Object.entries(
    outputConnectionPoints.getParticles()
  );
  let [
    outputConnectionPointIsBeingHoveredOver,
    outputConnectionPointElementInstance,
    outputConnectionPoint,
  ] = checkForHoverOverConnectionPointInConnectionPointsEntries(
    hoverPoint,
    outputConnectionPointsEntries
  );
  if (outputConnectionPointIsBeingHoveredOver === true) {
    return [
      outputConnectionPointIsBeingHoveredOver,
      outputConnectionPointElementInstance,
      outputConnectionPoint,
    ] as ReturnType<
      typeof checkForHoverOverConnectionPointInConnectionPointsEntries
    >;
  }

  return [false, null, null] as ReturnType<
    typeof checkForHoverOverConnectionPointInConnectionPointsEntries
  >;
}
