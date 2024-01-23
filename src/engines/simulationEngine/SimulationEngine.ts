import { NodeBitValue } from "@/entities/simulationEntities";
import { $nodeInputs, $nodeOutputs } from "@/entities/simulationEntities";
import { CircuitElementId } from "@/entities/utils";
import { GateType } from "@/elements/gate/Gate";
import evaluate_Gate from "./evaluate_Gate";

export default class SimulationEngine {
  getActualOutput_Output(id: CircuitElementId) {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    const nodeInput = nodeInputs[0];

    return $nodeOutputs.adaptDerivative(nodeInput as CircuitElementId)!();
  }

  evaluate_Gate(gateType: GateType, id: CircuitElementId) {
    return evaluate_Gate(gateType, id);
  }

  evaluate_Input(id: CircuitElementId) {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();

    return nodeInputs[0] as NodeBitValue;
  }

  evaluate_Output() {
    return "floating" as const;
  }

  evaluate_Conductor(id: CircuitElementId) {
    const nodeInputs = $nodeInputs.adaptParticle(id)![0]();
    for (let i = 0; i < nodeInputs.length; i++) {
      const nodeInput = nodeInputs[i];
      const nodeInput_Output = $nodeOutputs.adaptDerivative(
        nodeInput as CircuitElementId,
      )!();
      if (nodeInput_Output === 0 || nodeInput_Output === 1) {
        return nodeInput_Output;
      }
    }

    return "floating" as const;
  }
}
