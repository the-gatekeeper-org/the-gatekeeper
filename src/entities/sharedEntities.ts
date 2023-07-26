import { ParticleEntity } from "promethium-js";
import { ElementId } from "./utils";
import { GateTypes } from "@/visualizationEngine/gate/Gate";
import { DisplayObject } from "pixi.js";

type ElementTypes = GateTypes[number] | "conductor" | "blackBox";

export const elementTypes = new ParticleEntity<Record<ElementId, ElementTypes>>(
  {}
);

export const elementInstances = new ParticleEntity<
  Record<ElementId, DisplayObject>
>({});
