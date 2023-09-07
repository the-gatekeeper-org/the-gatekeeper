import Orchestrator from "@/entities/Orchestrator";
import { Gate } from "./Gate";
import { inputTerminalDimensions } from "./dimensions";

export function addInputConnectionPoint(gate: Gate, index: number) {
  const x = inputTerminalDimensions.origin_X;
  const y =
    gate.inputTerminalsOrigin_Y + index * inputTerminalDimensions.terminalGap;
  const globalConnectionPoint = gate.toGlobal({ x, y });
  Orchestrator.actions.addInputConnectionPoint({
    id: gate.id,
    connectionPoint: globalConnectionPoint,
  });
}
