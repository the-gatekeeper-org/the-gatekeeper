import { ParticleEntity } from "promethium-js";
import { CircuitElementId, MultipleConnectionPointId } from "./utils";
import { IPointData } from "pixi.js";

export const elementSelections = new ParticleEntity<{
  [key: CircuitElementId]: boolean;
  selectedElements: CircuitElementId[];
}>({
  selectedElements: [],
});

export type ConductorPreviewCoordinates = {
  previous: IPointData | null;
  current: IPointData | null;
  starting: IPointData | null;
};

export const conductorPreviewData = new ParticleEntity<{
  coordinates: ConductorPreviewCoordinates;
  isBeingDrawn: boolean;
}>({
  coordinates: {
    previous: null,
    current: null,
    starting: null,
  },
  isBeingDrawn: false,
});

export type ConnectionPoint = IPointData & {
  multipleConnectionPointId?: MultipleConnectionPointId | null;
};
export type ConnectionPoints = ConnectionPoint[];
export type ConductorConnectionPoints = [ConnectionPoint, ConnectionPoint];

// TODO: Add `prettierrc` with extended line character limit
export const inputConnectionPoints = new ParticleEntity<
  Record<CircuitElementId, ConnectionPoints>
>({});

export const outputConnectionPoints = new ParticleEntity<
  Record<CircuitElementId, ConnectionPoints>
>({});

export const conductorConnectionPoints = new ParticleEntity<
  Record<CircuitElementId, ConductorConnectionPoints>
>({});
