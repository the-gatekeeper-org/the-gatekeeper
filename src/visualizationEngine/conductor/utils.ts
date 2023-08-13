import { ConductorPreviewCoordinates } from "@/entities/visualizationEntities";

export function hasDirectionRestarted(
  coordinates: ConductorPreviewCoordinates,
  direction: "x" | "y"
) {
  let hasRestarted = false;
  if (coordinates.current![direction] >= coordinates.previous![direction]) {
    hasRestarted =
      coordinates.current![direction] >= coordinates.starting![direction] &&
      coordinates.previous![direction] <= coordinates.starting![direction];
  } else {
    hasRestarted =
      coordinates.current![direction] <= coordinates.starting![direction] &&
      coordinates.previous![direction] >= coordinates.starting![direction];
  }

  return hasRestarted;
}
