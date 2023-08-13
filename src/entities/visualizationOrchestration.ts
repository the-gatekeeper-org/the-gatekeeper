import Orchestrator, { visualizationEngine } from "./Orchestrator";
import {
  ElementId,
  checkForHoverOverConnectionPointInConnectionPointsEntries,
  generateElementId,
} from "./utils";
import { Gate, GateOptions } from "@/visualizationEngine/gate/Gate";
import {
  conductorConnectionPoints,
  conductorPreviewData,
  elementSelections,
  inputConnectionPoints,
  outputConnectionPoints,
} from "./visualizationEntities";
import { elementTypes, elementInstances } from "./sharedEntities";
import { IPointData } from "pixi.js";

export const gateOrchestration = {
  addGate({
    id,
    gate,
    gateType,
  }: Pick<GateOptions, "gateType" | "id"> & { gate: Gate }) {
    elementTypes.adaptParticle(id, gateType);
    elementSelections.adaptParticle(id, false);
    // TODO: Make it possible to use `null` or `undefined` initial values for `adaptParticle` and co.
    // TODO: Add method for tracking all particles in a `ParticleEntity` using effects and possibly memos
    inputConnectionPoints.adaptParticle(id, []);
    outputConnectionPoints.adaptParticle(id, []);
    elementInstances.adaptParticle(id, gate);
  },
  prepareToAddGate(
    options: Omit<
      Parameters<typeof visualizationEngine.prepareToAddGate>[0],
      "id"
    >
  ) {
    const id = generateElementId();
    visualizationEngine.prepareToAddGate({ ...options, id });
  },
  removeGate(id: ElementId) {
    Orchestrator.actions.turnOffElementSelection(id);
    elementTypes.deleteParticles([id]);
    elementSelections.deleteParticles([id]);
    inputConnectionPoints.deleteParticles([id]);
    outputConnectionPoints.deleteParticles([id]);
    elementInstances.deleteParticles([id]);
  },
};

export const conductorOrchestration = {
  addConductor(connectionPoints: [IPointData, IPointData]) {
    const id = generateElementId();
    conductorConnectionPoints.adaptParticle(id, connectionPoints);
    visualizationEngine.addConductor({ id });
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
    const setCoordinates = conductorPreviewData.adaptParticle("coordinates")[1];
    setCoordinates({
      previous: previousCoordinates,
      current: currentCoordinates,
      starting: startingCoordinates,
    });
    const setIsBeingDrawn =
      conductorPreviewData.adaptParticle("isBeingDrawn")[1];
    setIsBeingDrawn(isBeingDrawn);
  },
};

export const elementOrchestration = {
  toggleElementSelection(
    id: Exclude<
      Parameters<typeof elementSelections.adaptParticle>[0],
      "selectedElements"
    >
  ) {
    const isSelected = elementSelections.adaptParticle(id)[0];
    isSelected()
      ? Orchestrator.actions.turnOffElementSelection(id)
      : Orchestrator.actions.turnOnElementSelection(id);
  },
  turnOffAllElementSelections(
    exception?: Exclude<
      Parameters<typeof elementSelections.adaptParticle>[0],
      "selectedElements"
    >
  ) {
    const [selectedElements, setSelectedElements] =
      elementSelections.adaptParticle("selectedElements");
    selectedElements().forEach(
      (selectedElement) =>
        selectedElement !== exception &&
        elementSelections.adaptParticle(selectedElement)[1](false)
    );
    exception ? setSelectedElements([exception]) : setSelectedElements([]);
  },
  turnOffElementSelection(
    id: Exclude<
      Parameters<typeof elementSelections.adaptParticle>[0],
      "selectedElements"
    >
  ) {
    // TODO: Find a better way to achieve this
    // use `setTimeout` to ensure parity with `turnOnElementSelection`
    setTimeout(() => {
      const [_, setSelectedElements] =
        elementSelections.adaptParticle("selectedElements");
      setSelectedElements((selectedElements) =>
        selectedElements.filter((elementId) => elementId !== id)
      );
      elementSelections.adaptParticle(id)[1](false);
    });
  },
  turnOnElementSelection(
    id: Exclude<
      Parameters<typeof elementSelections.adaptParticle>[0],
      "selectedElements"
    >
  ) {
    // TODO: Find a better way to achieve this
    // use `setTimeout` to ensure that `elementSelection` is only turned on after any possible `turnOffAllElementSelections` operations
    setTimeout(() => {
      const setSelectedElements =
        elementSelections.adaptParticle("selectedElements")[1];
      setSelectedElements((selectedElements) => [...selectedElements, id]);
      elementSelections.adaptParticle(id)[1](true);
    });
  },
};

export const connectionPointOrchestration = {
  addInputConnectionPoint({
    id,
    connectionPoint,
  }: {
    id: Parameters<typeof inputConnectionPoints.adaptParticle>[0];
    connectionPoint: IPointData;
  }) {
    // TODO: Update types in promethium to return `something | undefined` for generic particle ids
    inputConnectionPoints.adaptParticle(id)[1]((connectionPoints) => [
      ...connectionPoints,
      connectionPoint,
    ]);
  },
  addOutputConnectionPoint({
    id,
    connectionPoint,
  }: {
    id: Parameters<typeof outputConnectionPoints.adaptParticle>[0];
    connectionPoint: IPointData;
  }) {
    // TODO: Update types in promethium to return `something | undefined` for generic particle ids
    outputConnectionPoints.adaptParticle(id)[1]((connectionPoints) => [
      ...connectionPoints,
      connectionPoint,
    ]);
  },
  checkForHoverOverConnectionPoint(hoverPoint: IPointData) {
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
  },
};
