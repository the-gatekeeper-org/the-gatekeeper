import { Graphics } from "pixi.js";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import { adaptEffect } from "promethium-js";
import {
  inputTerminalDimensions,
  outputBodyDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { stroke } from "@/colors";
import { adjustOpacityOnInteract } from "../utils";
import Orchestrator from "@/entities/Orchestrator";

export type OutputOptions = CircuitElementOptions;
export class Output extends CircuitElement {
  outputBody = new Graphics();
  inputTerminal = new Graphics();

  constructor(options: OutputOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
  }

  protected buildInputTerminal() {
    adaptEffect(() => {
      this.inputTerminal.beginFill(stroke["primary-dark"]);
      this.inputTerminal.drawCircle(
        inputTerminalDimensions.center_X,
        inputTerminalDimensions.center_Y,
        inputTerminalDimensions.terminalRadius
      );
      Orchestrator.actions.addInputConnectionPoint({
        id: this.id,
        connectionPoint: {
          x: inputTerminalDimensions.center_X,
          y: inputTerminalDimensions.center_Y,
        },
      });
      adjustOpacityOnInteract(this, this.inputTerminal);
    });
  }

  protected buildOutputBody() {
    adaptEffect(() => {
      this.outputBody.clear();
      this.outputBody.lineStyle({
        width: outputBodyDimensions.strokeWidth,
        color: stroke["primary-dark"],
      });
      this.outputBody.drawCircle(
        outputBodyDimensions.center_X,
        outputBodyDimensions.center_Y,
        outputBodyDimensions.radius
      );
      adjustOpacityOnInteract(this, this.outputBody);
    });
  }

  protected buildSelectionRectangle() {
    adaptEffect(() => {
      this.genericBuildSelectionRectangleFunctionality(
        selectionRectangeDimensions.strokeWidth
      );
      const { width, height } = this.getBounds();
      this.selectionRectangle.drawRect(
        selectionRectangeDimensions.origin_X,
        selectionRectangeDimensions.origin_Y,
        width + selectionRectangeDimensions.widthDelta,
        height + selectionRectangeDimensions.heightDelta
      );
    });
  }

  init() {
    this.initOutputBody();
    this.initInputTerminal();
    this.initSelectionRectangle();
  }

  protected initInputTerminal() {
    this.buildInputTerminal();
    this.addChild(this.inputTerminal);
  }

  protected initOutputBody() {
    this.buildOutputBody();
    this.addChild(this.outputBody);
  }

  protected onPointerDown() {
    this.genericOnPointerDownFunctionality();
  }

  protected onPointerUp() {
    this.genericOnPointerUpFunctionality();
  }
}
