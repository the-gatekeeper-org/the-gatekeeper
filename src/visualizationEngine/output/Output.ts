import { Graphics, Text } from "pixi.js";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import { adaptEffect } from "promethium-js";
import {
  inputTerminalDimensions,
  outputBodyDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { stroke } from "@/colors";
import {
  addInputConnectionPoint,
  adjustOpacityOnInteract,
  checkForCollisionWithConductorConnectionPoint,
  inputConnectionPointIsBeingHoveredOver,
  round,
} from "../utils";
import Orchestrator, { simulationEngine } from "@/entities/Orchestrator";
import {
  elementPositions,
  inputConnectionPoints,
} from "@/entities/visualizationEntities";
import { $generalSimulatorState } from "@/entities/generalAppStateEntities";
import { NodeBitValue } from "@/entities/simulationEntities";
import { ipc } from "@/App";

export type OutputOptions = CircuitElementOptions;

export class Output extends CircuitElement {
  outputBody = new Graphics();
  inputTerminal = new Graphics();
  outputText = new Text("X", {
    fontFamily: "Arial",
    fontSize: 12,
    fill: 0xffffff,
    align: "center",
  });

  constructor(options: OutputOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
  }

  protected addInputConnectionPoint() {
    const position = elementPositions.adaptParticle(this.id)![0];
    adaptEffect(() => {
      Orchestrator.dispatch("clearInputConnectionPoints", { id: this.id });
      addInputConnectionPoint(this, {
        x: inputTerminalDimensions.center_X,
        y: inputTerminalDimensions.center_Y,
      });
    }, [position]);
  }

  protected buildInputTerminal() {
    adaptEffect(() => {
      this.inputTerminal.clear();
      this.inputTerminal.beginFill(stroke["primary-dark"]);
      this.inputTerminal.drawCircle(
        inputTerminalDimensions.center_X,
        inputTerminalDimensions.center_Y,
        inputTerminalDimensions.terminalRadius,
      );
      adjustOpacityOnInteract(this, this.inputTerminal);
    });
  }

  protected buildOutputBody() {
    adaptEffect(() => {
      this.outputBody.clear();
      const nodeOutput = simulationEngine.getActualOutput_Output(this.id);
      if (nodeOutput === 0) {
        this.outputBody.beginFill("#FFA500", 1);
      } else if (nodeOutput === 1) {
        this.outputBody.beginFill("#008000", 1);
      } else {
        this.outputBody.beginFill("#0000FF", 1);
      }
      this.outputBody.lineStyle({
        width: outputBodyDimensions.strokeWidth,
        color: stroke["primary-dark"],
      });
      this.outputBody.drawCircle(
        outputBodyDimensions.center_X,
        outputBodyDimensions.center_Y,
        outputBodyDimensions.radius,
      );
      adjustOpacityOnInteract(this, this.outputBody);
    });
  }

  protected buildOutputText() {
    adaptEffect(() => {
      const nodeOutput = simulationEngine.getActualOutput_Output(this.id);
      if (nodeOutput === undefined || nodeOutput === "floating") {
        this.outputText.text = "X";
      } else {
        this.outputText.text = (nodeOutput as NodeBitValue).toString();
      }
      this.outputText.x = 8;
      this.outputText.y = 3;
    });
  }

  protected buildSelectionRectangle() {
    adaptEffect(() => {
      this.genericBuildSelectionRectangleFunctionality(
        selectionRectangeDimensions.strokeWidth,
      );
      const { width, height } = this.getBounds();
      this.selectionRectangle.drawRect(
        selectionRectangeDimensions.origin_X,
        selectionRectangeDimensions.origin_Y,
        width + selectionRectangeDimensions.widthDelta,
        height + selectionRectangeDimensions.heightDelta,
      );
    });
  }

  protected conditionallyDrawConnectionPointCircle(e: PointerEvent) {
    if (inputConnectionPointIsBeingHoveredOver(this, { x: e.x, y: e.y })) {
      this.visualizationEngine.connectionPointIsBeingHoveredOver(true);
      this.visualizationEngine.connectionPointSelectionCirclePosition({
        x: round(e.x),
        y: round(e.y),
      });
    } else {
      this.visualizationEngine.connectionPointIsBeingHoveredOver(false);
    }
  }

  detonate() {
    this.outputBody.destroy();
    this.inputTerminal.destroy();
    this.genericDetonateFunctionality();
  }

  init() {
    this.initOutputBody();
    this.addInputConnectionPoint();
    this.initInputTerminal();
    this.initOutputText();
    this.genericInitFunctionality();
    Orchestrator.dispatch("turnOnElementSelection", this.id);
  }

  protected initInputTerminal() {
    this.buildInputTerminal();
    this.addChild(this.inputTerminal);
  }

  protected initOutputBody() {
    this.buildOutputBody();
    this.addChild(this.outputBody);
  }

  protected initOutputText() {
    this.buildOutputText();
    this.addChild(this.outputText);
  }

  protected onPointerDown = () => {
    const simulatorClickMode =
      $generalSimulatorState.adaptParticle("clickMode")[0]();
    if (simulatorClickMode === "selecting") {
      this.genericOnPointerDownFunctionality();
    }
  };

  protected onPointerMove = (e: PointerEvent) => {
    const simulatorClickMode =
      $generalSimulatorState.adaptParticle("clickMode")[0]();
    if (simulatorClickMode === "selecting") {
      this.genericOnPointerMoveFunctionality(e);
    }
  };

  protected onPointerUp = () => {
    const simulatorClickMode =
      $generalSimulatorState.adaptParticle("clickMode")[0]();
    if (simulatorClickMode === "selecting") {
      this.genericOnPointerUpFunctionality();
      const connectionPoints = inputConnectionPoints.adaptParticle(
        this.id,
      )![0]();
      for (let i = 0; i < connectionPoints.length; i++) {
        const connectionPoint = connectionPoints[i];
        const conductorConnectionPointIdOrFalse =
          checkForCollisionWithConductorConnectionPoint(connectionPoint);
        if (conductorConnectionPointIdOrFalse) {
          Orchestrator.dispatch("addNodeInput", {
            elementId: this.id,
            nodeInput: conductorConnectionPointIdOrFalse,
          });
          ipc.emit("action", {
            action: "addNodeInput",
            options: {
              elementId: this.id,
              nodeInput: conductorConnectionPointIdOrFalse,
            },
          });
        }
      }
    }
  };
}
