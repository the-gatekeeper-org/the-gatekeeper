import { Graphics } from "pixi.js";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import {
  inputBodyDimensions,
  outputTerminalDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { stroke } from "@/colors";
import { adaptEffect } from "promethium-js";
import { adjustOpacityOnInteract } from "../utils";
import Orchestrator from "@/entities/Orchestrator";

export type InputOptions = CircuitElementOptions;
export class Input extends CircuitElement {
  inputBody = new Graphics();
  outputTerminal = new Graphics();

  constructor(options: CircuitElementOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
  }

  protected buildInputBody() {
    adaptEffect(() => {
      this.inputBody.clear();
      this.inputBody.lineStyle({
        width: inputBodyDimensions.strokeWidth,
        color: stroke["primary-dark"],
      });
      this.inputBody.drawRect(
        inputBodyDimensions.origin_X,
        inputBodyDimensions.origin_Y,
        inputBodyDimensions.width,
        inputBodyDimensions.height
      );
      adjustOpacityOnInteract(this, this.inputBody);
    });
  }

  protected buildOutputTerminal() {
    adaptEffect(() => {
      this.outputTerminal.beginFill(stroke["primary-dark"]);
      this.outputTerminal.drawCircle(
        outputTerminalDimensions.center_X,
        outputTerminalDimensions.center_Y,
        outputTerminalDimensions.terminalRadius
      );
      Orchestrator.actions.addOutputConnectionPoint({
        id: this.id,
        connectionPoint: {
          x: outputTerminalDimensions.center_X,
          y: outputTerminalDimensions.center_Y,
        },
      });
      adjustOpacityOnInteract(this, this.outputTerminal);
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
    this.initInputBody();
    this.initOutputTerminal();
    this.initSelectionRectangle();
  }

  protected initInputBody() {
    this.buildInputBody();
    this.addChild(this.inputBody);
  }

  protected initOutputTerminal() {
    this.buildOutputTerminal();
    this.addChild(this.outputTerminal);
  }

  protected onPointerDown() {
    this.genericOnPointerDownFunctionality();
  }

  protected onPointerUp() {
    this.genericOnPointerUpFunctionality();
  }
}
