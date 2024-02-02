import { CircuitElementId } from "@/stateEntities/utils";
import { Container, Graphics } from "pixi.js";
import { adaptEffect, adaptState, unify } from "promethium-js";
import { VisualizationEngine } from "@/engines/visualization/VisualizationEngine";
import {
  _elementPositions,
  _generalElementData,
  _generalElementDataActions,
} from "@/stateEntities/generalElementData";
import { bg, border } from "@/ui/colors";

export type CircuitElementOptions = {
  visualizationEngine: VisualizationEngine;
  id: CircuitElementId;
};

export abstract class CircuitElement extends Container {
  dragStarted = unify(adaptState(false));
  id: CircuitElementId;
  isBeingDragged = unify(adaptState(false));
  selectionRectangle = new Graphics();
  visualizationEngine: VisualizationEngine;
  cleanup: (() => void) | null = null;

  constructor(options: CircuitElementOptions) {
    super();
    this.visualizationEngine = options.visualizationEngine;
    adaptEffect(() => {
      this.position = _elementPositions.adaptParticleValue(this.id)!;
    });
    this.id = options.id;
  }

  protected abstract buildSelectionRectangle(): void;

  protected abstract conditionallyDrawConnectionPointCircle(
    e: PointerEvent,
  ): void;

  protected dragEnd() {
    this.dragStarted(false);
    this.visualizationEngine.dragTarget = null;
  }

  protected dragStart() {
    this.dragStarted(true);
    this.visualizationEngine.dragTarget = this;
  }

  abstract init(): () => void;

  protected initSelectionRectangle() {
    this.buildSelectionRectangle();
    this.selectionRectangle
      .on("pointerdown", this.onPointerDown)
      .on("pointerup", this.onPointerUp)
      .on("pointerupoutside", this.onPointerUp)
      .on("pointermove", this.onPointerMove);
    this.selectionRectangle.eventMode = "static";
    this.selectionRectangle.cursor = "pointer";
    this.addChild(this.selectionRectangle);
  }

  abstract detonate(): void;

  protected genericBuildSelectionRectangleFunctionality(strokeWidth: number) {
    this.selectionRectangle.clear();
    if (!this.isBeingDragged()) {
      const isSelected = _generalElementData
        .adaptParticleValue("selectedElements")
        .includes(this.id);
      if (isSelected) {
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
  }

  protected genericDetonateFunctionality() {
    this.selectionRectangle.destroy();
    this.destroy();
    this.cleanup?.();
  }

  protected genericOnPointerDownFunctionality() {
    this.dragStart();
    _generalElementDataActions.dispatch("toggleElementSelection", this.id);
  }

  protected genericOnPointerMoveFunctionality(e: PointerEvent) {
    this.conditionallyDrawConnectionPointCircle(e);
    this.visualizationEngine.hoverTarget = this;
  }

  protected genericOnPointerUpFunctionality() {
    this.dragEnd();
    if (this.isBeingDragged()) {
      this.isBeingDragged(false);
      _generalElementDataActions.dispatch("turnOnElementSelection", this.id);
    }
  }

  protected abstract onPointerDown(): void;
  protected abstract onPointerMove(e: PointerEvent): void;
  protected abstract onPointerUp(): void;
}
