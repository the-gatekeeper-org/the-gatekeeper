import { $nodeOutputs } from "@/entities/simulationEntities";
import Orchestrator, { visualizationEngine } from "./Orchestrator";
import { CircuitElementId, generateCircuitElementId } from "./utils";
import { Gate, GateOptions } from "@/visualizationEngine/gate/Gate";
import {
  conductorConnectionPoints,
  conductorPreviewData,
  elementPositions,
  elementSelections,
  inputConnectionPoints,
  outputConnectionPoints,
} from "./visualizationEntities";
import { elementTypes, elementInstances } from "./sharedEntities";
import { IPointData } from "pixi.js";
import { conductorSizeIsValid } from "@/visualizationEngine/conductor/utils";
import { Input, InputOptions } from "@/visualizationEngine/input/Input";
import { Output, OutputOptions } from "@/visualizationEngine/output/Output";
import { Conductor } from "@/visualizationEngine/conductor/Conductor";
import { $nodeInputs } from "./simulationEntities";
import { round } from "@/visualizationEngine/utils";

export const gateOrchestration = {
  addGate({
    id,
    gate,
    gateType,
  }: Pick<GateOptions, "gateType" | "id"> & { gate: Gate }) {
    elementTypes.createParticle(id, gateType);
    elementSelections.createParticle(id, false);
    // TODO: make it possible to use `null` or `undefined` initial values for `adaptParticle` and co.
    // TODO: add method for tracking all particles in a `ParticleEntity` using effects and possibly memos
    inputConnectionPoints.createParticle(id, []);
    outputConnectionPoints.createParticle(id, []);
    elementInstances.createParticle(id, gate);
    Orchestrator.dispatch("addGateSimulationEntities", { gateType, id });
  },
  prepareToAddGate(
    options: Omit<
      Parameters<typeof visualizationEngine.prepareToAddGate>[0],
      "id"
    >,
  ) {
    const id = generateCircuitElementId();
    visualizationEngine.prepareToAddGate({ ...options, id });
  },
  removeGate(id: CircuitElementId) {
    Orchestrator.dispatch("turnOffElementSelection", id);
    elementTypes.deleteParticles([id]);
    elementSelections.deleteParticles([id]);
    inputConnectionPoints.deleteParticles([id]);
    outputConnectionPoints.deleteParticles([id]);
    const elementInstance = elementInstances.adaptParticle(id)![0]() as Gate;
    elementInstance.detonate();
    elementInstances.deleteParticles([id]);
    $nodeInputs.deleteParticles([id]);
    $nodeOutputs.deleteDerivatives([id]);
  },
};

