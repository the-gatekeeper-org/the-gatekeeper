import Orchestrator from "@/entities/Orchestrator";
import { Gate } from "./Gate";
import { inputTerminalDimensions } from "./dimensions";

export function adjustOpacityOnInteract(
  gate: Gate,
  // TODO: Modify types to be more dependent on the `Gate` type
  gateComponent: "gateBody" | "inputTerminals" | "outputTerminal"
) {
  if (gate.isBeingDragged()) {
    gate[gateComponent].alpha = 0.5;
  } else {
    gate[gateComponent].alpha = 1;
  }
}

export function addInputConnectionPoint(gate: Gate, index: number) {
  const x =
    inputTerminalDimensions.origin_X + inputTerminalDimensions.displacement_X;
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
