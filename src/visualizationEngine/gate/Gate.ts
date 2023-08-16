import { Graphics } from "pixi.js";
import { bg, stroke } from "@/colors";
import { UnifiedState, adaptEffect, adaptState, unify } from "promethium-js";
import buildGateBody from "./buildGateBody";
import {
  gateBodyDimensions,
  inputTerminalDimensions,
  outputTerminalDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import {
  addInputConnectionPoint,
  addOutputConnectionPoint,
  adjustOpacityOnInteract,
} from "./utils";
import Orchestrator from "@/entities/Orchestrator";
import { elementTypes } from "@/entities/sharedEntities";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";

export type GateTypes = ["and", "or", "not", "nand", "nor", "xor", "xnor"];

export type GateOptions = CircuitElementOptions & {
  gateType: GateTypes[number];
  noOfInputs?: number;
};

// TODO: Protect instance variables as with instance methods
export class Gate extends CircuitElement {
  gateBody = new Graphics();
  inputTerminals = new Graphics();
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

  protected buildGateBody() {
    buildGateBody(this);
  }

  protected buildGateInputTerminals() {
    const gateType = elementTypes.adaptParticle(this.id)[0]();
    this.inputTerminals.x = inputTerminalDimensions.displacement_X;
    this.inputTerminals.beginFill(stroke["primary-dark"]);
    let end_Y: number;
    const isNoOfInputsOdd = () => this.noOfInputs() % 2 !== 0;
    if (gateType === "not") {
      this.inputTerminals.y = 0;
      this.inputTerminals.drawCircle(
        inputTerminalDimensions.origin_X,
        inputTerminalDimensions.origin_Y + inputTerminalDimensions.terminalGap,
        inputTerminalDimensions.terminalRadius
      );
      addInputConnectionPoint(this, 1);
    } else if (isNoOfInputsOdd()) {
      this.inputTerminals.y =
        -5 * this.noOfInputs() + 2.5 * inputTerminalDimensions.terminalGap;
      end_Y = (this.noOfInputs() - 1) * inputTerminalDimensions.terminalGap;
      for (let i = 0; i < this.noOfInputs(); i++) {
        this.inputTerminals.drawCircle(
          inputTerminalDimensions.origin_X,
          inputTerminalDimensions.origin_Y +
            i * inputTerminalDimensions.terminalGap,
          inputTerminalDimensions.terminalRadius
        );
        addInputConnectionPoint(this, i);
      }
    } else {
      this.inputTerminals.y =
        -5 * this.noOfInputs() + 2 * inputTerminalDimensions.terminalGap;
      end_Y = this.noOfInputs() * inputTerminalDimensions.terminalGap;
      for (let i = 0; i < this.noOfInputs() + 1; i++) {
        const isMiddleInput = () => i === this.noOfInputs() / 2;
        // don't draw the middle input terminal for an even number of input terminals
        if (!isMiddleInput()) {
          this.inputTerminals.drawCircle(
            inputTerminalDimensions.origin_X,
            inputTerminalDimensions.origin_Y +
              i * inputTerminalDimensions.terminalGap,
            inputTerminalDimensions.terminalRadius
          );
          addInputConnectionPoint(this, i);
        }
      }
    }
    if (gateType !== "not") {
      this.inputTerminals
        .lineStyle({
          width: inputTerminalDimensions.strokeWidth,
          color: stroke["primary-dark"],
        })
        .moveTo(
          inputTerminalDimensions.origin_X,
          inputTerminalDimensions.origin_Y
        )
        .lineTo(inputTerminalDimensions.origin_X, end_Y!);
    }
    adaptEffect(() => adjustOpacityOnInteract(this, "inputTerminals"));
  }

  protected buildGateOutputTerminals() {
    this.outputTerminal.beginFill(stroke["primary-dark"]);
    const gateType = elementTypes.adaptParticle(this.id)[0]();
    const circle_Y = gateType === "not" ? "midPoint_Y_not" : "midPoint_Y";
    const x =
      gateBodyDimensions.end_X +
      outputTerminalDimensions[`delta_X_${gateType as GateTypes[number]}`];
    const y = gateBodyDimensions[circle_Y];
    this.outputTerminal.drawCircle(
      x,
      y,
      outputTerminalDimensions.terminalRadius
    );
    addOutputConnectionPoint({ gate: this, x, y });
    adaptEffect(() => adjustOpacityOnInteract(this, "outputTerminal"));
  }

  protected buildGateTerminals() {
    this.buildGateInputTerminals();
    this.buildGateOutputTerminals();
  }

  protected buildSelectionRectangle() {
    adaptEffect(() => {
      this.genericBuildSelectionRectangleFunctionality(
        selectionRectangeDimensions.strokeWidth
      );
      const origin_Y = this.noOfInputs() >= 4 ? this.inputTerminals.y : 1; // if the input terminals are lower than the gateBody, then the `selectionRectange` should be at the level of the gateBody instead (this occurs when the `noOfInputs` is less than 6)
      const { width, height } = this.getBounds();
      this.selectionRectangle
        .beginFill(bg["primary-dark"], 0.01)
        .drawRect(
          this.inputTerminals.x + selectionRectangeDimensions.originDelta_X,
          origin_Y + selectionRectangeDimensions.originDelta_Y,
          width + selectionRectangeDimensions.widthDelta,
          height + selectionRectangeDimensions.heightDelta
        );
    });
  }

  detonate() {
    this.gateBody.destroy();
    this.inputTerminals.destroy();
    this.outputTerminal.destroy();
    this.selectionRectangle.destroy();
    this.destroy();
  }

  init() {
    this.initGateBody();
    this.initGateTerminals();
    this.initSelectionRectangle();
    this.cullable = true;
    Orchestrator.actions.turnOffAllElementSelections();
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

  protected initSelectionRectangle() {
    this.genericInitSelectionRectangleFunctionality();
  }

  protected onPointerDown() {
    this.dragStart();
    Orchestrator.actions.turnOffAllElementSelections(this.id);
    Orchestrator.actions.toggleElementSelection(this.id);
  }

  protected onPointerUp() {
    this.dragEnd();
    if (this.isBeingDragged()) {
      this.isBeingDragged(false);
      Orchestrator.actions.turnOnElementSelection(this.id);
    }
  }
}
