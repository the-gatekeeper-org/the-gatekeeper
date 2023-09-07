import { $generalSimulatorState, ClickMode } from "./generalAppStateEntities";

export const generalAppStateOrchestration = {
  changeSimulatorClickMode(newSimulatorClickMode: ClickMode) {
    $generalSimulatorState.adaptParticle("clickMode")[1](newSimulatorClickMode);
  },
};
