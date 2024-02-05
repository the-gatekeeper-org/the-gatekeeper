import {
  $nodeInputsCollection,
  $nodeOutputsCollection,
} from "@/stateEntities/simulationData";
import { CircuitElementId } from "@/stateEntities/utils";
import { CircuitElementType } from "@/stateEntities/generalCircuitElementData";
import { circuitElementEvaluatorFns } from "./circuitElementEvaluatorFns";

export class SimulationEngine {
  evaluateCircuitElement({
    id,
    type,
  }: {
    id: CircuitElementId;
    type: CircuitElementType;
  }) {
    return circuitElementEvaluatorFns[type](id);
  }

  getActualOutputOfOutput(id: CircuitElementId) {
    const nodeInputs = $nodeInputsCollection.adaptParticle(id)![0]();
    const nodeInput = nodeInputs[0];

    return $nodeOutputsCollection.adaptDerivativeValue(
      nodeInput as CircuitElementId,
    );
  }
}

export const simulationEngine = new SimulationEngine();
