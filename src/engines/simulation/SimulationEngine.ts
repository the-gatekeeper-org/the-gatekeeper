import { _nodeInputs, _nodeOutputs } from "@/stateEntities/simulationData";
import { CircuitElementId } from "@/stateEntities/utils";
import { CircuitElementType } from "@/stateEntities/generalElementData";
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
    const nodeInputs = _nodeInputs.adaptParticle(id)![0]();
    const nodeInput = nodeInputs[0];

    return _nodeOutputs.adaptDerivativeValue(nodeInput as CircuitElementId);
  }
}

export const simulationEngine = new SimulationEngine();
