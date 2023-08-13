import { DisplayObject, IPointData } from "pixi.js";
import { Getter, State } from "promethium-js";
import { elementInstances } from "./sharedEntities";

export type ElementId = `e-${number}`;

export function generateElementId(): ElementId {
  const body = Math.floor(Math.random() * Math.pow(10, 17));
  return `e-${body}`;
}

export function checkForHoverOverConnectionPointInConnectionPointsEntries(
  hoverPoint: IPointData,
  connectionPointsEntries: [string, State<[] | IPointData[]>][]
) {
  let returnData: [boolean, Getter<DisplayObject> | null, IPointData | null] = [
    false,
    null,
    null,
  ];
  for (let i = 0; i < connectionPointsEntries.length; i++) {
    const [elementId, [connectionPoints, _]] = connectionPointsEntries[i];
    const elementInstance = elementInstances.adaptParticle(
      elementId as ElementId
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
