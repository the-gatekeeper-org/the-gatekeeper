import { Graphics, Container } from "pixi.js";
import VisualizationEngine from "./VisualizationEngine";
import { bg, text, border } from "@/colors";
import { adaptEffect, adaptState, unify } from "promethium-js";

export default class Gate extends Container {
  isBeingHoveredOver = unify(adaptState(false));
  isSelected = unify(adaptState(false));
  isBeingDragged = unify(adaptState(false));
  overridingSelect = unify(adaptState(false)); // for tracking whether the `Gate` is being dragged so that we override the showing of the `selectionRectangle`
  gateBody: Graphics = new Graphics();
  selectionRectange: Graphics = new Graphics();
  visualizationEngine: VisualizationEngine;

  constructor(visualizationEngine: VisualizationEngine, x: number, y: number) {
    super();
    this.visualizationEngine = visualizationEngine;
    this.x = x;
    this.y = y;
  }

  buildGateBody() {
    this.gateBody.lineStyle({ width: 2, color: text[10] });
    this.gateBody.lineTo(25, 0);
    this.gateBody.bezierCurveTo(60, 0, 60, 50, 25, 50);
    this.gateBody.lineTo(0, 50);
    this.gateBody.closePath();
    adaptEffect(() => {
      if (this.overridingSelect() || this.isBeingHoveredOver()) {
        this.gateBody.alpha = 0.5;
      } else {
        this.gateBody.alpha = 1;
      }
    });
  }

  buildSelectionRectangle() {
    adaptEffect(() => {
      this.selectionRectange.clear();
      this.selectionRectange.beginFill(bg[10], 0.01);
      if (!this.overridingSelect()) {
        if (this.isSelected()) {
          this.selectionRectange.lineStyle({
            width: 1,
            color: border[11],
            alignment: 1,
          });
        }
      }
      const { width, height } = this.getBounds();
      this.selectionRectange.drawRect(
        this.gateBody.x - 3,
        this.gateBody.y - 3,
        width + 4,
        height + 4
      );
    });
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
