import { Graphics, Container } from "pixi.js";
import VisualizationEngine from "../VisualizationEngine";
import { bg, border, stroke } from "@/colors";
import { UnifiedState, adaptEffect, adaptState, unify } from "promethium-js";
import buildGateBody from "./buildGateBody";
import {
  gateBodyDimensions,
  inputTerminalDimensions,
  outputTerminalDimensions,
  selectionRectangeDimensions,
} from "./gateDimensions";
import { adjustOpacityOnInteract } from "./utils";

type Gates = ["and", "or", "not", "nand", "nor", "xor", "xnor"];

export type GateOptions = {
  visualizationEngine: VisualizationEngine;
  x: number;
  y: number;
  gate: Gates[number];
  noOfInputs: number;
};

export default class Gate extends Container {
  isBeingHoveredOver = unify(adaptState(false));
  isSelected = unify(adaptState(false));
  isBeingDragged = unify(adaptState(false));
  overridingSelect = unify(adaptState(false)); // for tracking whether the `Gate` is being dragged so that we override the showing of the `selectionRectangle`
  gateBody: Graphics = new Graphics();
  selectionRectange: Graphics = new Graphics();
  inputTerminals: Graphics = new Graphics();
  outputTerminal: Graphics = new Graphics();
  visualizationEngine: VisualizationEngine;
  gate: GateOptions["gate"];
  noOfInputs: UnifiedState<GateOptions["noOfInputs"]>;

  constructor(options: GateOptions) {
    super();
    this.visualizationEngine = options.visualizationEngine;
    this.x = options.x;
    this.y = options.y;
    this.gate = options.gate;
    this.noOfInputs = unify(adaptState(options.noOfInputs));
  }

  buildGateBody() {
    buildGateBody(this);
  }

  buildSelectionRectangle() {
    adaptEffect(() => {
      this.selectionRectange.clear();
      if (!this.overridingSelect()) {
        if (this.isSelected()) {
          this.selectionRectange.lineStyle({
            width: selectionRectangeDimensions.strokeWidth,
            color: border[11],
            alignment: 1,
          });
        }
      }
      const Y = this.noOfInputs() >= 6 ? this.inputTerminals.y : 0; // if the input terminals are lower than the gateBody, then the `selectionRectange` should be at the level of the gateBody instead (this occurs when the `noOfInputs` is less than 6)
      const { width, height } = this.getBounds();
      this.selectionRectange
        .beginFill(bg[10], 0.01)
        .drawRect(
          this.inputTerminals.x - selectionRectangeDimensions.originDelta_X,
          Y - selectionRectangeDimensions.originDelta_Y,
          width + selectionRectangeDimensions.widthDelta,
          height + selectionRectangeDimensions.heightDelta
        );
    });
  }

  buildGateTerminals() {
    this.inputTerminals.x = inputTerminalDimensions.displacement_X;
    const isNoOfInputsOdd = () => this.noOfInputs() % 2 !== 0;
    if (isNoOfInputsOdd()) {
      this.inputTerminals.y =
        -5 * this.noOfInputs() + 2.5 * inputTerminalDimensions.terminalGap;
      const end_Y =
        (this.noOfInputs() - 1) * inputTerminalDimensions.terminalGap;
      this.inputTerminals
        .lineStyle({
          width: inputTerminalDimensions.strokeWidth,
          color: stroke[10],
        })
        .moveTo(
          inputTerminalDimensions.origin_X,
          inputTerminalDimensions.origin_Y
        )
        .lineTo(inputTerminalDimensions.origin_X, end_Y)
        .beginFill(stroke[10])
        .lineStyle({ width: 0 });
      for (let i = 0; i < this.noOfInputs(); i++) {
        this.inputTerminals.drawCircle(
          inputTerminalDimensions.origin_X,
          i * inputTerminalDimensions.terminalGap,
          inputTerminalDimensions.terminalRadius
        );
      }
    } else {
      this.inputTerminals.y =
        -5 * this.noOfInputs() + 2 * inputTerminalDimensions.terminalGap;
      const end_Y = this.noOfInputs() * inputTerminalDimensions.terminalGap;
      this.inputTerminals
        .lineStyle({
          width: inputTerminalDimensions.strokeWidth,
          color: stroke[10],
        })
        .moveTo(
          inputTerminalDimensions.origin_X,
          inputTerminalDimensions.origin_Y
        )
        .lineTo(inputTerminalDimensions.origin_X, end_Y)
        .beginFill(stroke[10])
        .lineStyle({ width: 0 });
      for (let i = 0; i < this.noOfInputs() + 1; i++) {
        const isMiddleInput = () => i === this.noOfInputs() / 2;
        if (!isMiddleInput())
          // don't draw the middle input terminal for an even number of input terminals
          this.inputTerminals.drawCircle(
            inputTerminalDimensions.origin_X,
            i * inputTerminalDimensions.terminalGap,
            inputTerminalDimensions.terminalRadius
          );
      }
    }
    adaptEffect(() => adjustOpacityOnInteract(this, "inputTerminals"));

    this.outputTerminal.beginFill(stroke[10]);
    const circle_Y = this.gate === "not" ? "midPoint_Y_not" : "midPoint_Y";
    this.outputTerminal.drawCircle(
      gateBodyDimensions.end_X +
        outputTerminalDimensions[`delta_X_${this.gate}`],
      gateBodyDimensions[circle_Y],
      2
    );
    adaptEffect(() => adjustOpacityOnInteract(this, "outputTerminal"));
  }

  dragStart() {
    this.isBeingDragged(true);
    this.visualizationEngine.dragTarget = this;
  }

  dragEnd() {
    this.isBeingDragged(false);
    this.visualizationEngine.dragTarget = null;
  }

  init() {
    this.visualizationEngine.stage.addChild(this);
    this.initGateBody();
    this.initGateTerminals();
    this.initSelectionRectange();
  }

  initGateBody() {
    this.buildGateBody();
    this.addChild(this.gateBody);
  }

  initSelectionRectange() {
    this.buildSelectionRectangle();
    this.selectionRectange
      .on("pointerdown", () => this.onPointerDown())
      .on("pointerup", () => this.onPointerUp())
      .on("pointerupoutside", () => this.onPointerUp())
      .on("pointerover", () => this.onPointerOver())
      .on("pointerout", () => this.onPointerOut());
    this.selectionRectange.eventMode = "static";
    this.selectionRectange.cursor = "pointer";
    this.addChild(this.selectionRectange);
  }

  initGateTerminals() {
    this.buildGateTerminals();
    this.addChild(this.inputTerminals);
    this.addChild(this.outputTerminal);
  }

  onPointerDown() {
    this.dragStart();
    this.isSelected((isSelected) => !isSelected);
  }

  onPointerOver() {
    this.isBeingHoveredOver(true);
  }

  onPointerOut() {
    this.isBeingHoveredOver(false);
  }

  onPointerUp() {
    this.dragEnd();
    this.isSelected((isSelected) => {
      if (this.overridingSelect()) {
        this.overridingSelect(false);
        return true;
      }
      return isSelected;
    });
  }
}
