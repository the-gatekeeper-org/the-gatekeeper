import { $nodeOutputs, NodeBitValue } from "@/entities/simulationEntities";
import { Graphics, Text } from "pixi.js";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import {
  inputBodyDimensions,
  outputTerminalDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { stroke } from "@/colors";
import { adaptEffect } from "promethium-js";
import {
  addOutputConnectionPoint,
  adjustOpacityOnInteract,
  checkForCollisionWithConductorConnectionPoint,
  outputConnectionPointIsBeingHoveredOver,
  round,
} from "../utils";
import Orchestrator from "@/entities/Orchestrator";
import {
  elementPositions,
  outputConnectionPoints,
} from "@/entities/visualizationEntities";
import { $generalSimulatorState } from "@/entities/generalAppStateEntities";
import { ipc } from "@/App";

export type InputOptions = CircuitElementOptions;
export class Input extends CircuitElement {
  inputBody = new Graphics();
  outputTerminal = new Graphics();
  outputText = new Text("0", {
    fontFamily: "Arial",
    fontSize: 15,
    fill: 0xffffff,
    align: "center",
  });

  constructor(options: CircuitElementOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
  }

  protected addOutputConnectionPoint() {
    const position = elementPositions.adaptParticle(this.id)![0];
    adaptEffect(() => {
      Orchestrator.dispatch("clearOutputConnectionPoints", { id: this.id });
      addOutputConnectionPoint(this, {
        x: outputTerminalDimensions.center_X,
        y: outputTerminalDimensions.center_Y,
      });
    }, [position]);
  }

  protected buildInputBody() {
    adaptEffect(() => {
      this.inputBody.clear();
      const nodeOutput = $nodeOutputs.adaptDerivative(this.id)!();
      if (nodeOutput === 0) {
        this.inputBody.beginFill("#FFA500", 1);
      } else {
        this.inputBody.beginFill("#008000", 1);
      }
      this.inputBody.lineStyle({
        width: inputBodyDimensions.strokeWidth,
        color: stroke["primary-dark"],
      });
      this.inputBody.drawRect(
        inputBodyDimensions.origin_X,
        inputBodyDimensions.origin_Y,
        inputBodyDimensions.width,
        inputBodyDimensions.height,
      );
      adjustOpacityOnInteract(this, this.inputBody);
    });
  }

  protected buildOutputTerminal() {
    adaptEffect(() => {
      this.outputTerminal.clear();
      this.outputTerminal.beginFill(stroke["primary-dark"]);
      this.outputTerminal.drawCircle(
        outputTerminalDimensions.center_X,
        outputTerminalDimensions.center_Y,
        outputTerminalDimensions.terminalRadius,
      );
      adjustOpacityOnInteract(this, this.outputTerminal);
    });
  }

  protected buildOutputText() {
    adaptEffect(() => {
      const nodeOutput = $nodeOutputs.adaptDerivative(this.id)!();
      this.outputText.text = (nodeOutput as NodeBitValue).toString();
      this.outputText.x = 3;
      this.outputText.y = 2;
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
    if (outputConnectionPointIsBeingHoveredOver(this, { x: e.x, y: e.y })) {
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
    this.inputBody.destroy();
    this.outputTerminal.destroy();
    this.genericDetonateFunctionality();
  }

  init() {
    this.initInputBody();
    this.addOutputConnectionPoint();
    this.initOutputTerminal();
    this.initOutputText();
    this.genericInitFunctionality();
    Orchestrator.dispatch("turnOnElementSelection", this.id);
  }

  protected initInputBody() {
    this.buildInputBody();
    this.addChild(this.inputBody);
  }

  protected initOutputTerminal() {
    this.buildOutputTerminal();
    this.addChild(this.outputTerminal);
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
    } else if (simulatorClickMode === "simulating") {
      Orchestrator.dispatch("toggleInputValue", this.id);
      ipc.emit("action", { action: "toggleInputValue", options: this.id });
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
      const connectionPoints = outputConnectionPoints.adaptParticle(
        this.id,
      )![0]();
      for (let i = 0; i < connectionPoints.length; i++) {
        const connectionPoint = connectionPoints[i];
        const conductorConnectionPointIdOrFalse =
          checkForCollisionWithConductorConnectionPoint(connectionPoint);
        if (conductorConnectionPointIdOrFalse) {
          Orchestrator.dispatch("addNodeInput", {
            elementId: conductorConnectionPointIdOrFalse,
            nodeInput: this.id,
          });
          ipc.emit("action", {
            action: "addNodeInput",
            options: {
              elementId: conductorConnectionPointIdOrFalse,
              nodeInput: this.id,
            },
          });
        }
      }
    }
  };
}
