import { ActionEntity, DerivativeEntity, ParticleEntity } from "promethium-js";

export type ButtonSelection =
  | "select"
  | "wire"
  | "simulate"
  | "input"
  | "output"
  | "and"
  | "or"
  | "not";

export const $generalAppState = new ParticleEntity({
  buttonSelections: "select" as ButtonSelection,
});

export const $derivedAppState = new DerivativeEntity({
  mode() {
    const buttonSelection =
      $generalAppState.adaptParticleValue("buttonSelections");
    if (
      buttonSelection === "select" ||
      buttonSelection === "wire" ||
      buttonSelection === "simulate"
    ) {
      return buttonSelection;
    } else {
      return "other";
    }
  },
});

export const _generalAppStateActions = new ActionEntity({
  turnOnButtonSelection(buttonSelection: ButtonSelection) {
    $generalAppState.adaptParticleSetter("buttonSelections")(buttonSelection);
  },
  resetButtonSelection() {
    $generalAppState.adaptParticleSetter("buttonSelections")("select");
  },
});
