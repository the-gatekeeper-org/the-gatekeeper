import { Container, Graphics, IPointData, Renderer, Ticker } from "pixi.js";
import Gate from "./gate/Gate";
import { GateOptions } from "./gate/Gate";
import { bg, border } from "@/colors";
import Grid, { GridOptions } from "./grid/Grid";
import Orchestrator from "@/entities/Orchestrator";
import { adaptEffect, adaptState, unify } from "promethium-js";
import {
  connectionPointSelectionCircleDimensions,
  gridGap,
} from "./dimensions";

interface GlobalThis {
  __PIXI_STAGE__: Container;
  __PIXI_RENDERER__: Renderer;
}

export default class VisualizationEngine {
  renderer: Renderer = new Renderer();
  stage: Container = new Container();
  ticker: Ticker = new Ticker();
  dragTarget?: Gate | null; // for tracking the current `DisplayObject` being dragged
  dragOrigin: IPointData = { x: 0, y: 0 }; // for tracking the beginning position of the mouse pointer when dragging
  dragTargetOrigin: IPointData = { x: 0, y: 0 }; // for tracking the beginning position of the `dragTarget` when dragging
  optionsOfNextGateToAdd: Pick<
    GateOptions,
    "gateType" | "noOfInputs" | "id"
  > | null = null;
  connectionPointSelectionCircle = new Graphics();
  connectionPointIsBeingHoveredOver = unify(adaptState(false));
  connectionPointSelectionCirclePosition = unify(adaptState({ x: 0, y: 0 }));

  constructor() {
    Graphics.curves.maxLength = 4;
  }

  private buildConnectionPointSelectionCircle() {
    adaptEffect(() => {
      this.connectionPointSelectionCircle.clear();
      if (this.connectionPointIsBeingHoveredOver()) {
        this.connectionPointSelectionCircle.lineStyle({
          width: connectionPointSelectionCircleDimensions.strokeWidth,
          color: border["secondary-dark"],
          alignment: 1,
        });
        const { x, y } = this.connectionPointSelectionCirclePosition();
        this.connectionPointSelectionCircle.drawCircle(
          x,
          y,
          connectionPointSelectionCircleDimensions.radius
        );
      }
    });
  }

  init(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.renderer = new Renderer({
        view: canvas,
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
        antialias: true,
        resolution: 1,
        backgroundColor: bg["primary-dark"],
      });
    }
    // for debugging purposes (PixiJS Devtools)
    if (import.meta.env.DEV) {
      (globalThis as unknown as GlobalThis).__PIXI_STAGE__ = this.stage;
      (globalThis as unknown as GlobalThis).__PIXI_RENDERER__ = this.renderer;
    }
    const grid = this.addGrid({
      x: 0,
      y: 0,
      gridWidth: this.renderer.width,
      gridHeight: this.renderer.height,
      gridGap,
    });
    const resize = () => {
      const canvas = this.renderer.view as HTMLCanvasElement;
      const _w = canvas.offsetWidth;
      const _h = canvas.offsetHeight;
      this.renderer.resize(_w, _h);
      grid.resize(this.renderer.width, this.renderer.height);
    };
    this.initConnectionPointSelectionCircle();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => this.onPointerMove(e));
    this.renderer.view.addEventListener?.("pointerdown", (e) =>
      this.onPointerDown(e as PointerEvent)
    );
    this.ticker.add(() => {
      this.renderer.render(this.stage);
    });
    this.ticker.start();
  }

  private initConnectionPointSelectionCircle() {
    this.buildConnectionPointSelectionCircle();
    this.connectionPointSelectionCircle.eventMode = "static";
    this.connectionPointSelectionCircle.cursor = "pointer";
    this.stage.addChild(this.connectionPointSelectionCircle);
  }

  private addGate(options: Omit<GateOptions, "visualizationEngine">) {
    const gate = new Gate({ visualizationEngine: this, ...options });
    const { id, gateType } = options;
    Orchestrator.actions.addGate({ id, gate, gateType });
    gate.init();
    this.stage.addChild(gate);

    return gate;
  }

  private addGrid(options: GridOptions) {
    const grid = new Grid(options);
    grid.init();
    this.stage.addChild(grid);

    return grid;
  }

  private moveDragTarget(e: PointerEvent) {
    if (this.dragTarget && this.dragTarget.dragStarted()) {
      this.dragTarget.isBeingDragged(true);
      const newDragTarget_x =
        this.dragTargetOrigin.x + (e.screenX - this.dragOrigin.x);
      const newDragTarget_y =
        this.dragTargetOrigin.y + (e.screenY - this.dragOrigin.y);
      // TODO: transfer math into gate
      this.dragTarget.x = Math.round(newDragTarget_x / gridGap) * gridGap;
      this.dragTarget.y = Math.round(newDragTarget_y / gridGap) * gridGap;
    }
  }

  private onPointerDown(e: PointerEvent) {
    this.prepareToDragTarget(e);
    if (this.optionsOfNextGateToAdd) {
      this.addGate({
        // TODO: transfer math into gate
        x: Math.round(e.x / gridGap) * gridGap - gridGap,
        y: Math.round(e.y / gridGap) * gridGap - gridGap,
        ...this.optionsOfNextGateToAdd,
      });
    }
    this.optionsOfNextGateToAdd = null;
    Orchestrator.actions.turnOffButtonSelections();
    Orchestrator.actions.turnOffAllElementSelections();
  }

  private onPointerMove(e: PointerEvent) {
    this.moveDragTarget(e);
    const connectionPointIsBeingHoveredOver =
      Orchestrator.actions.checkForHoverOverConnectionPoint({
        x: Math.round(e.x / gridGap) * gridGap,
        y: Math.round(e.y / gridGap) * gridGap,
      });
    if (connectionPointIsBeingHoveredOver) {
      this.connectionPointSelectionCirclePosition({
        x: Math.round(e.x / gridGap) * gridGap,
        y: Math.round(e.y / gridGap) * gridGap,
      });
      this.connectionPointIsBeingHoveredOver(true);
    } else {
      this.connectionPointIsBeingHoveredOver(false);
    }
  }

  prepareToAddGate(
    options: Pick<GateOptions, "gateType" | "noOfInputs" | "id">
  ) {
    this.optionsOfNextGateToAdd = {
      gateType: options.gateType,
      noOfInputs: options.noOfInputs,
      id: options.id,
    };
  }

  private prepareToDragTarget(e: PointerEvent) {
    this.dragOrigin = {
      x: e.screenX,
      y: e.screenY,
    };
    this.dragTargetOrigin = {
      x: this.dragTarget?.x || 0,
      y: this.dragTarget?.y || 0,
    };
  }
}
