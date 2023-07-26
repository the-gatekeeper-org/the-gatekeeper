import { ElementId } from "@/entities/utils";
import { Graphics } from "pixi.js";

export type ConductorOptions = {
  id: ElementId;
};

export default class Conductor {
  id: ElementId;
  conductorBody = new Graphics();

  constructor(options: ConductorOptions) {
    this.id = options.id;
  }

  init() {}
}
