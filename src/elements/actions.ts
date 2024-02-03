import { ActionEntity, adaptMemo } from "promethium-js";
import {
  _elementTypes,
  _elementInstances,
  CircuitElementType,
  _elementPositions,
  _generalElementDataActions,
} from "@/stateEntities/generalElementData";
import {
  ConductorConnectionPoints,
  _conductorConnectionPointsCollection,
  _inputConnectionPointsCollection,
  _outputConnectionPointsCollection,
} from "@/stateEntities/elementConnectionPoints";
import { CircuitElement } from "./CircuitElement";
import {
  CircuitElementId,
  generateCircuitElementId,
} from "@/stateEntities/utils";
import { IPointData } from "pixi.js";
import { visualizationEngine } from "@/engines/visualization/VisualizationEngine";
import { conductorSizeIsValid } from "./conductor/utils";
import { _nodeInputs, _nodeOutputs } from "@/stateEntities/simulationData";
import { simulationEngine } from "@/engines/simulation/SimulationEngine";

export const _elementActions = new ActionEntity({
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
    _elementTypes.createParticle(id, type);
    if (type === "conductor") {
      _conductorConnectionPointsCollection.createParticle(
        id,
        globalConnectionPoints!,
      );
    } else {
      _inputConnectionPointsCollection.createParticle(id, []);
      _outputConnectionPointsCollection.createParticle(id, []);
    }
    _elementInstances.createParticle(id, instance);
    _elementPositions.createParticle(id, position);
    _nodeInputs.createParticle(id, type === "input" ? [0] : []);
    _nodeOutputs.createDerivative(
      id,
      adaptMemo(() => {
        return simulationEngine.evaluateCircuitElement({ id, type });
      }),
    );
    _generalElementDataActions.dispatch("resetElementSelections", undefined);
    _generalElementDataActions.dispatch("turnOnElementSelection", id);
  },
  removeCircuitElement(id: CircuitElementId) {
    _elementTypes.deleteParticle(id);
    _inputConnectionPointsCollection.deleteParticle(id);
    _outputConnectionPointsCollection.deleteParticle(id);
    _conductorConnectionPointsCollection.deleteParticle(id);
    const element = _elementInstances.adaptParticleValue(id)!;
    element.detonate();
    _elementInstances.deleteParticle(id);
    _elementPositions.deleteParticle(id);
    _nodeInputs.deleteParticles([id]);
    _nodeOutputs.deleteDerivatives([id]);
    _generalElementDataActions.dispatch("resetElementSelections", undefined);
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
