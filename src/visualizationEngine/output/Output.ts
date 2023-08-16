import { CircuitElement, CircuitElementOptions } from "../CircuitElement";

export type OutputOptions = CircuitElementOptions;
export class Output extends CircuitElement {
  constructor(options: OutputOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
  }

  protected buildSelectionRectangle() {}

  protected initSelectionRectangle() {}

  protected onPointerDown() {}

  protected onPointerUp() {}
}
