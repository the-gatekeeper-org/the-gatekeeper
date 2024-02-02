import { ActionEntity, DerivativeEntity, ParticleEntity } from "promethium-js";

export type ButtonSelection =
  | "select"
  | "simulate"
  | "input"
  | "output"
  | "and"
  | "or"
  | "not";

export const _generalAppState = new ParticleEntity({
  buttonSelections: "select" as ButtonSelection,
});

export const _derivedAppState = new DerivativeEntity({
  clickMode: () => {
    const buttonSelection =
      _generalAppState.adaptParticleValue("buttonSelections");
    if (buttonSelection === "select" || buttonSelection === "simulate") {
      return buttonSelection;
    } else {
      return "other";
    }
  },
});

export const _generalAppStateActions = new ActionEntity({
  turnOnButtonSelection(buttonSelection: ButtonSelection) {
    _generalAppState.adaptParticleSetter("buttonSelections")(buttonSelection);
  },
  resetButtonSelection() {
    _generalAppState.adaptParticleSetter("buttonSelections")("select");
  },
});
