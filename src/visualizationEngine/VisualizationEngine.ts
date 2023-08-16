import { Container, Graphics, IPointData, Renderer, Ticker } from "pixi.js";
import { Gate, GateOptions } from "./gate/Gate";
import { bg, border } from "@/colors";
import { Grid, GridOptions } from "./grid/Grid";
import Orchestrator from "@/entities/Orchestrator";
import { adaptEffect, adaptState, unify } from "promethium-js";
import {
  connectionPointSelectionCircleDimensions,
  gridGap,
} from "./dimensions";
import { Conductor, ConductorOptions } from "./conductor/Conductor";
import { round } from "./utils";
import {
  ConductorConnectionPoints,
  conductorPreviewData,
} from "@/entities/visualizationEntities";
import { CircuitElement } from "./CircuitElement";

interface GlobalThis {
  __PIXI_STAGE__: Container;
  __PIXI_RENDERER__: Renderer;
}

export class VisualizationEngine {
  connectionPointIsBeingHoveredOver = unify(adaptState(false));
  connectionPointSelectionCircle = new Graphics();
  connectionPointSelectionCirclePosition = unify(adaptState({ x: 0, y: 0 }));
  dragOrigin: IPointData = { x: 0, y: 0 }; // for tracking the beginning position of the mouse pointer when dragging
  dragTarget?: CircuitElement | null; // for tracking the current `DisplayObject` being dragged
  dragTargetOrigin: IPointData = { x: 0, y: 0 }; // for tracking the beginning position of the `dragTarget` when dragging
  optionsOfNextGateToAdd: Pick<
    GateOptions,
    "gateType" | "noOfInputs" | "id"
  > | null = null;
  renderer: Renderer = new Renderer();
  stage: Container = new Container();
  ticker: Ticker = new Ticker();

  constructor() {
    Graphics.curves.maxLength = 4;
  }

  addConductor(options: Omit<ConductorOptions, "visualizationEngine">) {
    const conductor = new Conductor({ visualizationEngine: this, ...options });
    conductor.init();
    this.stage.addChild(conductor);

    return conductor;
  }

  protected addGate(options: Omit<GateOptions, "visualizationEngine">) {
    const gate = new Gate({ visualizationEngine: this, ...options });
    const { id, gateType } = options;
    Orchestrator.actions.addGate({ id, gate, gateType });
    gate.init();
    this.stage.addChild(gate);

    return gate;
  }

  protected addGrid(options: GridOptions) {
    const grid = new Grid(options);
    grid.init();
    this.stage.addChild(grid);

    return grid;
  }

  protected buildConnectionPointSelectionCircle() {
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

  protected conditionallyDrawConductorPreviewVisualsOrMoveDragTarget(
    e: PointerEvent
  ) {
    const conductorPreviewIsBeingDrawn =
      conductorPreviewData.adaptParticle("isBeingDrawn")[0]();
    const conductorPreviewCoordinates =
      conductorPreviewData.adaptParticle("coordinates")[0]();
    if (conductorPreviewIsBeingDrawn) {
      const pointerCoordinates = { x: round(e.x), y: round(e.y) };
      Orchestrator.actions.updateConductorPreview({
        previousCoordinates: conductorPreviewCoordinates.current,
        currentCoordinates: pointerCoordinates,
        startingCoordinates: conductorPreviewCoordinates.starting,
        isBeingDrawn: true,
      });
    } else {
      this.moveDragTarget(e);
    }
  }

  protected conditionallyDrawConnectionPointCircle(e: PointerEvent) {
    const [connectionPointIsBeingHoveredOver] =
      Orchestrator.actions.checkForHoverOverConnectionPoint({
        x: round(e.x),
        y: round(e.y),
      });
    if (connectionPointIsBeingHoveredOver === true) {
      this.connectionPointSelectionCirclePosition({
        x: round(e.x),
        y: round(e.y),
      });
      this.connectionPointIsBeingHoveredOver(true);
    } else {
      this.connectionPointIsBeingHoveredOver(false);
    }
  }

  protected conditionallyInitDrawingOfConductorPreviewVisuals(e: PointerEvent) {
    if (this.connectionPointIsBeingHoveredOver()) {
      const pointerCoordinates = { x: round(e.x), y: round(e.y) };
      Orchestrator.actions.updateConductorPreview({
        previousCoordinates: pointerCoordinates,
        currentCoordinates: pointerCoordinates,
        startingCoordinates: this.connectionPointSelectionCirclePosition(),
        isBeingDrawn: true,
      });
      // TODO: Find a better way to achieve this
      // use `setTimeout` to ensure that element selections are only turned off after any possible `turnOnElementSelection` operations
      setTimeout(() => {
        const conductorPreviewIsBeingDrawn =
          conductorPreviewData.adaptParticle("isBeingDrawn")[0]();
        if (conductorPreviewIsBeingDrawn) {
          Orchestrator.actions.turnOffAllElementSelections();
        }
      });
    }
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
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => this.onPointerMove(e));
    this.renderer.view.addEventListener?.("pointerdown", (e) =>
      this.onPointerDown(e as PointerEvent)
    );
    this.renderer.view.addEventListener?.("pointerup", () =>
      this.onPointerUp()
    );

    this.initConnectionPointSelectionCircle();
    this.initConductorPreview();

    this.ticker.add(() => {
      this.renderer.render(this.stage);
    });
    this.ticker.start();
  }

