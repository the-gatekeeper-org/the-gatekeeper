import { VisualizationEngine } from "@/visualizationEngine/VisualizationEngine";
import { ActionEntity } from "promethium-js";
import {
  conductorOrchestration,
  connectionPointOrchestration,
  elementOrchestration,
  gateOrchestration,
  inputOrchestration,
  outputOrchestration,
} from "./visualizationOrchestration";
import { buttonOrchestration } from "./userInterfaceOrchestration";

export const visualizationEngine = new VisualizationEngine();

const Orchestrator = new ActionEntity({
  init(canvas: HTMLCanvasElement) {
    visualizationEngine.init(canvas);
  },
  ...gateOrchestration,
  ...conductorOrchestration,
  ...inputOrchestration,
  ...outputOrchestration,
  ...elementOrchestration,
  ...connectionPointOrchestration,
  ...buttonOrchestration,
});

export default Orchestrator;
