import { Graphics, Container } from "pixi.js";
import VisualizationEngine from "../VisualizationEngine";
import { bg, border, stroke } from "@/colors";
import { adaptEffect, adaptState, unify } from "promethium-js";
import buildGateBody from "./buildGateBody";
import {
  gateBodyDimensions,
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

  constructor(options: GateOptions) {
    super();
    this.visualizationEngine = options.visualizationEngine;
    this.x = options.x;
    this.y = options.y;
    this.gate = options.gate;
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
      const { width, height } = this.getBounds();
      this.selectionRectange
        .beginFill(bg[10], 0.01)
        .drawRect(
          this.inputTerminals.x - selectionRectangeDimensions.originDelta_X,
          this.inputTerminals.y - selectionRectangeDimensions.originDelta_Y,
          width + selectionRectangeDimensions.widthDelta,
          height + selectionRectangeDimensions.heightDelta
        );
    });
  }

  buildGateTerminals() {
    this.inputTerminals.x = -10;
    this.inputTerminals.y = -25;
    this.inputTerminals
      .lineStyle({ width: 2, color: stroke[10] })
      .moveTo(2, 0)
      .lineTo(2, 100)
      .beginFill(stroke[10])
      .lineStyle({ width: 0 });
    for (let i = 0; i <= 100; i = i + 10) {
      this.inputTerminals.drawCircle(2, i, 2);
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
