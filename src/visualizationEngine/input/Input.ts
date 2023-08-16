import { CircuitElement, CircuitElementOptions } from "../CircuitElement";

export type InputOptions = CircuitElementOptions;
export class Input extends CircuitElement {
  constructor(options: CircuitElementOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
  }

  protected buildSelectionRectangle() {}

  protected initSelectionRectangle() {}

  protected onPointerDown() {}

  protected onPointerUp() {}
}
