import { ParticleEntity } from "promethium-js";
import { ElementId } from "./utils";
import { IPointData } from "pixi.js";

export const elementSelections = new ParticleEntity<{
  [key: ElementId]: boolean;
  selectedElements: ElementId[];
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

// TODO: Add `prettierrc` with extended line character limit
export const inputConnectionPoints = new ParticleEntity<
  Record<ElementId, IPointData[] | []>
>({});

export const outputConnectionPoints = new ParticleEntity<
  Record<ElementId, IPointData[] | []>
>({});

export const conductorConnectionPoints = new ParticleEntity<
  Record<ElementId, [IPointData, IPointData]>
>({});
