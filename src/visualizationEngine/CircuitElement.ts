import { CircuitElementId } from "@/entities/utils";
import { Container, Graphics } from "pixi.js";
import { adaptEffect, adaptState, unify } from "promethium-js";
import { VisualizationEngine } from "./VisualizationEngine";
import {
  elementPositions,
  elementSelections,
} from "@/entities/visualizationEntities";
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
    const position = elementPositions.createParticle(options.id, {
      x: options.x,
      y: options.y,
    })[0];
    adaptEffect(() => {
      this.position = position();
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

  protected abstract init(): void;

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

  protected abstract detonate(): void;

  protected genericBuildSelectionRectangleFunctionality(strokeWidth: number) {
    this.selectionRectangle.clear();
    if (!this.isBeingDragged()) {
      const isSelected = elementSelections.adaptParticle(this.id)![0];
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
    Orchestrator.dispatch("turnOffAllElementSelections", undefined);
  }

  protected genericDetonateFunctionality() {
    this.selectionRectangle.destroy();
    this.destroy();
  }

  protected genericOnPointerDownFunctionality() {
    this.dragStart();
    Orchestrator.dispatch("turnOffAllElementSelections", this.id);
    Orchestrator.dispatch("toggleElementSelection", this.id);
  }

  protected genericOnPointerMoveFunctionality(e: PointerEvent) {
    this.conditionallyDrawConnectionPointCircle(e);
    this.visualizationEngine.hoverTarget = this;
  }

  protected genericOnPointerUpFunctionality() {
    this.dragEnd();
    if (this.isBeingDragged()) {
      this.isBeingDragged(false);
      Orchestrator.dispatch("turnOnElementSelection", this.id);
    }
  }

  protected abstract onPointerDown(): void;
  protected abstract onPointerMove(e: PointerEvent): void;
  protected abstract onPointerUp(): void;
}
