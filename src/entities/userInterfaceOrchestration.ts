import { buttonSelections } from "./userInterfaceEntities";

export const buttonOrchestration = {
  turnOnButtonSelection(
    id: Parameters<typeof buttonSelections.adaptParticle>[0],
  ) {
    buttonSelections.adaptParticle(id)[1](true);
  },
  turnOffButtonSelections(
    exceptions?: Parameters<typeof buttonSelections.adaptParticle>[0][],
  ) {
    buttonSelections
      .adaptParticles()
      .forEach(([buttonSelectionId, [__, setButtonSelection]]) => {
        let isException = false;
        exceptions?.forEach((exception) => {
          if (buttonSelectionId === exception) {
            isException = true;
          }
        });
        !isException && setButtonSelection(false);
      });
  },
};
