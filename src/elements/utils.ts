import { Graphics, IPointData } from "pixi.js";
import { CircuitElement } from "./CircuitElement";
import {
  ConnectionPoints,
  _conductorConnectionPointsCollection,
  _elementConnectionPointsActions,
  _inputConnectionPointsCollection,
  _outputConnectionPointsCollection,
} from "@/stateEntities/elementConnectionPoints";
import { Conductor } from "./conductor/Conductor";
import { CircuitElementId } from "@/stateEntities/utils";
import { round } from "@/engines/visualization/utils";

export function adjustOpacityOnInteract(
  circuitElement: CircuitElement,
  part: Graphics,
) {
  if (circuitElement.isBeingDragged()) {
    part.alpha = 0.5;
  } else {
    part.alpha = 1;
  }
}

export function addInputConnectionPoint(
  circuitElement: CircuitElement,
  connectionPoint: IPointData,
) {
  const globalConnectionPoint = circuitElement.toGlobal(connectionPoint);
  _elementConnectionPointsActions.dispatch("addInputConnectionPoint", {
    id: circuitElement.id,
    connectionPoint: globalConnectionPoint,
  });
}

export function addOutputConnectionPoint(
  circuitElement: CircuitElement,
  connectionPoint: IPointData,
) {
  const globalConnectionPoint = circuitElement.toGlobal(connectionPoint);
  _elementConnectionPointsActions.dispatch("addOutputConnectionPoint", {
    id: circuitElement.id,
    connectionPoint: globalConnectionPoint,
  });
}

function connectionPointIsBeingHoverOver(
  connectionPoints: ConnectionPoints,
  hoverPoint: IPointData,
) {
  for (let i = 0; i < connectionPoints.length; i++) {
    const connectionPoint = connectionPoints[i];
    if (
      round(hoverPoint.x) === round(connectionPoint.x) &&
      round(hoverPoint.y) === round(connectionPoint.y)
    ) {
      return true;
    }
  }

  return false;
}

export function inputConnectionPointIsBeingHoveredOver(
  circuitElement: CircuitElement,
  hoverPoint: IPointData,
) {
  const connectionPoints = _inputConnectionPointsCollection.adaptParticle(
    circuitElement.id,
  )![0]();

  return connectionPointIsBeingHoverOver(connectionPoints, hoverPoint);
}

export function outputConnectionPointIsBeingHoveredOver(
  circuitElement: CircuitElement,
  hoverPoint: IPointData,
) {
  const connectionPoints = _outputConnectionPointsCollection.adaptParticle(
    circuitElement.id,
  )![0]();

  return connectionPointIsBeingHoverOver(connectionPoints, hoverPoint);
}

export function conductorConnectionPointIsBeingHoveredOver(
  conductor: Conductor,
  hoverPoint: IPointData,
) {
  const connectionPoints = _conductorConnectionPointsCollection.adaptParticle(
    conductor.id,
  )![0]();

  return connectionPointIsBeingHoverOver(connectionPoints, hoverPoint);
}

export function checkForCollisionWithConductorConnectionPoint(
  checkPoint: IPointData,
) {
  const conductorConnectionPointsIds = Object.keys(
    _conductorConnectionPointsCollection.adaptParticleValues(),
  ) as CircuitElementId[];
  for (let i = 0; i < conductorConnectionPointsIds.length; i++) {
    const conductorConnectionPointsId = conductorConnectionPointsIds[i];
    const connectionPoints = _conductorConnectionPointsCollection.adaptParticle(
      conductorConnectionPointsId,
    )![0]();
    for (let j = 0; j < connectionPoints.length; j++) {
      const connectionPoint = connectionPoints[j];
      if (
        connectionPoint.x === checkPoint.x &&
        connectionPoint.y === checkPoint.y
      ) {
        return conductorConnectionPointsId;
      }
    }
  }

  return false;
}
