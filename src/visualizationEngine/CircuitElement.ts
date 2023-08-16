import { CircuitElementId } from "@/entities/utils";
import { Container, Graphics } from "pixi.js";
import { adaptState, unify } from "promethium-js";
import { VisualizationEngine } from "./VisualizationEngine";
import { elementSelections } from "@/entities/visualizationEntities";
import { border } from "@/colors";

export type CircuitElementOptions = {
  visualizationEngine: VisualizationEngine;
  x: number;
  y: number;
  id: CircuitElementId;
};

export abstract class CircuitElement extends Container {
  dragStarted = unify(adaptState(false));
  id: CircuitElementId;
  isBeingDragged = unify(adaptState(false));
  selectionRectangle = new Graphics();
  visualizationEngine: VisualizationEngine;

  constructor(options: CircuitElementOptions) {
    super();
    this.visualizationEngine = options.visualizationEngine;
    this.x = options.x;
    this.y = options.y;
    this.id = options.id;
  }

  protected abstract buildSelectionRectangle(): void;

  protected dragEnd() {
    this.dragStarted(false);
    this.visualizationEngine.dragTarget = null;
  }

  protected dragStart() {
    this.dragStarted(true);
    this.visualizationEngine.dragTarget = this;
  }

  protected abstract initSelectionRectangle(): void;

  protected genericBuildSelectionRectangleFunctionality(strokeWidth: number) {
    this.selectionRectangle.clear();
    if (!this.isBeingDragged()) {
      const isSelected = elementSelections.adaptParticle(this.id)[0];
      if (isSelected()) {
        this.selectionRectangle.lineStyle({
          width: strokeWidth,
          color: border["secondary-dark"],
          alignment: 1,
        });
      }
    }
  }

  protected genericInitSelectionRectangleFunctionality() {
    this.buildSelectionRectangle();
    this.selectionRectangle
      .on("pointerdown", () => this.onPointerDown())
      .on("pointerup", () => this.onPointerUp())
      .on("pointerupoutside", () => this.onPointerUp());
    this.selectionRectangle.eventMode = "static";
    this.selectionRectangle.cursor = "pointer";
    this.addChild(this.selectionRectangle);
  }

  protected abstract onPointerDown(): void;
  protected abstract onPointerUp(): void;
}
