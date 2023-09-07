import { ParticleEntity } from "promethium-js";
import { CircuitElementId } from "./utils";
import { GateType } from "@/visualizationEngine/gate/Gate";
import { CircuitElement } from "@/visualizationEngine/CircuitElement";

type ElementTypes = GateType | "conductor" | "input" | "output" | "blackBox";

export const elementTypes = new ParticleEntity<
  Record<CircuitElementId, ElementTypes>
>({});

export const elementInstances = new ParticleEntity<
  Record<CircuitElementId, CircuitElement>
>({});
