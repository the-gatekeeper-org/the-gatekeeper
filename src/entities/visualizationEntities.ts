import { ParticleEntity } from "promethium-js";
import { CircuitElementId } from "./utils";
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

export type ConnectionPoints = IPointData[];
export type ConductorConnectionPoints = [IPointData, IPointData];

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
