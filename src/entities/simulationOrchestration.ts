import { GateType } from "@/visualizationEngine/gate/Gate";
import { CircuitElementId } from "./utils";
import { $nodeInputs, $nodeOutputs } from "./simulationEntities";
import { adaptMemo } from "promethium-js";
import { simulationEngine } from "./Orchestrator";

export const simulationOrchestration = {
  addConductorSimulationEntities(id: CircuitElementId) {
    $nodeInputs.createParticle(id, []);
    $nodeOutputs.createDerivative(
      id,
      adaptMemo(() => {
        return simulationEngine.evaluate_Conductor(id);
      }),
    );
  },
  addNodeInput({
    elementId,
    nodeInput,
    position,
  }: {
    elementId: CircuitElementId;
    nodeInput: CircuitElementId;
    position?: number;
  }) {
    const setNodeInputs = $nodeInputs.adaptParticle(elementId)![1];
    setNodeInputs((nodeInputs) => {
      if (position !== undefined) {
        nodeInputs[position] = nodeInput;

        return nodeInputs;
      } else {
        return [nodeInput];
      }
    });
  },
  addGateSimulationEntities({
    gateType,
    id,
  }: {
    gateType: GateType;
    id: CircuitElementId;
  }) {
    $nodeInputs.createParticle(id, []);
    $nodeOutputs.createDerivative(
      id,
      adaptMemo(() => {
        return simulationEngine.evaluate_Gate(gateType, id);
      }),
    );
  },
  addInputSimulationEntities(id: CircuitElementId) {
    $nodeInputs.createParticle(id, [0]);
    $nodeOutputs.createDerivative(
      id,
      adaptMemo(() => {
        return simulationEngine.evaluate_Input(id);
      }),
    );
  },
  addOutputSimulationEntities(id: CircuitElementId) {
    $nodeInputs.createParticle(id, []);
    $nodeOutputs.createDerivative(
      id,
      adaptMemo(() => {
        return simulationEngine.evaluate_Output();
      }),
    );
  },
  toggleInputValue(id: CircuitElementId) {
    $nodeInputs.adaptParticle(id)![1](([value]) => (value === 0 ? [1] : [0]));
  },
};
