import { Container, Graphics, IPointData, Renderer, Ticker } from "pixi.js";
import { Gate } from "@/circuitElements/gate/Gate";
import { bg, border } from "@/ui/colors";
import { Grid, GridOptions } from "@/engines/visualization/grid/Grid";
import { adaptEffect, adaptState, unify } from "promethium-js";
import {
  connectionPointSelectionCircleDimensions,
  gridGap,
} from "./dimensions";
import { Conductor } from "@/circuitElements/conductor/Conductor";
import { round } from "./utils";
import {
  $generalCircuitElementData,
  CircuitElementType,
  _generalCircuitElementDataActions,
} from "@/stateEntities/generalCircuitElementData";
import { ConductorConnectionPoints } from "@/stateEntities/circuitElementConnectionPoints";
import { CircuitElement } from "@/circuitElements/CircuitElement";
import { Input } from "@/circuitElements/input/Input";
import { Output } from "@/circuitElements/output/Output";
import {
  $derivedAppState,
  _generalAppStateActions,
} from "@/stateEntities/generalAppState";
import { CircuitElementId } from "@/stateEntities/utils";
import { _circuitElementActions } from "@/circuitElements/actions";

interface GlobalThis {
  __PIXI_STAGE__: Container;
  __PIXI_RENDERER__: Renderer;
}

const circuitElementClasses: Record<CircuitElementType, typeof CircuitElement> =
  {
    and: Gate,
    or: Gate,
    not: Gate,
    nand: Gate,
    nor: Gate,
    xor: Gate,
    xnor: Gate,
    input: Input,
    output: Output,
    conductor: Conductor,
    blackBox: Gate,
  };

type PreparedCircuitElementOptions = {
  id: CircuitElementId;
  type: CircuitElementType;
  globalConnectionPoints?: ConductorConnectionPoints;
} | null;

export class VisualizationEngine {
  connectionPointIsBeingHoveredOver = unify(adaptState(false));
  connectionPointSelectionCirclePosition = unify(adaptState({ x: 0, y: 0 }));
  connectionPointSelectionCircle = new Graphics();
  dragOrigin: IPointData = { x: 0, y: 0 }; // for tracking the beginning position of the mouse pointer when dragging
  dragTarget: CircuitElement | null = null; // for tracking the current `DisplayObject` being dragged
  dragTargetOrigin: IPointData = { x: 0, y: 0 }; // for tracking the beginning position of the `dragTarget` when dragging
  hoverTarget: CircuitElement | null = null;
  currentPreparedCircuitElementOptions: PreparedCircuitElementOptions = null;
  renderer: Renderer = new Renderer();
  stage: Container = new Container();
  ticker: Ticker = new Ticker();

  constructor() {
    // for smoother curves
    Graphics.curves.maxLength = 4;
  }

