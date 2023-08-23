import Orchestrator from "@/entities/Orchestrator";
import { Gate } from "./Gate";
import { inputTerminalDimensions } from "./dimensions";

export function addInputConnectionPoint(gate: Gate, index: number) {
  const x = inputTerminalDimensions.origin_X;
  const y =
    gate.inputTerminals.y +
    inputTerminalDimensions.origin_Y +
    index * inputTerminalDimensions.terminalGap;
  Orchestrator.actions.addInputConnectionPoint({
    id: gate.id,
    connectionPoint: { x, y },
  });
}

export function addOutputConnectionPoint({
  gate,
  x,
  y,
}: {
  gate: Gate;
  x: number;
  y: number;
}) {
  Orchestrator.actions.addOutputConnectionPoint({
    id: gate.id,
    connectionPoint: { x, y },
  });
}
