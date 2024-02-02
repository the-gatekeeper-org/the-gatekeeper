import {
  ActionEntity,
  DerivativeEntity,
  Getter,
  ParticleEntity,
} from "promethium-js";
import { CircuitElementId } from "./utils";

export type NodeBitValue = 0 | 1;
export type NodeInput = NodeBitValue | CircuitElementId;
export type NodeOutput = NodeBitValue | "floating";
// type OtherNodeValues = "pullUp" |"pullDown" | "pending" | CircuitElementId | "error"

export const _nodeInputs = new ParticleEntity<
  Record<CircuitElementId, NodeInput[]>
>({});

export const _nodeOutputs = new DerivativeEntity<
  Record<CircuitElementId, Getter<NodeOutput>>
>({});

export const _simulationDataActions = new ActionEntity({
  addNodeInput({
    elementId,
    nodeInput,
    position,
  }: {
    elementId: CircuitElementId;
    nodeInput: CircuitElementId;
    position?: number;
  }) {
    const setNodeInputs = _nodeInputs.adaptParticle(elementId)![1];
    setNodeInputs((nodeInputs) => {
      if (position !== undefined) {
        nodeInputs[position] = nodeInput;

        return nodeInputs;
      } else {
        return [nodeInput];
      }
    });
  },
  toggleInputValue(id: CircuitElementId) {
    _nodeInputs.adaptParticleSetter(id)!(([value]) =>
      value === 0 ? [1] : [0],
    );
  },
});
