import { ActionEntity, ParticleEntity } from "promethium-js";
import { CircuitElementId } from "./utils";
import { GateType } from "@/circuitElements/gate/Gate";
import { CircuitElement } from "@/circuitElements/CircuitElement";
import { IPointData } from "pixi.js";
import { round } from "@/engines/visualization/utils";

export type CircuitElementType =
  | GateType
  | "conductor"
  | "input"
  | "output"
  | "blackBox";

export const $circuitElementTypes = new ParticleEntity<
  Record<CircuitElementId, CircuitElementType>
>({});

export const $circuitElementInstances = new ParticleEntity<
  Record<CircuitElementId, CircuitElement>
>({});

export const $circuitElementPositions = new ParticleEntity<
  Record<CircuitElementId, IPointData>
>({});

export type ConductorPreviewCoordinates = {
  previous: IPointData | null;
  current: IPointData | null;
  starting: IPointData | null;
};

export const $generalCircuitElementData = new ParticleEntity<{
  circuitElementSelections: CircuitElementId[];
  conductorPreviewData: {
    coordinates: ConductorPreviewCoordinates;
    isBeingDrawn: boolean;
  };
}>({
  circuitElementSelections: [],
  conductorPreviewData: {
    coordinates: {
      previous: null,
      current: null,
      starting: null,
    },
    isBeingDrawn: false,
  },
});

export const _generalCircuitElementDataActions = new ActionEntity({
  toggleCircuitElementSelection(id: CircuitElementId) {
    const isSelected = $generalCircuitElementData
      .adaptParticleValue("circuitElementSelections")
      .includes(id);
    isSelected
      ? _generalCircuitElementDataActions.dispatch(
          "turnOffCircuitElementSelection",
          id,
        )
      : _generalCircuitElementDataActions.dispatch(
          "turnOnCircuitElementSelection",
          id,
        );
  },
  turnOffCircuitElementSelection(id: CircuitElementId) {
    const setCircuitElementSelections =
      $generalCircuitElementData.adaptParticleSetter(
        "circuitElementSelections",
      );
    setCircuitElementSelections((circuitElementSelections) =>
      circuitElementSelections.filter(
        (circuitElementSelection) => circuitElementSelection !== id,
      ),
    );
  },
  turnOnCircuitElementSelection(id: CircuitElementId) {
    // use a `setTimeout` to make sure `circuitElementSelection` is turned on after `resetCircuitElementSelections` takes place
    setTimeout(() => {
      const [circuitElementSelections, setCircuitElementSelections] =
        $generalCircuitElementData.adaptParticle("circuitElementSelections");
      !circuitElementSelections().includes(id) &&
        setCircuitElementSelections((circuitElementSelections) => [
          ...circuitElementSelections,
          id,
        ]);
    });
  },
  resetCircuitElementSelections() {
    const setCircuitElementSelections =
      $generalCircuitElementData.adaptParticleSetter(
        "circuitElementSelections",
      );
    setCircuitElementSelections([]);
  },
  changeCircuitElementPosition({
    id,
    x,
    y,
  }: {
    id: CircuitElementId;
    x: number;
    y: number;
  }) {
    const setPosition = $circuitElementPositions.adaptParticle(id)![1];
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
    const setConductorPreviewData =
      $generalCircuitElementData.adaptParticleSetter("conductorPreviewData");
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
