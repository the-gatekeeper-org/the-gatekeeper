import { ParticleEntity } from "promethium-js";
import { CircuitElementId } from "./utils";
import { GateType } from "@/elements/gate/Gate";
import { CircuitElement } from "@/elements/CircuitElement";

type ElementType = GateType | "conductor" | "input" | "output" | "blackBox";

export const elementTypes = new ParticleEntity<
  Record<CircuitElementId, ElementType>
>({});

export const elementInstances = new ParticleEntity<
  Record<CircuitElementId, CircuitElement>
>({});