  protected initConnectionPointSelectionCircle() {
    this.buildConnectionPointSelectionCircle();
    this.connectionPointSelectionCircle.eventMode = "static";
    this.connectionPointSelectionCircle.cursor = "pointer";
    this.stage.addChild(this.connectionPointSelectionCircle);
  }

  protected initConductorPreview() {
    Conductor.buildConductorPreview();
    this.stage.addChild(Conductor.conductorPreview);
  }

  protected moveDragTarget(e: PointerEvent) {
    if (this.dragTarget && this.dragTarget.dragStarted()) {
      this.dragTarget.isBeingDragged(true);
      const newDragTarget_x =
        this.dragTargetOrigin.x + (e.screenX - this.dragOrigin.x);
      const newDragTarget_y =
        this.dragTargetOrigin.y + (e.screenY - this.dragOrigin.y);
      // TODO: transfer math into gate
      this.dragTarget.x = round(newDragTarget_x);
      this.dragTarget.y = round(newDragTarget_y);
    }
  }

  protected onPointerDown(e: PointerEvent) {
    this.prepareToDragTarget(e);
    this.spawnNextGate(e);
    this.optionsOfNextGateToAdd = null;
    Orchestrator.actions.turnOffButtonSelections();
    Orchestrator.actions.turnOffAllElementSelections();
    this.conditionallyInitDrawingOfConductorPreviewVisuals(e);
  }

  protected onPointerUp() {
    this.spawnPreviewConductors();
    Orchestrator.actions.updateConductorPreview({
      previousCoordinates: null,
      currentCoordinates: null,
      startingCoordinates: null,
      isBeingDrawn: false,
    });
  }

  protected onPointerMove(e: PointerEvent) {
    this.conditionallyDrawConnectionPointCircle(e);
    this.conditionallyDrawConductorPreviewVisualsOrMoveDragTarget(e);
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

  protected prepareToDragTarget(e: PointerEvent) {
    this.dragOrigin = {
      x: e.screenX,
      y: e.screenY,
    };
    this.dragTargetOrigin = {
      x: this.dragTarget?.x || 0,
      y: this.dragTarget?.y || 0,
    };
  }

  protected spawnNextGate(e: PointerEvent) {
    if (this.optionsOfNextGateToAdd !== null) {
      this.addGate({
        // TODO: transfer math into gate
        x: round(e.x) - gridGap,
        y: round(e.y) - gridGap,
        ...this.optionsOfNextGateToAdd,
      });
    }
  }

  protected spawnPreviewConductors() {
    const conductorPreviewIsBeingDrawn =
      conductorPreviewData.adaptParticle("isBeingDrawn")[0]();
    if (conductorPreviewIsBeingDrawn) {
      const coordinates =
        conductorPreviewData.adaptParticle("coordinates")[0]();
      const sharedCoordinates =
        Conductor.conductorPreviewPrimaryOrientation === "h"
          ? { x: coordinates.current!.x, y: coordinates.starting!.y }
          : { x: coordinates.starting!.x, y: coordinates.current!.y };
      const conductorCoordinates_1 = [
        { x: coordinates.starting!.x, y: coordinates.starting!.y },
        sharedCoordinates,
      ] as ConductorConnectionPoints;
      const conductorCoordinates_2 = [
        sharedCoordinates,
        { x: coordinates.current!.x, y: coordinates.current!.y },
      ] as ConductorConnectionPoints;
      Orchestrator.actions.addConductor(conductorCoordinates_1);
      Orchestrator.actions.addConductor(conductorCoordinates_2);
    }
  }
}
