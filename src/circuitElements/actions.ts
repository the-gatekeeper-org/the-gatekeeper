import { ActionEntity, adaptMemo } from "promethium-js";
import {
  $circuitElementTypes,
  $circuitElementInstances,
  CircuitElementType,
  $circuitElementPositions,
  _generalCircuitElementDataActions,
} from "@/stateEntities/generalCircuitElementData";
import {
  ConductorConnectionPoints,
  $conductorConnectionPointsCollection,
  $inputConnectionPointsCollection,
  $outputConnectionPointsCollection,
} from "@/stateEntities/circuitElementConnectionPoints";
import { CircuitElement } from "./CircuitElement";
import {
  CircuitElementId,
  generateCircuitElementId,
} from "@/stateEntities/utils";
import { IPointData } from "pixi.js";
import { visualizationEngine } from "@/engines/visualization/VisualizationEngine";
import { conductorSizeIsValid } from "./conductor/utils";
import {
  $nodeInputsCollection,
  $nodeOutputsCollection,
} from "@/stateEntities/simulationData";
import { simulationEngine } from "@/engines/simulation/SimulationEngine";

export const _circuitElementActions = new ActionEntity({
  addCircuitElement({
    id,
    instance,
    type,
    position,
    globalConnectionPoints,
  }: {
    id: CircuitElementId;
    instance: CircuitElement;
    type: CircuitElementType;
    position: IPointData;
    globalConnectionPoints?: ConductorConnectionPoints;
  }) {
    // TODO: add method for tracking all particles in a `ParticleEntity` using effects and possibly memos
    $circuitElementTypes.createParticle(id, type);
    if (type === "conductor") {
      $conductorConnectionPointsCollection.createParticle(
        id,
        globalConnectionPoints!,
      );
    } else {
      $inputConnectionPointsCollection.createParticle(id, []);
      $outputConnectionPointsCollection.createParticle(id, []);
    }
    $circuitElementInstances.createParticle(id, instance);
    $circuitElementPositions.createParticle(id, position);
    $nodeInputsCollection.createParticle(id, type === "input" ? [0] : []);
    $nodeOutputsCollection.createDerivative(
      id,
      adaptMemo(() => {
        return simulationEngine.evaluateCircuitElement({ id, type });
      }),
    );
    _generalCircuitElementDataActions.dispatch(
      "resetCircuitElementSelections",
      undefined,
    );
    _generalCircuitElementDataActions.dispatch(
      "turnOnCircuitElementSelection",
      id,
    );
  },
  removeCircuitElement(id: CircuitElementId) {
    // remove any possible references to element on `visualizationEngine`
    visualizationEngine.dragTarget = null;
    $circuitElementTypes.deleteParticle(id);
    $inputConnectionPointsCollection.deleteParticle(id);
    $outputConnectionPointsCollection.deleteParticle(id);
    $conductorConnectionPointsCollection.deleteParticle(id);
    const element = $circuitElementInstances.adaptParticleValue(id)!;
    element.detonate();
    $circuitElementInstances.deleteParticle(id);
    $circuitElementPositions.deleteParticle(id);
    $nodeInputsCollection.deleteParticles([id]);
    $nodeOutputsCollection.deleteDerivatives([id]);
    // TODO: move out of here
    _generalCircuitElementDataActions.dispatch(
      "resetCircuitElementSelections",
      undefined,
    );
  },
  prepareToAddCircuitElement({
    type,
    globalConnectionPoints,
  }: {
    type: CircuitElementType;
    globalConnectionPoints?: ConductorConnectionPoints;
  }) {
    if (type !== "conductor" || conductorSizeIsValid(globalConnectionPoints!)) {
      const id = generateCircuitElementId();
      visualizationEngine.prepareToAddCircuitElement({
        id,
        type,
        globalConnectionPoints,
      });
    }
  },
});
