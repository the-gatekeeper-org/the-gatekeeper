import { ParticleEntity } from "promethium-js";

export type ClickMode = "selecting" | "simulating" | "other";

export const $generalSimulatorState = new ParticleEntity<{
  clickMode: ClickMode;
}>({
  clickMode: "selecting",
});
