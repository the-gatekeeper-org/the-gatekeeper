import { CircuitElementId } from "@/stateEntities/utils";
import { Container, Graphics } from "pixi.js";
import { adaptSyncEffect, adaptState, unify } from "promethium-js";
import { VisualizationEngine } from "@/engines/visualization/VisualizationEngine";
import {
  $circuitElementPositions,
  $generalCircuitElementData,
  _generalCircuitElementDataActions,
} from "@/stateEntities/generalCircuitElementData";
import { bg, border } from "@/ui/colors";

export const circuitElementInstances: Record<
  CircuitElementId,
  CircuitElement | undefined
> = {};

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

  init() {
    return adaptSyncEffect(() => {
      adaptSyncEffect(() => {
        this.position = $circuitElementPositions.adaptParticleValue(this.id)!;
      });
      this.specificInitFunctionality();
      this.initSelectionRectangle();
      this.cullable = true;
    }, []);
  }

  protected initSelectionRectangle() {
    this.buildSelectionRectangle();
    this.selectionRectangle.addEventListener("pointerdown", this.onPointerDown);
    this.selectionRectangle.addEventListener("pointerup", this.onPointerUp);
    this.selectionRectangle.addEventListener(
      "pointerupoutside",
      this.onPointerUp,
    );
    this.selectionRectangle.addEventListener("pointermove", this.onPointerMove);
    this.selectionRectangle.eventMode = "static";
    this.selectionRectangle.cursor = "pointer";
    this.addChild(this.selectionRectangle);
  }

  detonate() {
    this.specificDetonateFunctionality();
    this.selectionRectangle.destroy();
    this.destroy();
    this.cleanup?.();
  }

  protected genericBuildSelectionRectangleFunctionality(strokeWidth: number) {
    this.selectionRectangle.clear();
    if (!this.isBeingDragged()) {
      const isSelected = $generalCircuitElementData
        .adaptParticleValue("circuitElementSelections")
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

  protected genericOnPointerDownFunctionality() {
    this.dragStart();
    _generalCircuitElementDataActions.dispatch(
      "toggleCircuitElementSelection",
      this.id,
    );
  }

  protected genericOnPointerMoveFunctionality(e: PointerEvent) {
    this.conditionallyDrawConnectionPointCircle(e);
    this.visualizationEngine.hoverTarget = this;
  }

  protected genericOnPointerUpFunctionality() {
    this.dragEnd();
    if (this.isBeingDragged()) {
      this.isBeingDragged(false);
      _generalCircuitElementDataActions.dispatch(
        "turnOnCircuitElementSelection",
        this.id,
      );
    }
  }

  protected abstract onPointerDown(): void;

  protected abstract onPointerMove(e: PointerEvent): void;

  protected abstract onPointerUp(): void;

  abstract specificDetonateFunctionality(): void;

  abstract specificInitFunctionality(): void;
}
