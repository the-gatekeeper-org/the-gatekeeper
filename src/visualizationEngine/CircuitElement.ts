import { CircuitElementId } from "@/entities/utils";
import { Container, Graphics } from "pixi.js";
import { adaptState, unify } from "promethium-js";
import { VisualizationEngine } from "./VisualizationEngine";
import { elementSelections } from "@/entities/visualizationEntities";
import { bg, border } from "@/colors";
import Orchestrator from "@/entities/Orchestrator";

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

  protected initSelectionRectangle() {
    this.buildSelectionRectangle();
    this.selectionRectangle
      .on("pointerdown", () => this.onPointerDown())
      .on("pointerup", () => this.onPointerUp())
      .on("pointerupoutside", () => this.onPointerUp());
    this.selectionRectangle.eventMode = "static";
    this.selectionRectangle.cursor = "pointer";
    this.addChild(this.selectionRectangle);
  }

  protected genericBuildSelectionRectangleFunctionality(strokeWidth: number) {
    this.selectionRectangle.clear();
    if (!this.isBeingDragged()) {
      const isSelected = elementSelections.adaptParticle(this.id)[0];
      if (isSelected()) {
        this.selectionRectangle.lineStyle({
          width: strokeWidth,
          color: border["secondary-dark"],
        });
      }
    }
    this.selectionRectangle.beginFill(bg["primary-dark"], 0.01);
  }

  protected genericInitFunctionality() {
    this.initSelectionRectangle();
    this.cullable = true;
    Orchestrator.actions.turnOffAllElementSelections();
    Orchestrator.actions.turnOnElementSelection(this.id);
  }

  protected genericOnPointerDownFunctionality() {
    this.dragStart();
    Orchestrator.actions.turnOffAllElementSelections(this.id);
    Orchestrator.actions.toggleElementSelection(this.id);
  }

  protected genericOnPointerUpFunctionality() {
    this.dragEnd();
    if (this.isBeingDragged()) {
      this.isBeingDragged(false);
      Orchestrator.actions.turnOnElementSelection(this.id);
    }
  }

  protected abstract onPointerDown(): void;
  protected abstract onPointerUp(): void;
}
