import { Container, Graphics, IPointData, Renderer, Ticker } from "pixi.js";
import { Gate, GateOptions } from "@/elements/gate/Gate";
import { bg, border } from "@/ui/colors";
import { Grid, GridOptions } from "@/elements/grid/Grid";
import Orchestrator from "@/entities/Orchestrator";
import { adaptEffect, adaptState, unify } from "promethium-js";
import {
  connectionPointSelectionCircleDimensions,
  gridGap,
} from "./dimensions";
import { Conductor, ConductorOptions } from "@/elements/conductor/Conductor";
import { round } from "./utils";
import {
  ConductorConnectionPoints,
  conductorPreviewData,
  elementSelections,
} from "@/entities/visualizationEntities";
import { CircuitElement } from "@/elements/CircuitElement";
import { Input, InputOptions } from "@/elements/input/Input";
import { Output, OutputOptions } from "@/elements/output/Output";
import { $generalSimulatorState } from "@/entities/generalAppStateEntities";
import { elementTypes } from "@/entities/sharedEntities";

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
  hoverTarget?: CircuitElement | null;
  optionsOfNextGateToAdd: Pick<
    GateOptions,
    "gateType" | "noOfInputs" | "id"
  > | null = null;
  optionsOfNextInputToAdd: Pick<InputOptions, "id"> | null = null;
  optionsOfNextOutputToAdd: Pick<OutputOptions, "id"> | null = null;
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
    Orchestrator.dispatch("addGate", { id, gate, gateType });
    gate.init();
    this.stage.addChild(gate);

    return gate;
  }

  protected addInput(options: Omit<InputOptions, "visualizationEngine">) {
    const input = new Input({ visualizationEngine: this, ...options });
    const { id } = options;
    Orchestrator.dispatch("addInput", { id, input });
    input.init();
    this.stage.addChild(input);

    return input;
  }

  protected addOutput(options: Omit<OutputOptions, "visualizationEngine">) {
    const output = new Output({ visualizationEngine: this, ...options });
    const { id } = options;
    Orchestrator.dispatch("addOutput", { id, output });
    output.init();
    this.stage.addChild(output);

    return output;
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
    const conductorPreviewIsBeingDrawn =
      conductorPreviewData.adaptParticle("isBeingDrawn")[0]();
    const conductorPreviewCoordinates =
      conductorPreviewData.adaptParticle("coordinates")[0]();
    if (conductorPreviewIsBeingDrawn) {
      const pointerCoordinates = { x: round(e.x), y: round(e.y) };
      Orchestrator.dispatch("updateConductorPreview", {
        previousCoordinates: conductorPreviewCoordinates.current,
        currentCoordinates: pointerCoordinates,
        startingCoordinates: conductorPreviewCoordinates.starting,
        isBeingDrawn: true,
      });
      // ipc.emit("action", {
      //   action: "updateConductorPreview",
      //   options: {
      //     previousCoordinates: conductorPreviewCoordinates.current,
      //     currentCoordinates: pointerCoordinates,
      //     startingCoordinates: conductorPreviewCoordinates.starting,
      //     isBeingDrawn: true,
      //   },
      // });
    } else {
      this.moveDragTarget(e);
    }
  }

  protected conditionallyInitDrawingOfConductorPreviewVisuals(e: PointerEvent) {
    if (this.connectionPointIsBeingHoveredOver()) {
      const pointerCoordinates = { x: round(e.x), y: round(e.y) };
      Orchestrator.dispatch("updateConductorPreview", {
        previousCoordinates: pointerCoordinates,
        currentCoordinates: pointerCoordinates,
        startingCoordinates: this.connectionPointSelectionCirclePosition(),
        isBeingDrawn: true,
      });
      // ipc.emit("action", {
      //   action: "updateConductorPreview",
      //   options: {
      //     previousCoordinates: pointerCoordinates,
      //     currentCoordinates: pointerCoordinates,
      //     startingCoordinates: this.connectionPointSelectionCirclePosition(),
      //     isBeingDrawn: true,
      //   },
      // });
      // TODO: fix not being able to select tiny conductors because of drawing of conductor previews
      // TODO: find a better way to achieve this
      // use `setTimeout` to ensure that element selections are only turned off after any possible `turnOnElementSelection` operations
      setTimeout(() => {
        const conductorPreviewIsBeingDrawn =
          conductorPreviewData.adaptParticle("isBeingDrawn")[0]();
        if (conductorPreviewIsBeingDrawn) {
          Orchestrator.dispatch("turnOffAllElementSelections", undefined);
        }
      });
    }
  }

  protected conditionallySpawnNextGate(e: PointerEvent) {
    if (this.optionsOfNextGateToAdd) {
      this.addGate({
        x: round(e.x) - gridGap,
        y: round(e.y) - gridGap,
        ...this.optionsOfNextGateToAdd,
      });
    }
    this.optionsOfNextGateToAdd = null;
  }

  protected conditionallySpawnNextInput(e: PointerEvent) {
    if (this.optionsOfNextInputToAdd) {
      this.addInput({
        x: round(e.x) - gridGap,
        y: round(e.y) - gridGap,
        ...this.optionsOfNextInputToAdd,
      });
    }
    this.optionsOfNextInputToAdd = null;
  }

  protected conditionallySpawnNextOutput(e: PointerEvent) {
    if (this.optionsOfNextOutputToAdd) {
      this.addOutput({
        x: round(e.x) - gridGap,
        y: round(e.y) - gridGap,
        ...this.optionsOfNextOutputToAdd,
      });
    }
    this.optionsOfNextOutputToAdd = null;
  }

  protected conditionallySpawnPreviewConductors() {
    const conductorPreviewIsBeingDrawn =
      conductorPreviewData.adaptParticle("isBeingDrawn")[0]();
    if (conductorPreviewIsBeingDrawn) {
      const coordinates =
        conductorPreviewData.adaptParticle("coordinates")[0]();
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
      Orchestrator.dispatch("addConductor", {
        globalConnectionPoints: globalConnectionPoints_1,
      });
      Orchestrator.dispatch("addConductor", {
        globalConnectionPoints: globalConnectionPoints_2,
      });
    }
  }

  // TODO: further break up this function into smaller functions
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

    this.initEventListeners(grid);
    this.initConnectionPointSelectionCircle();
    this.initConductorPreview();
    this.initTicker();
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
        const selectedElements =
          elementSelections.adaptParticle("selectedElements")[0]();
        selectedElements.forEach((selectedElement) => {
          const elementType = elementTypes.adaptParticle(selectedElement)![0]();
          if (elementType === "conductor") {
            Orchestrator.dispatch("removeConductor", selectedElement);
          } else if (elementType === "input") {
            Orchestrator.dispatch("removeInput", selectedElement);
          } else if (elementType === "output") {
            Orchestrator.dispatch("removeOutput", selectedElement);
          } else {
            Orchestrator.dispatch("removeGate", selectedElement);
          }
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
      Orchestrator.dispatch("changeElementPosition", {
        id: this.dragTarget.id,
        x: newDragTarget_x,
        y: newDragTarget_y,
      });
    }
  }

  protected onPointerDown(e: PointerEvent) {
    this.prepareToDragTarget(e);
    this.conditionallySpawnNextGate(e);
    this.conditionallySpawnNextInput(e);
    this.conditionallySpawnNextOutput(e);
    Orchestrator.dispatch("turnOffAllElementSelections", undefined);
    Orchestrator.dispatch("turnOffButtonSelections", ["select", "simulate"]);
    const simulatorClickMode =
      $generalSimulatorState.adaptParticle("clickMode")[0]();
    if (simulatorClickMode === "other" || simulatorClickMode === "selecting") {
      Orchestrator.dispatch("changeSimulatorClickMode", "selecting");
      Orchestrator.dispatch("turnOnButtonSelection", "select");
    } else {
      Orchestrator.dispatch("changeSimulatorClickMode", "simulating");
      Orchestrator.dispatch("turnOnButtonSelection", "simulate");
    }
    this.conditionallyInitDrawingOfConductorPreviewVisuals(e);
  }

  protected onPointerUp() {
    this.conditionallySpawnPreviewConductors();
    Orchestrator.dispatch("updateConductorPreview", {
      previousCoordinates: null,
      currentCoordinates: null,
      startingCoordinates: null,
      isBeingDrawn: false,
    });
  }

  protected onPointerMove(e: PointerEvent) {
    this.conditionallyDrawConductorPreviewVisualsOrMoveDragTarget(e);
    if (!this.hoverTarget) {
      this.connectionPointIsBeingHoveredOver(false);
    }
    this.hoverTarget = null;
  }

  protected nullifyNextCircuitElementsToAdd() {
    this.optionsOfNextGateToAdd = null;
    this.optionsOfNextInputToAdd = null;
    this.optionsOfNextOutputToAdd = null;
  }

  prepareToAddGate(
    options: Pick<GateOptions, "gateType" | "noOfInputs" | "id">,
  ) {
    this.nullifyNextCircuitElementsToAdd();
    this.optionsOfNextGateToAdd = {
      gateType: options.gateType,
      noOfInputs: options.noOfInputs,
      id: options.id,
    };
  }

  prepareToAddInput(options: Pick<InputOptions, "id">) {
    this.nullifyNextCircuitElementsToAdd();
    this.optionsOfNextInputToAdd = {
      id: options.id,
    };
  }

  prepareToAddOutput(options: Pick<OutputOptions, "id">) {
    this.nullifyNextCircuitElementsToAdd();
    this.optionsOfNextOutputToAdd = {
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
}
