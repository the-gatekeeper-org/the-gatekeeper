import { Getter, ParticleEntity } from "promethium-js";
import { CircuitElementId } from "./utils";

type NodeValues = [0, 1, "pullUp", "pullDown", "pending", "error", "floating"];

export const nodeInputs = new ParticleEntity<
  Record<CircuitElementId, CircuitElementId[]>
>({
  "ce-4": ["ce-4", "ce-6"],
});

export const nodeOutputs = new ParticleEntity<
  Record<CircuitElementId, Getter<NodeValues[number]>>
>({
  "ce-4": () => "pending",
});