  addCircuitElement(position: IPointData) {
    if (this.currentPreparedCircuitElementOptions) {
      // @ts-ignore - ignore ts error because I'm tired of trying to make the ts checker happy when everything works fine!! please make sure to pass the right arguments
      // to the constructor below as type-checking is disabled for the next line
      const circuitElement = new circuitElementClasses[
        this.currentPreparedCircuitElementOptions.type as CircuitElementType
      ]({
        visualizationEngine: this,
        id: this.currentPreparedCircuitElementOptions.id,
        gateType: this.currentPreparedCircuitElementOptions.type,
      });
      _circuitElementActions.dispatch("addCircuitElement", {
        id: this.currentPreparedCircuitElementOptions.id,
        type: this.currentPreparedCircuitElementOptions.type,
        position,
        instance: circuitElement,
        globalConnectionPoints:
          this.currentPreparedCircuitElementOptions.globalConnectionPoints,
      });
      circuitElement.cleanup = circuitElement.init();
      this.stage.addChild(circuitElement);

      return circuitElement;
    }
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
          connectionPointSelectionCircleDimensions.radius,
        );
      }
    });
  }

  protected conditionallyDrawConductorPreviewVisualsOrMoveDragTarget(
    e: PointerEvent,
  ) {
    const conductorPreviewData = $generalCircuitElementData.adaptParticleValue(
      "conductorPreviewData",
    );
    if (conductorPreviewData.isBeingDrawn) {
      const pointerCoordinates = { x: round(e.x), y: round(e.y) };
      _generalCircuitElementDataActions.dispatch("updateConductorPreview", {
        previousCoordinates: conductorPreviewData.coordinates.current,
        currentCoordinates: pointerCoordinates,
        startingCoordinates: conductorPreviewData.coordinates.starting,
        isBeingDrawn: true,
      });
    } else {
      this.moveDragTarget(e);
    }
  }

  protected conditionallyInitDrawingOfConductorPreviewVisuals(e: PointerEvent) {
    if (this.connectionPointIsBeingHoveredOver()) {
      const pointerCoordinates = { x: round(e.x), y: round(e.y) };
      _generalCircuitElementDataActions.dispatch("updateConductorPreview", {
        previousCoordinates: pointerCoordinates,
        currentCoordinates: pointerCoordinates,
        startingCoordinates: this.connectionPointSelectionCirclePosition(),
        isBeingDrawn: true,
      });
    }
  }

  protected conditionallySpawnCurrentPreparedCircuitElement({
    position,
    offset,
  }: {
    position: IPointData;
    offset?: boolean;
  }) {
    if (this.currentPreparedCircuitElementOptions) {
      this.addCircuitElement({
        x: round(position.x) - (offset ? gridGap : 0),
        y: round(position.y) - (offset ? gridGap : 0),
      });
    }
    this.currentPreparedCircuitElementOptions = null;
  }

  protected conditionallySpawnPreviewConductors() {
    const conductorPreviewData = $generalCircuitElementData.adaptParticleValue(
      "conductorPreviewData",
    );
    if (conductorPreviewData.isBeingDrawn) {
      const coordinates = conductorPreviewData.coordinates;
      const sharedConnectionPoints =
        Conductor.conductorPreviewPrimaryOrientation === "h"
          ? { x: coordinates.current!.x, y: coordinates.starting!.y }
          : { x: coordinates.starting!.x, y: coordinates.current!.y };
      const globalConnectionPoints_1 = [
        { x: coordinates.starting!.x, y: coordinates.starting!.y },
        sharedConnectionPoints,
      ] as ConductorConnectionPoints;
      const globalConnectionPoints_2 = [
        sharedConnectionPoints,
        { x: coordinates.current!.x, y: coordinates.current!.y },
      ] as ConductorConnectionPoints;
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: "conductor",
        globalConnectionPoints: globalConnectionPoints_1,
      });
      this.conditionallySpawnCurrentPreparedCircuitElement({
        position: globalConnectionPoints_1[0],
      });
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: "conductor",
        globalConnectionPoints: globalConnectionPoints_2,
      });
      this.conditionallySpawnCurrentPreparedCircuitElement({
        position: globalConnectionPoints_2[0],
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

    this.initConnectionPointSelectionCircle();
    this.initConductorPreview();
    this.initEventListeners(grid);
    this.initTicker();
  }

  protected initConductorPreview() {
    Conductor.buildConductorPreview();
    this.stage.addChild(Conductor.conductorPreview);
  }

  protected initConnectionPointSelectionCircle() {
    this.buildConnectionPointSelectionCircle();
    this.connectionPointSelectionCircle.eventMode = "static";
    this.connectionPointSelectionCircle.cursor = "pointer";
    this.stage.addChild(this.connectionPointSelectionCircle);
  }

  protected initEventListeners(grid: Grid) {
    const resize = () => {
      const canvas = this.renderer.view as HTMLCanvasElement;
      const _w = canvas.offsetWidth;
      const _h = canvas.offsetHeight;
      this.renderer.resize(_w, _h);
      grid.resize(this.renderer.width, this.renderer.height);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => this.onPointerMove(e));
    window.addEventListener("keydown", (e) => {
      if (e.code === "Backspace" || e.code === "Delete") {
        const circuitElementSelections =
          $generalCircuitElementData.adaptParticleValue(
            "circuitElementSelections",
          );
        circuitElementSelections.forEach((circuitElementSelection) => {
          _circuitElementActions.dispatch(
            "removeCircuitElement",
            circuitElementSelection,
          );
        });
      }
    });
    this.renderer.view.addEventListener?.("pointerdown", (e) =>
      this.onPointerDown(e as PointerEvent),
    );
    this.renderer.view.addEventListener?.("pointerup", () =>
      this.onPointerUp(),
    );
  }

  protected initTicker() {
    this.ticker.add(() => {
      this.renderer.render(this.stage);
    });
    this.ticker.start();
  }

  protected moveDragTarget(e: PointerEvent) {
    if (this.dragTarget && this.dragTarget.dragStarted()) {
      this.dragTarget.isBeingDragged(true);
      const newDragTarget_x =
        this.dragTargetOrigin.x + (e.screenX - this.dragOrigin.x);
      const newDragTarget_y =
        this.dragTargetOrigin.y + (e.screenY - this.dragOrigin.y);
      _generalCircuitElementDataActions.dispatch(
        "changeCircuitElementPosition",
        {
          id: this.dragTarget.id,
          x: newDragTarget_x,
          y: newDragTarget_y,
        },
      );
    }
  }

  protected onPointerDown(e: PointerEvent) {
    _generalCircuitElementDataActions.dispatch(
      "resetCircuitElementSelections",
      undefined,
    );
    this.prepareToDragTarget(e);
    this.conditionallySpawnCurrentPreparedCircuitElement({
      position: e,
      offset: true,
    });
    const mode = $derivedAppState.adaptDerivativeValue("mode");
    if (mode === "other" || mode === "select") {
      _generalAppStateActions.dispatch("resetButtonSelection", undefined);
    } else {
      _generalAppStateActions.dispatch("turnOnButtonSelection", "simulate");
    }
    this.conditionallyInitDrawingOfConductorPreviewVisuals(e);
  }

  protected onPointerMove(e: PointerEvent) {
    this.conditionallyDrawConductorPreviewVisualsOrMoveDragTarget(e);
    if (!this.hoverTarget) {
      this.connectionPointIsBeingHoveredOver(false);
    }
    this.hoverTarget = null;
  }

  protected onPointerUp() {
    this.conditionallySpawnPreviewConductors();
    _generalCircuitElementDataActions.dispatch("updateConductorPreview", {
      previousCoordinates: null,
      currentCoordinates: null,
      startingCoordinates: null,
      isBeingDrawn: false,
    });
  }

  prepareToAddCircuitElement({
    id,
    type,
    globalConnectionPoints,
  }: {
    id: CircuitElementId;
    type: CircuitElementType;
    globalConnectionPoints?: [IPointData, IPointData];
  }) {
    this.currentPreparedCircuitElementOptions = {
      id,
      type,
      globalConnectionPoints,
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
}

export const visualizationEngine = new VisualizationEngine();
