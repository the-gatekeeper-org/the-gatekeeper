import { Graphics, Container } from "pixi.js";
import VisualizationEngine from "../VisualizationEngine";
import { bg, border, stroke } from "@/colors";
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
import { ElementId } from "@/entities/utils";
import Orchestrator from "@/entities/Orchestrator";
import { elementSelections } from "@/entities/visualizationEntities";
import { elementTypes } from "@/entities/sharedEntities";

export type GateTypes = ["and", "or", "not", "nand", "nor", "xor", "xnor"];

export type GateOptions = {
  visualizationEngine: VisualizationEngine;
  x: number;
  y: number;
  gateType: GateTypes[number];
  noOfInputs?: number;
  id: ElementId;
};

// TODO: Protect instance variables as with instance methods
export default class Gate extends Container {
  dragStarted = unify(adaptState(false));
  isBeingDragged = unify(adaptState(false));
  gateBody = new Graphics();
  selectionRectange = new Graphics();
  inputTerminals = new Graphics();
  outputTerminal = new Graphics();
  visualizationEngine: VisualizationEngine;
  noOfInputs: UnifiedState<NonNullable<GateOptions["noOfInputs"]>>;
  id: ElementId;

  constructor(options: GateOptions) {
    super();
    this.visualizationEngine = options.visualizationEngine;
    this.x = options.x;
    this.y = options.y;
    this.id = options.id;
    let defaultNoOfInputs = options.gateType === "not" ? 1 : 2;
    let noOfInputs: number;
    if (options.gateType === "not" || options.noOfInputs === undefined) {
      noOfInputs = defaultNoOfInputs;
    } else {
      noOfInputs = options.noOfInputs;
    }
    this.noOfInputs = unify(adaptState(noOfInputs));
  }

  private buildGateBody() {
    buildGateBody(this);
  }

  private buildGateInputTerminals() {
    const gateType = elementTypes.adaptParticle(this.id)[0];
    this.inputTerminals.x = inputTerminalDimensions.displacement_X;
    this.inputTerminals.beginFill(stroke["primary-dark"]);
    let end_Y: number;
    const isNoOfInputsOdd = () => this.noOfInputs() % 2 !== 0;
    if (gateType() === "not") {
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
    if (gateType() !== "not") {
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

  private buildGateOutputTerminals() {
    const gateType = elementTypes.adaptParticle(this.id)[0];
    this.outputTerminal.beginFill(stroke["primary-dark"]);
    const circle_Y = gateType() === "not" ? "midPoint_Y_not" : "midPoint_Y";
    const x =
      gateBodyDimensions.end_X +
      outputTerminalDimensions[`delta_X_${gateType() as GateTypes[number]}`];
    const y = gateBodyDimensions[circle_Y];
    this.outputTerminal.drawCircle(
      x,
      y,
      outputTerminalDimensions.terminalRadius
    );
    addOutputConnectionPoint({ gate: this, x, y });
    adaptEffect(() => adjustOpacityOnInteract(this, "outputTerminal"));
  }

  private buildGateTerminals() {
    this.buildGateInputTerminals();
    this.buildGateOutputTerminals();
  }

  private buildSelectionRectangle() {
    adaptEffect(() => {
      this.selectionRectange.clear();
      if (!this.isBeingDragged()) {
        const isSelected = elementSelections.adaptParticle(this.id)[0];
        if (isSelected()) {
          this.selectionRectange.lineStyle({
            width: selectionRectangeDimensions.strokeWidth,
            color: border["secondary-dark"],
            alignment: 1,
          });
        }
      }
      const Y = this.noOfInputs() >= 4 ? this.inputTerminals.y : 1; // if the input terminals are lower than the gateBody, then the `selectionRectange` should be at the level of the gateBody instead (this occurs when the `noOfInputs` is less than 6)
      const { width, height } = this.getBounds();
      this.selectionRectange
        .beginFill(bg["primary-dark"], 0.01)
        .drawRect(
          this.inputTerminals.x - selectionRectangeDimensions.originDelta_X,
          Y - selectionRectangeDimensions.originDelta_Y,
          width + selectionRectangeDimensions.widthDelta,
          height + selectionRectangeDimensions.heightDelta
        );
    });
  }

  private dragStart() {
    this.dragStarted(true);
    this.visualizationEngine.dragTarget = this;
  }

  private dragEnd() {
    this.dragStarted(false);
    this.visualizationEngine.dragTarget = null;
  }

  init() {
    this.initGateBody();
    this.initGateTerminals();
    this.initSelectionRectange();
    this.cullable = true;
    Orchestrator.actions.turnOffAllElementSelections();
    Orchestrator.actions.turnOnElementSelection(this.id);
  }

  private initGateBody() {
    this.buildGateBody();
    this.addChild(this.gateBody);
  }

  private initSelectionRectange() {
    this.buildSelectionRectangle();
    this.selectionRectange
      .on("pointerdown", () => this.onPointerDown())
      .on("pointerup", () => this.onPointerUp())
      .on("pointerupoutside", () => this.onPointerUp());
    this.selectionRectange.eventMode = "static";
    this.selectionRectange.cursor = "pointer";
    this.addChild(this.selectionRectange);
  }

  private initGateTerminals() {
    this.buildGateTerminals();
    this.addChild(this.inputTerminals);
    this.addChild(this.outputTerminal);
  }

  detonate() {
    this.gateBody.destroy();
    this.inputTerminals.destroy();
    this.outputTerminal.destroy();
    this.selectionRectange.destroy();
    this.destroy();
  }

  private onPointerDown() {
    this.dragStart();
    Orchestrator.actions.turnOffAllElementSelections(this.id);
    Orchestrator.actions.toggleElementSelection(this.id);
  }

  private onPointerUp() {
    this.dragEnd();
    if (this.isBeingDragged()) {
      this.isBeingDragged(false);
      Orchestrator.actions.turnOnElementSelection(this.id);
    }
  }
}
