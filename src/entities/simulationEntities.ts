import { DerivativeEntity, Getter, ParticleEntity } from "promethium-js";
import { CircuitElementId } from "./utils";

export type NodeBitValue = 0 | 1;
export type NodeInput = NodeBitValue | CircuitElementId;
export type NodeOutput = NodeBitValue | "floating";
// type OtherNodeValues = "pullUp" |"pullDown" | "pending" | CircuitElementId | "error"

export const $nodeInputs = new ParticleEntity<
  Record<CircuitElementId, NodeInput[]>
>({});

export const $nodeOutputs = new DerivativeEntity<
  Record<CircuitElementId, Getter<NodeOutput>>
>({});
