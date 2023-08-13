import { buttonSelections } from "./userInterfaceEntities";

export const buttonOrchestration = {
  turnOnButtonSelection(
    id: Parameters<typeof buttonSelections.adaptParticle>[0]
  ) {
    buttonSelections.adaptParticle(id)[1](true);
  },
  turnOffButtonSelections() {
    Object.entries(buttonSelections.getParticles()).forEach(
      ([_, [__, setButtonSelection]]) => {
        setButtonSelection(false);
      }
    );
  },
};
