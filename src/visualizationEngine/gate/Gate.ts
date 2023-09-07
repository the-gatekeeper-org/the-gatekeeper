import { Graphics } from "pixi.js";
import { stroke } from "@/colors";
import { UnifiedState, adaptEffect, adaptState, unify } from "promethium-js";
import buildGateBody from "./buildGateBody";
import {
  gateBodyDimensions,
  inputTerminalDimensions,
  outputTerminalDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { addInputConnectionPoint } from "./utils";
import {
  addOutputConnectionPoint,
  adjustOpacityOnInteract,
  checkForCollisionWithConductorConnectionPoint,
  inputConnectionPointIsBeingHoveredOver,
  outputConnectionPointIsBeingHoveredOver,
  round,
} from "../utils";
import { elementTypes } from "@/entities/sharedEntities";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import Orchestrator from "@/entities/Orchestrator";
import {
  elementPositions,
  inputConnectionPoints,
  outputConnectionPoints,
} from "@/entities/visualizationEntities";
import { $generalSimulatorState } from "@/entities/generalAppStateEntities";
import { ipc } from "@/App";

export type GateType = "and" | "or" | "not" | "nand" | "nor" | "xor" | "xnor";

export type GateOptions = CircuitElementOptions & {
  gateType: GateType;
  noOfInputs?: number;
};

// TODO: protect instance variables as with instance methods
export class Gate extends CircuitElement {
  gateBody = new Graphics();
  inputTerminals = new Graphics();
  inputTerminalsOrigin_Y = 0;
  inputTerminalsEnd_Y = 0;
  noOfInputs: UnifiedState<NonNullable<GateOptions["noOfInputs"]>>;
  outputTerminal = new Graphics();

  constructor(options: GateOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
    let defaultNoOfInputs = options.gateType === "not" ? 1 : 2;
    let noOfInputs: number;
    if (options.gateType === "not" || options.noOfInputs === undefined) {
      noOfInputs = defaultNoOfInputs;
    } else {
      noOfInputs = options.noOfInputs;
    }
    this.noOfInputs = unify(adaptState(noOfInputs));
  }

  protected addInputConnectionPoints() {
    const position = elementPositions.adaptParticle(this.id)[0];
    adaptEffect(() => {
      Orchestrator.actions.clearInputConnectionPoints({ id: this.id });
      const gateType = elementTypes.adaptParticle(this.id)[0]();
      const isNoOfInputsOdd = () => this.noOfInputs() % 2 !== 0;
      if (gateType === "not") {
        this.inputTerminalsOrigin_Y = 0;
        addInputConnectionPoint(this, 1);
      } else if (isNoOfInputsOdd()) {
        this.inputTerminalsOrigin_Y =
          -5 * this.noOfInputs() + 2.5 * inputTerminalDimensions.terminalGap;
        this.inputTerminalsEnd_Y =
          this.inputTerminalsOrigin_Y +
          (this.noOfInputs() - 1) * inputTerminalDimensions.terminalGap;
        for (let i = 0; i < this.noOfInputs(); i++) {
          addInputConnectionPoint(this, i);
        }
      } else {
        this.inputTerminalsOrigin_Y =
          -5 * this.noOfInputs() + 2 * inputTerminalDimensions.terminalGap;
        this.inputTerminalsEnd_Y =
          this.inputTerminalsOrigin_Y +
          this.noOfInputs() * inputTerminalDimensions.terminalGap;
        for (let i = 0; i < this.noOfInputs() + 1; i++) {
          const isMiddleInput = () => i === this.noOfInputs() / 2;
          // don't add the middle input terminal for an even number of input terminals
          if (!isMiddleInput()) {
            addInputConnectionPoint(this, i);
          }
        }
      }
    }, [position]);
  }

  protected addOutputConnectionPoint() {
    const position = elementPositions.adaptParticle(this.id)[0];
    adaptEffect(() => {
      Orchestrator.actions.clearOutputConnectionPoints({ id: this.id });
      const localConnectionPoint = this.getOutputTerminalLocalConnectionPoint();
      addOutputConnectionPoint(this, localConnectionPoint);
    }, [position]);
  }

  protected buildGateBody() {
    buildGateBody(this, this.gateBody);
  }

  protected buildGateInputTerminals() {
    adaptEffect(() => {
      this.inputTerminals.clear();
      this.inputTerminals.beginFill(stroke["primary-dark"]);
      const connectionPoints = inputConnectionPoints.adaptParticle(
        this.id
      )[0]();
      for (let i = 0; i < connectionPoints.length; i++) {
        const localConnectionPoint = this.toLocal(connectionPoints[i]);
        this.inputTerminals.drawCircle(
          localConnectionPoint.x,
          localConnectionPoint.y,
          inputTerminalDimensions.terminalRadius
        );
      }
      if (this.inputTerminalsOrigin_Y !== this.inputTerminalsEnd_Y) {
        this.inputTerminals
          .lineStyle({
            width: inputTerminalDimensions.strokeWidth,
            color: stroke["primary-dark"],
          })
          .moveTo(inputTerminalDimensions.origin_X, this.inputTerminalsOrigin_Y)
          .lineTo(inputTerminalDimensions.origin_X, this.inputTerminalsEnd_Y);
      }
      adjustOpacityOnInteract(this, this.inputTerminals);
    });
  }

  protected buildGateOutputTerminal() {
    adaptEffect(() => {
      this.outputTerminal.clear();
      this.outputTerminal.beginFill(stroke["primary-dark"]);
      const localConnectionPoint = this.getOutputTerminalLocalConnectionPoint();
      this.outputTerminal.drawCircle(
        localConnectionPoint.x,
        localConnectionPoint.y,
        outputTerminalDimensions.terminalRadius
      );
      adjustOpacityOnInteract(this, this.outputTerminal);
    });
  }

  protected buildGateTerminals() {
    this.buildGateInputTerminals();
    this.buildGateOutputTerminal();
  }

  protected buildSelectionRectangle() {
    adaptEffect(() => {
      this.genericBuildSelectionRectangleFunctionality(
        selectionRectangeDimensions.strokeWidth
      );
      // if the input terminals are lower than the gateBody, then the `selectionRectange` should be at the level of the gateBody instead (this occurs when the `noOfInputs` is less than 6)
      const origin_Y = this.noOfInputs() >= 5 ? this.inputTerminalsOrigin_Y : 0;
      const { width, height } = this.getBounds();
      this.selectionRectangle.drawRect(
        selectionRectangeDimensions.origin_X,
        origin_Y + selectionRectangeDimensions.originDelta_Y,
        width + selectionRectangeDimensions.widthDelta,
        height + selectionRectangeDimensions.heightDelta
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
    } else if (
      outputConnectionPointIsBeingHoveredOver(this, { x: e.x, y: e.y })
    ) {
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
    this.gateBody.destroy();
    this.inputTerminals.destroy();
    this.outputTerminal.destroy();
    this.selectionRectangle.destroy();
    this.destroy();
  }

  protected getOutputTerminalLocalConnectionPoint() {
    const gateType = elementTypes.adaptParticle(this.id)[0]();
    const circle_Y = gateType === "not" ? "midPoint_Y_not" : "midPoint_Y";
    const x =
      gateBodyDimensions.end_X +
      outputTerminalDimensions[`delta_X_${gateType as GateType}`];
    const y = gateBodyDimensions[circle_Y];
    return { x, y };
  }

  init() {
    this.initGateBody();
    this.addInputConnectionPoints();
    this.addOutputConnectionPoint();
    this.initGateTerminals();
    this.genericInitFunctionality();
    Orchestrator.actions.turnOnElementSelection(this.id);
  }

  protected initGateBody() {
    this.buildGateBody();
    this.addChild(this.gateBody);
  }

  protected initGateTerminals() {
    this.buildGateTerminals();
    this.addChild(this.inputTerminals);
    this.addChild(this.outputTerminal);
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
      // TODO: find a better way to achieve this
      // use `setTimeout` to ensure that operation runs only after all new conductors have been spawned from existing `conductorPreviews`
      setTimeout(() => {
        const connectionPoints = inputConnectionPoints.adaptParticle(
          this.id
        )[0]();
        for (let i = 0; i < connectionPoints.length; i++) {
          const connectionPoint = connectionPoints[i];
          const conductorConnectionPointIdOrFalse =
            checkForCollisionWithConductorConnectionPoint(connectionPoint);
          if (conductorConnectionPointIdOrFalse) {
            Orchestrator.actions.addNodeInput({
              elementId: this.id,
              nodeInput: conductorConnectionPointIdOrFalse,
              position: i,
            });
            ipc.emit("action", {
              action: "addNodeInput",
              options: {
                elementId: this.id,
                nodeInput: conductorConnectionPointIdOrFalse,
                position: i,
              },
            });
          }
        }
      });
      setTimeout(() => {
        const connectionPoints = outputConnectionPoints.adaptParticle(
          this.id
        )[0]();
        const connectionPoint = connectionPoints[0];
        const conductorConnectionPointIdOrFalse =
          checkForCollisionWithConductorConnectionPoint(connectionPoint);
        if (conductorConnectionPointIdOrFalse) {
          Orchestrator.actions.addNodeInput({
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
      });
    }
  };
}
