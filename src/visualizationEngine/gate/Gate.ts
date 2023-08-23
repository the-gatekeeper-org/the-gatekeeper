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
import { addInputConnectionPoint, addOutputConnectionPoint } from "./utils";
import { adjustOpacityOnInteract } from "../utils";
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
    buildGateBody(this, this.gateBody);
  }

  protected buildGateInputTerminals() {
    adaptEffect(() => {
      const gateType = elementTypes.adaptParticle(this.id)[0]();
      this.inputTerminals.beginFill(stroke["primary-dark"]);
      let end_Y: number;
      const isNoOfInputsOdd = () => this.noOfInputs() % 2 !== 0;
      if (gateType === "not") {
        this.inputTerminals.y = 0;
        this.inputTerminals.drawCircle(
          inputTerminalDimensions.origin_X,
          inputTerminalDimensions.origin_Y +
            inputTerminalDimensions.terminalGap,
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
      adjustOpacityOnInteract(this, this.inputTerminals);
    });
  }

  protected buildGateOutputTerminals() {
    adaptEffect(() => {
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
      adjustOpacityOnInteract(this, this.outputTerminal);
    });
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
      const origin_Y = this.noOfInputs() >= 4 ? this.inputTerminals.y : 0; // if the input terminals are lower than the gateBody, then the `selectionRectange` should be at the level of the gateBody instead (this occurs when the `noOfInputs` is less than 6)
      const { width, height } = this.getBounds();
      this.selectionRectangle.drawRect(
        selectionRectangeDimensions.origin_X,
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
    this.genericInitFunctionality();
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

  protected onPointerDown() {
    this.genericOnPointerDownFunctionality();
  }

  protected onPointerUp() {
    this.genericOnPointerUpFunctionality();
  }
}
