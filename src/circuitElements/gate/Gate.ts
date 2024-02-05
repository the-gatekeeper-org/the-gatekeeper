import { Graphics } from "pixi.js";
import { stroke } from "@/ui/colors";
import {
  UnifiedState,
  adaptState,
  adaptSyncEffect,
  unify,
} from "promethium-js";
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
} from "../utils";
import { round } from "@/engines/visualization/utils";
import {
  $circuitElementTypes,
  $circuitElementPositions,
} from "@/stateEntities/generalCircuitElementData";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import {
  _circuitElementConnectionPointsActions,
  $inputConnectionPointsCollection,
  $outputConnectionPointsCollection,
} from "@/stateEntities/circuitElementConnectionPoints";
import { $derivedAppState } from "@/stateEntities/generalAppState";
import { _simulationDataActions } from "@/stateEntities/simulationData";

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
    const { visualizationEngine, id } = options;
    super({ visualizationEngine, id });
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
    const position = $circuitElementPositions.adaptParticle(this.id)![0];
    adaptSyncEffect(() => {
      _circuitElementConnectionPointsActions.dispatch(
        "clearInputConnectionPoints",
        {
          id: this.id,
        },
      );
      const gateType = $circuitElementTypes.adaptParticle(this.id)![0]();
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
    const position = $circuitElementPositions.adaptParticle(this.id)![0];
    adaptSyncEffect(() => {
      _circuitElementConnectionPointsActions.dispatch(
        "clearOutputConnectionPoints",
        {
          id: this.id,
        },
      );
      const localConnectionPoint = this.getOutputTerminalLocalConnectionPoint();
      addOutputConnectionPoint(this, localConnectionPoint);
    }, [position]);
  }

  protected buildGateBody() {
    buildGateBody(this, this.gateBody);
  }

  protected buildGateInputTerminals() {
    adaptSyncEffect(() => {
      this.inputTerminals.clear();
      this.inputTerminals.beginFill(stroke["primary-dark"]);
      const connectionPoints = $inputConnectionPointsCollection.adaptParticle(
        this.id,
      )![0]();
      for (let i = 0; i < connectionPoints.length; i++) {
        const localConnectionPoint = this.toLocal(connectionPoints[i]);
        this.inputTerminals.drawCircle(
          localConnectionPoint.x,
          localConnectionPoint.y,
          inputTerminalDimensions.terminalRadius,
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
    adaptSyncEffect(() => {
      this.outputTerminal.clear();
      this.outputTerminal.beginFill(stroke["primary-dark"]);
      const localConnectionPoint = this.getOutputTerminalLocalConnectionPoint();
      this.outputTerminal.drawCircle(
        localConnectionPoint.x,
        localConnectionPoint.y,
        outputTerminalDimensions.terminalRadius,
      );
      adjustOpacityOnInteract(this, this.outputTerminal);
    });
  }

  protected buildGateTerminals() {
    this.buildGateInputTerminals();
    this.buildGateOutputTerminal();
  }

  protected buildSelectionRectangle() {
    adaptSyncEffect(() => {
      this.genericBuildSelectionRectangleFunctionality(
        selectionRectangeDimensions.strokeWidth,
      );
      // if the input terminals are lower than the gateBody, then the `selectionRectange` should be at the level of the gateBody instead (this occurs when the `noOfInputs` is less than 6)
      const origin_Y = this.noOfInputs() >= 5 ? this.inputTerminalsOrigin_Y : 0;
      const { width, height } = this.getBounds();
      this.selectionRectangle.drawRect(
        selectionRectangeDimensions.origin_X,
        origin_Y + selectionRectangeDimensions.originDelta_Y,
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

  protected getOutputTerminalLocalConnectionPoint() {
    const gateType = $circuitElementTypes.adaptParticle(this.id)![0]();
    const circle_Y = gateType === "not" ? "midPoint_Y_not" : "midPoint_Y";
    const x =
      gateBodyDimensions.end_X +
      outputTerminalDimensions[`delta_X_${gateType as GateType}`];
    const y = gateBodyDimensions[circle_Y];
    return { x, y };
  }

  specificDetonateFunctionality() {
    this.gateBody.destroy();
    this.inputTerminals.destroy();
    this.outputTerminal.destroy();
  }

  specificInitFunctionality() {
    this.initGateBody();
    this.addInputConnectionPoints();
    this.addOutputConnectionPoint();
    this.initGateTerminals();
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
      // TODO: find a better way to achieve this
      // use `setTimeout` to ensure that operation runs only after all new conductors have been spawned from existing `conductorPreviews`
      setTimeout(() => {
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
              position: i,
            });
          }
        }
      });
      setTimeout(() => {
        const connectionPoints =
          $outputConnectionPointsCollection.adaptParticle(this.id)![0]();
        const connectionPoint = connectionPoints[0];
        const conductorConnectionPointIdOrFalse =
          checkForCollisionWithConductorConnectionPoint(connectionPoint);
        if (conductorConnectionPointIdOrFalse) {
          _simulationDataActions.dispatch("addNodeInput", {
            elementId: conductorConnectionPointIdOrFalse,
            nodeInput: this.id,
          });
        }
      });
    }
  };
}
