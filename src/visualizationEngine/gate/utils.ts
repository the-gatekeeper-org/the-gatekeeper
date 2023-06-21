import Gate from "./Gate";

export function adjustOpacityOnInteract(
  gate: Gate,
  gateComponent: "gateBody" | "inputTerminals" | "outputTerminal"
) {
  if (gate.overridingSelect() || gate.isBeingHoveredOver()) {
    gate[gateComponent].alpha = 0.5;
  } else {
    gate[gateComponent].alpha = 1;
  }
}
