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
// please leave this comment here! will be used later on
// type OtherNodeValues = "pullUp" |"pullDown" | "pending" | CircuitElementId | "error"

export const $nodeInputsCollection = new ParticleEntity<
  Record<CircuitElementId, NodeInput[]>
>({});

export const $nodeOutputsCollection = new DerivativeEntity<
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
    const setNodeInputs = $nodeInputsCollection.adaptParticle(elementId)![1];
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
    $nodeInputsCollection.adaptParticleSetter(id)!(([value]) =>
      value === 0 ? [1] : [0],
    );
  },
});
