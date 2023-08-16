import { ParticleEntity } from "promethium-js";
import { CircuitElementId } from "./utils";
import { GateTypes } from "@/visualizationEngine/gate/Gate";
import { DisplayObject } from "pixi.js";

type ElementTypes = GateTypes[number] | "conductor" | "blackBox";

export const elementTypes = new ParticleEntity<
  Record<CircuitElementId, ElementTypes>
>({});

export const elementInstances = new ParticleEntity<
  Record<CircuitElementId, DisplayObject>
>({});
