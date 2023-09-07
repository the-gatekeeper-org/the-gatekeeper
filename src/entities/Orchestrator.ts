import { VisualizationEngine } from "@/visualizationEngine/VisualizationEngine";
import { ActionEntity } from "promethium-js";
import {
  conductorOrchestration,
  connectionPointOrchestration,
  elementOrchestration,
  gateOrchestration,
  inputOrchestration,
  outputOrchestration,
  positionOrchestration,
} from "./visualizationOrchestration";
import { buttonOrchestration } from "./userInterfaceOrchestration";
import SimulationEngine from "@/simulationEngine/SimulationEngine";
import { simulationOrchestration } from "./simulationOrchestration";
import { generalAppStateOrchestration } from "./generalAppStateOrchestration";

export const visualizationEngine = new VisualizationEngine();
export const simulationEngine = new SimulationEngine();

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
  ...simulationOrchestration,
  ...generalAppStateOrchestration,
  ...positionOrchestration,
});

export default Orchestrator;
