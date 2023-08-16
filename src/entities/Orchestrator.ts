import { VisualizationEngine } from "@/visualizationEngine/VisualizationEngine";
import { ActionEntity } from "promethium-js";
import {
  conductorOrchestration,
  connectionPointOrchestration,
  elementOrchestration,
  gateOrchestration,
} from "./visualizationOrchestration";
import { buttonOrchestration } from "./userInterfaceOrchestration";

export const visualizationEngine = new VisualizationEngine();

const Orchestrator = new ActionEntity({
  init(canvas: HTMLCanvasElement) {
    visualizationEngine.init(canvas);
  },
  ...gateOrchestration,
  ...conductorOrchestration,
  ...elementOrchestration,
  ...connectionPointOrchestration,
  ...buttonOrchestration,
});

export default Orchestrator;
