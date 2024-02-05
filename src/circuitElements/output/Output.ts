import { Graphics, Text } from "pixi.js";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import { adaptSyncEffect } from "promethium-js";
import {
  inputTerminalDimensions,
  outputBodyDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { stroke } from "@/ui/colors";
import {
  addInputConnectionPoint,
  adjustOpacityOnInteract,
  checkForCollisionWithConductorConnectionPoint,
  inputConnectionPointIsBeingHoveredOver,
} from "../utils";
import { round } from "@/engines/visualization/utils";
import {
  $inputConnectionPointsCollection,
  _circuitElementConnectionPointsActions,
} from "@/stateEntities/circuitElementConnectionPoints";
import { $circuitElementPositions } from "@/stateEntities/generalCircuitElementData";
import { $derivedAppState } from "@/stateEntities/generalAppState";
import {
  NodeBitValue,
  _simulationDataActions,
} from "@/stateEntities/simulationData";
import { simulationEngine } from "@/engines/simulation/SimulationEngine";

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
    const { visualizationEngine, id } = options;
    super({ visualizationEngine, id });
  }

  protected addInputConnectionPoint() {
    const position = $circuitElementPositions.adaptParticle(this.id)![0];
    adaptSyncEffect(() => {
      _circuitElementConnectionPointsActions.dispatch(
        "clearInputConnectionPoints",
        {
          id: this.id,
        },
      );
      addInputConnectionPoint(this, {
        x: inputTerminalDimensions.center_X,
        y: inputTerminalDimensions.center_Y,
      });
    }, [position]);
  }

  protected buildInputTerminal() {
    adaptSyncEffect(() => {
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
    adaptSyncEffect(() => {
      this.outputBody.clear();
      const nodeOutput = simulationEngine.getActualOutputOfOutput(this.id);
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
    adaptSyncEffect(() => {
      const nodeOutput = simulationEngine.getActualOutputOfOutput(this.id);
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
    adaptSyncEffect(() => {
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

  specificDetonateFunctionality() {
    this.outputBody.destroy();
    this.inputTerminal.destroy();
  }

  specificInitFunctionality() {
    this.initOutputBody();
    this.addInputConnectionPoint();
    this.initInputTerminal();
    this.initOutputText();
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
    const mode = $derivedAppState.adaptDerivativeValue("mode");
    if (mode === "select") {
      this.genericOnPointerDownFunctionality();
    }
  };

  protected onPointerMove = (e: PointerEvent) => {
    const mode = $derivedAppState.adaptDerivativeValue("mode");
    if (mode === "select") {
      this.genericOnPointerMoveFunctionality(e);
    }
  };

  protected onPointerUp = () => {
    const mode = $derivedAppState.adaptDerivativeValue("mode");
    if (mode === "select") {
      this.genericOnPointerUpFunctionality();
      const connectionPoints = $inputConnectionPointsCollection.adaptParticle(
        this.id,
      )![0]();
      for (let i = 0; i < connectionPoints.length; i++) {
        const connectionPoint = connectionPoints[i];
        const conductorConnectionPointIdOrFalse =
          checkForCollisionWithConductorConnectionPoint(connectionPoint);
        if (conductorConnectionPointIdOrFalse) {
          _simulationDataActions.dispatch("addNodeInput", {
            elementId: this.id,
            nodeInput: conductorConnectionPointIdOrFalse,
          });
        }
      }
    }
  };
}
