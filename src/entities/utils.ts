import { DisplayObject, IPointData } from "pixi.js";
import { Getter, State } from "promethium-js";
import { elementInstances } from "./sharedEntities";
import { ConnectionPoints } from "./visualizationEntities";

export type CircuitElementId = `ce-${number}`;

export function generateCircuitElementId(): CircuitElementId {
  const body = Math.floor(Math.random() * Math.pow(10, 17));
  return `ce-${body}`;
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