export const conductorOrchestration = {
  addConductor({
    globalConnectionPoints,
    id,
  }: {
    globalConnectionPoints: [IPointData, IPointData];
    id?: CircuitElementId;
  }) {
    if (conductorSizeIsValid(globalConnectionPoints)) {
      let conductorId: CircuitElementId | undefined = id;
      if (conductorId === undefined) {
        conductorId = generateCircuitElementId();
      }
      elementTypes.createParticle(conductorId!, "conductor");
      conductorConnectionPoints.createParticle(
        conductorId!,
        globalConnectionPoints,
      );
      const conductor = visualizationEngine.addConductor({
        x: globalConnectionPoints[0].x,
        y: globalConnectionPoints[0].y,
        id: conductorId!,
      });
      elementInstances.createParticle(conductorId!, conductor);
      outputConnectionPoints.createParticle(conductorId, []);
      elementSelections.createParticle(conductorId, true);
      Orchestrator.dispatch("addConductorSimulationEntities", conductorId!);

      return conductorId;
    }
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
  removeConductor(id: CircuitElementId) {
    Orchestrator.dispatch("turnOffElementSelection", id);
    elementTypes.deleteParticles([id]);
    elementSelections.deleteParticles([id]);
    conductorConnectionPoints.deleteParticles([id]);
    const elementInstance = elementInstances.adaptParticle(
      id,
    )![0]() as Conductor;
    elementInstance.detonate();
    elementInstances.deleteParticles([id]);
    $nodeInputs.deleteParticles([id]);
    $nodeOutputs.deleteDerivatives([id]);
  },
};

export const inputOrchestration = {
  addInput({ id, input }: Pick<InputOptions, "id"> & { input: Input }) {
    elementTypes.createParticle(id, "input");
    elementSelections.createParticle(id, false);
    outputConnectionPoints.createParticle(id, []);
    elementInstances.createParticle(id, input);
    Orchestrator.dispatch("addInputSimulationEntities", id);
  },
  prepareToAddInput() {
    const id = generateCircuitElementId();
    visualizationEngine.prepareToAddInput({ id });
  },
  removeInput(id: CircuitElementId) {
    Orchestrator.dispatch("turnOffElementSelection", id);
    elementTypes.deleteParticles([id]);
    elementSelections.deleteParticles([id]);
    inputConnectionPoints.deleteParticles([id]);
    outputConnectionPoints.deleteParticles([id]);
    const elementInstance = elementInstances.adaptParticle(id)![0]() as Gate;
    elementInstance.detonate();
    elementInstances.deleteParticles([id]);
    $nodeInputs.deleteParticles([id]);
    $nodeOutputs.deleteDerivatives([id]);
  },
};

export const outputOrchestration = {
  addOutput({ id, output }: Pick<OutputOptions, "id"> & { output: Output }) {
    elementTypes.createParticle(id, "output");
    elementSelections.createParticle(id, false);
    inputConnectionPoints.createParticle(id, []);
    elementInstances.createParticle(id, output);
    Orchestrator.dispatch("addOutputSimulationEntities", id);
  },
  prepareToAddOutput() {
    const id = generateCircuitElementId();
    visualizationEngine.prepareToAddOutput({ id });
  },
  removeOutput(id: CircuitElementId) {
    Orchestrator.dispatch("turnOffElementSelection", id);
    elementTypes.deleteParticles([id]);
    elementSelections.deleteParticles([id]);
    inputConnectionPoints.deleteParticles([id]);
    outputConnectionPoints.deleteParticles([id]);
    const elementInstance = elementInstances.adaptParticle(id)![0]() as Gate;
    elementInstance.detonate();
    elementInstances.deleteParticles([id]);
    $nodeInputs.deleteParticles([id]);
    $nodeOutputs.deleteDerivatives([id]);
  },
};

export const elementOrchestration = {
  toggleElementSelection(
    id: Exclude<
      Parameters<typeof elementSelections.adaptParticle>[0],
      "selectedElements"
    >,
  ) {
    const isSelected = elementSelections.adaptParticle(id)![0];
    isSelected()
      ? Orchestrator.dispatch("turnOffElementSelection", id)
      : Orchestrator.dispatch("turnOnElementSelection", id);
  },
  turnOffAllElementSelections(
    exception?: Exclude<
      Parameters<typeof elementSelections.adaptParticle>[0],
      "selectedElements"
    >,
  ) {
    const [selectedElements, setSelectedElements] =
      elementSelections.adaptParticle("selectedElements");
    selectedElements().forEach(
      (selectedElement) =>
        selectedElement !== exception &&
        elementSelections.adaptParticle(selectedElement)![1](false),
    );
    exception ? setSelectedElements([exception]) : setSelectedElements([]);
  },
  turnOffElementSelection(
    id: Exclude<
      Parameters<typeof elementSelections.adaptParticle>[0],
      "selectedElements"
    >,
  ) {
    // TODO: find a better way to achieve this
    // use `setTimeout` to ensure parity with `turnOnElementSelection`
    setTimeout(() => {
      const [_, setSelectedElements] =
        elementSelections.adaptParticle("selectedElements");
      setSelectedElements((selectedElements) =>
        selectedElements.filter((elementId) => elementId !== id),
      );
      elementSelections.adaptParticle(id)![1](false);
    });
  },
  turnOnElementSelection(
    id: Exclude<
      Parameters<typeof elementSelections.adaptParticle>[0],
      "selectedElements"
    >,
  ) {
    // TODO: find a better way to achieve this
    // use `setTimeout` to ensure that `elementSelection` is only turned on after any possible `turnOffAllElementSelections` operations
    setTimeout(() => {
      const setSelectedElements =
        elementSelections.adaptParticle("selectedElements")[1];
      setSelectedElements((selectedElements) => [...selectedElements, id]);
      elementSelections.adaptParticle(id)![1](true);
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
    // TODO: update types in promethium to return `something | undefined` for generic particle ids
    inputConnectionPoints.adaptParticle(id)![1]((connectionPoints) => [
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
    // TODO: update types in promethium to return `something | undefined` for generic particle ids
    outputConnectionPoints.adaptParticle(id)![1]((connectionPoints) => [
      ...connectionPoints,
      connectionPoint,
    ]);
  },
  addConductorConnectionPoints({
    id,
    connectionPoints,
  }: {
    id: Parameters<typeof outputConnectionPoints.adaptParticle>[0];
    connectionPoints: [IPointData, IPointData];
  }) {
    conductorConnectionPoints.adaptParticle(id)![1](connectionPoints);
  },
  clearInputConnectionPoints({
    id,
  }: {
    id: Parameters<typeof inputConnectionPoints.adaptParticle>[0];
  }) {
    inputConnectionPoints.adaptParticle(id)![1]([]);
  },
  clearOutputConnectionPoints({
    id,
  }: {
    id: Parameters<typeof outputConnectionPoints.adaptParticle>[0];
  }) {
    outputConnectionPoints.adaptParticle(id)![1]([]);
  },
};

export const positionOrchestration = {
  changeElementPosition({
    id,
    x,
    y,
  }: {
    id: CircuitElementId;
    x: number;
    y: number;
  }) {
    const setPosition = elementPositions.adaptParticle(id)![1];
    setPosition({ x: round(x), y: round(y) });
  },
};
