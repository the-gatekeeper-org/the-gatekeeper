import { ActionEntity, ParticleEntity } from "promethium-js";
import { CircuitElementId } from "./utils";
import { GateType } from "@/elements/gate/Gate";
import { CircuitElement } from "@/elements/CircuitElement";
import { IPointData } from "pixi.js";
import { round } from "@/engines/visualization/utils";

export type CircuitElementType =
  | GateType
  | "conductor"
  | "input"
  | "output"
  | "blackBox";

export const _elementTypes = new ParticleEntity<
  Record<CircuitElementId, CircuitElementType>
>({});

export const _elementInstances = new ParticleEntity<
  Record<CircuitElementId, CircuitElement>
>({});

export const _elementPositions = new ParticleEntity<
  Record<CircuitElementId, IPointData>
>({});

export type ConductorPreviewCoordinates = {
  previous: IPointData | null;
  current: IPointData | null;
  starting: IPointData | null;
};

export const _generalElementData = new ParticleEntity<{
  elementSelections: CircuitElementId[];
  conductorPreviewData: {
    coordinates: ConductorPreviewCoordinates;
    isBeingDrawn: boolean;
  };
}>({
  elementSelections: [],
  conductorPreviewData: {
    coordinates: {
      previous: null,
      current: null,
      starting: null,
    },
    isBeingDrawn: false,
  },
});

export const _generalElementDataActions = new ActionEntity({
  toggleElementSelection(id: CircuitElementId) {
    const isSelected = _generalElementData
      .adaptParticleValue("elementSelections")
      .includes(id);
    isSelected
      ? _generalElementDataActions.dispatch("turnOffElementSelection", id)
      : _generalElementDataActions.dispatch("turnOnElementSelection", id);
  },
  turnOffElementSelection(id: CircuitElementId) {
    const setElementSelections =
      _generalElementData.adaptParticleSetter("elementSelections");
    setElementSelections((elementSelections) =>
      elementSelections.filter((elementSelection) => elementSelection !== id),
    );
  },
  turnOnElementSelection(id: CircuitElementId) {
    setTimeout(() => {
      const setElementSelections =
        _generalElementData.adaptParticleSetter("elementSelections");
      setElementSelections((elementSelections) => [...elementSelections, id]);
    });
  },
  resetElementSelections() {
    const setElementSelections =
      _generalElementData.adaptParticleSetter("elementSelections");
    setElementSelections([]);
  },
  changeElementPosition({
    id,
    x,
    y,
  }: {
    id: CircuitElementId;
    x: number;
    y: number;
  }) {
    const setPosition = _elementPositions.adaptParticle(id)![1];
    setPosition({ x: round(x), y: round(y) });
  },
  updateConductorPreview({
    previousCoordinates,
    currentCoordinates,
    startingCoordinates,
    isBeingDrawn,
  }: {
    previousCoordinates: IPointData | null;
    currentCoordinates: IPointData | null;
    startingCoordinates: IPointData | null;
    isBeingDrawn: boolean;
  }) {
    const setConductorPreviewData = _generalElementData.adaptParticleSetter(
      "conductorPreviewData",
    );
    setConductorPreviewData({
      coordinates: {
        previous: previousCoordinates,
        current: currentCoordinates,
        starting: startingCoordinates,
      },
      isBeingDrawn,
    });
  },
});
