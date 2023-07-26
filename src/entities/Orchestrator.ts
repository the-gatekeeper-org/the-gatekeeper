import VisualizationEngine from "@/visualizationEngine/VisualizationEngine";
import { ActionEntity } from "promethium-js";
import { buttonSelections } from "./userInterfaceEntities";
import {
  ElementId,
  checkForHoverOverConnectionPointInConnectionPointsEntries,
  generateElementId,
} from "./utils";
import {
  elementSelections,
  inputConnectionPoints,
  outputConnectionPoints,
} from "./visualizationEntities";
import Gate, { GateOptions } from "@/visualizationEngine/gate/Gate";
import { elementInstances, elementTypes } from "./sharedEntities";
import { IPointData } from "pixi.js";

export const visualizationEngine = new VisualizationEngine();

const Orchestrator = new ActionEntity({
  init(canvas: HTMLCanvasElement) {
    visualizationEngine.init(canvas);
  },
  prepareToAddGate(
    options: Omit<
      Parameters<typeof visualizationEngine.prepareToAddGate>[0],
      "id"
    >
  ) {
    const id = generateElementId("e");
    visualizationEngine.prepareToAddGate({ ...options, id });
  },
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
  removeGate(id: ElementId) {
    Orchestrator.actions.turnOffElementSelection(id);
    elementTypes.deleteParticles([id]);
    elementSelections.deleteParticles([id]);
    inputConnectionPoints.deleteParticles([id]);
    outputConnectionPoints.deleteParticles([id]);
    elementInstances.deleteParticles([id]);
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
  turnOnButtonSelection(
    id: Parameters<typeof buttonSelections.adaptParticle>[0]
  ) {
    buttonSelections.adaptParticle(id)[1](true);
  },
  turnOffButtonSelections() {
    Object.entries(buttonSelections.getParticles()).forEach(
      ([_, [__, setButtonSelection]]) => {
        setButtonSelection(false);
      }
    );
  },
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
    if (
      checkForHoverOverConnectionPointInConnectionPointsEntries(
        hoverPoint,
        inputConnectionPointsEntries
      ) === true
    ) {
      return true;
    }
    const outputConnectionPointsEntries = Object.entries(
      outputConnectionPoints.getParticles()
    );
    if (
      checkForHoverOverConnectionPointInConnectionPointsEntries(
        hoverPoint,
        outputConnectionPointsEntries
      ) === true
    ) {
      return true;
    }

    return false;
  },
});

export default Orchestrator;
