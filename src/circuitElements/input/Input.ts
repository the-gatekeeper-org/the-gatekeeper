import {
  $nodeOutputsCollection,
  _simulationDataActions,
  NodeBitValue,
} from "@/stateEntities/simulationData";
import { Graphics, Text } from "pixi.js";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import {
  inputBodyDimensions,
  outputTerminalDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { stroke } from "@/ui/colors";
import { adaptSyncEffect } from "promethium-js";
import {
  addOutputConnectionPoint,
  adjustOpacityOnInteract,
  checkForCollisionWithConductorConnectionPoint,
  outputConnectionPointIsBeingHoveredOver,
} from "../utils";
import { round } from "@/engines/visualization/utils";
import {
  _circuitElementConnectionPointsActions,
  $outputConnectionPointsCollection,
} from "@/stateEntities/circuitElementConnectionPoints";
import { $circuitElementPositions } from "@/stateEntities/generalCircuitElementData";
import { $derivedAppState } from "@/stateEntities/generalAppState";

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
    const { visualizationEngine, id } = options;
    super({ visualizationEngine, id });
  }

  protected addOutputConnectionPoint() {
    const position = $circuitElementPositions.adaptParticle(this.id)![0];
    adaptSyncEffect(() => {
      _circuitElementConnectionPointsActions.dispatch(
        "clearOutputConnectionPoints",
        {
          id: this.id,
        },
      );
      addOutputConnectionPoint(this, {
        x: outputTerminalDimensions.center_X,
        y: outputTerminalDimensions.center_Y,
      });
    }, [position]);
  }

  protected buildInputBody() {
    adaptSyncEffect(() => {
      this.inputBody.clear();
      const nodeOutput = $nodeOutputsCollection.adaptDerivative(this.id)!();
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
    adaptSyncEffect(() => {
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
    adaptSyncEffect(() => {
      const nodeOutput = $nodeOutputsCollection.adaptDerivativeValue(this.id)!;
      this.outputText.text = (nodeOutput as NodeBitValue).toString();
      this.outputText.x = 3;
      this.outputText.y = 2;
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

  specificInitFunctionality() {
    this.initInputBody();
    this.addOutputConnectionPoint();
    this.initOutputTerminal();
    this.initOutputText();
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
    const clickMode = $derivedAppState.adaptDerivativeValue("clickMode");
    if (clickMode === "select") {
      this.genericOnPointerDownFunctionality();
    } else if (clickMode === "simulate") {
      _simulationDataActions.dispatch("toggleInputValue", this.id);
    }
  };

  protected onPointerMove = (e: PointerEvent) => {
    const clickMode = $derivedAppState.adaptDerivativeValue("clickMode");
    if (clickMode === "select") {
      this.genericOnPointerMoveFunctionality(e);
    }
  };

  protected onPointerUp = () => {
    const clickMode = $derivedAppState.adaptDerivativeValue("clickMode");
    if (clickMode === "select") {
      this.genericOnPointerUpFunctionality();
      const connectionPoints = $outputConnectionPointsCollection.adaptParticle(
        this.id,
      )![0]();
      for (let i = 0; i < connectionPoints.length; i++) {
        const connectionPoint = connectionPoints[i];
        const conductorConnectionPointIdOrFalse =
          checkForCollisionWithConductorConnectionPoint(connectionPoint);
        if (conductorConnectionPointIdOrFalse) {
          _simulationDataActions.dispatch("addNodeInput", {
            elementId: conductorConnectionPointIdOrFalse,
            nodeInput: this.id,
          });
        }
      }
    }
  };
}
