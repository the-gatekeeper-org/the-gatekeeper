import {
  conductorConnectionPoints,
  conductorPreviewData,
} from "@/entities/visualizationEntities";
import { Graphics } from "pixi.js";
import {
  conductorBodyDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { bg, stroke } from "@/colors";
import { adaptEffect } from "promethium-js";
import {
  directionHasRestarted,
  getConductorLengthFromConnectionPoints,
  getConductorOrientationFromConnectionPoints,
  getConductorDirectionFromConnectionPoints,
} from "./utils";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import Orchestrator from "@/entities/Orchestrator";
import { ca } from "@/utils";

export type ConductorOrientation = "h" | "v";

export type ConductorOptions = CircuitElementOptions;

export class Conductor extends CircuitElement {
  conductorBody = new Graphics();
  static conductorPreview = new Graphics();
  static conductorPreviewPrimaryOrientation: ConductorOrientation = "h";

  constructor(options: ConductorOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
  }

  static buildConductorPreview() {
    adaptEffect(() => {
      Conductor.conductorPreview.clear();
      const isBeingDrawn =
        conductorPreviewData.adaptParticle("isBeingDrawn")[0]();
      if (isBeingDrawn) {
        const coordinates =
          conductorPreviewData.adaptParticle("coordinates")[0]();
        if (
          coordinates.starting &&
          coordinates.current &&
          coordinates.previous
        ) {
          const resetPrimaryOrientation =
            directionHasRestarted(coordinates, "x") ||
            directionHasRestarted(coordinates, "y");
          if (resetPrimaryOrientation) {
            const newPrimaryOrientation =
              Math.abs(coordinates.current.x - coordinates.starting.x) >=
              Math.abs(coordinates.current.y - coordinates.starting.y)
                ? "h"
                : "v";
            Conductor.conductorPreviewPrimaryOrientation =
              newPrimaryOrientation;
          }
          Conductor.conductorPreview
            .lineStyle({
              width: conductorBodyDimensions.strokeWidth,
              color: stroke["primary-dark"],
            })
            .moveTo(coordinates.starting.x, coordinates.starting.y);
          if (Conductor.conductorPreviewPrimaryOrientation === "h") {
            Conductor.conductorPreview
              .lineTo(coordinates.current.x, coordinates.starting.y)
              .lineTo(coordinates.current.x, coordinates.current.y);
          } else {
            Conductor.conductorPreview
              .lineTo(coordinates.starting.x, coordinates.current.y)
              .lineTo(coordinates.current.x, coordinates.current.y);
          }
        }
      }
    });
  }

  protected buildConductorBody() {
    const connectionPoints = conductorConnectionPoints.adaptParticle(
      this.id
    )[0]();
    if (connectionPoints[0] && connectionPoints[1]) {
      this.x = connectionPoints[0].x;
      this.y = connectionPoints[0].y;
      const delta_X = connectionPoints[1].x - connectionPoints[0].x;
      const delta_Y = connectionPoints[1].y - connectionPoints[0].y;
      this.conductorBody
        .lineStyle({
          width: conductorBodyDimensions.strokeWidth,
          color: stroke["primary-dark"],
        })
        .moveTo(
          conductorBodyDimensions.origin_X,
          conductorBodyDimensions.origin_Y
        )
        .lineTo(
          conductorBodyDimensions.origin_Y + delta_X,
          conductorBodyDimensions.origin_Y + delta_Y
        );
    }
  }

  protected buildSelectionRectangle() {
    adaptEffect(() => {
      this.genericBuildSelectionRectangleFunctionality(
        selectionRectangeDimensions.strokeWidth
      );
      const connectionPoints = conductorConnectionPoints.adaptParticle(
        this.id
      )[0]();
      const orientation =
        getConductorOrientationFromConnectionPoints(connectionPoints);
      const length = getConductorLengthFromConnectionPoints(connectionPoints);
      const direction =
        getConductorDirectionFromConnectionPoints(connectionPoints);
      let origin_X: number;
      let origin_Y: number;
      let width: number;
      let height: number;
      ca(
        {
          condition: orientation === "h",
          action() {
            width = length + selectionRectangeDimensions.lengthDelta;
            height = selectionRectangeDimensions.breadth;
            ca(
              {
                condition: direction === 1,
                action() {
                  origin_X = selectionRectangeDimensions.origin_X;
                  origin_Y = selectionRectangeDimensions.origin_Y;
                },
              },
              () => {
                origin_X = selectionRectangeDimensions.origin_X - length;
                origin_Y = selectionRectangeDimensions.origin_Y;
              }
            );
          },
        },
        () => {
          width = selectionRectangeDimensions.breadth;
          height = length + selectionRectangeDimensions.lengthDelta;
          ca(
            {
              condition: direction === 1,
              action() {
                origin_X = selectionRectangeDimensions.origin_X;
                origin_Y = selectionRectangeDimensions.origin_Y;
              },
            },
            () => {
              origin_X = selectionRectangeDimensions.origin_Y;
              origin_Y = selectionRectangeDimensions.origin_X - length;
            }
          );
        }
      );
      this.selectionRectangle
        .beginFill(bg["primary-dark"], 0.01)
        .drawRect(origin_X!, origin_Y!, width!, height!);
    });
  }

  detonate() {
    this.conductorBody.destroy();
    this.destroy();
  }

  init() {
    this.initConductorBody();
    this.initSelectionRectangle();
  }

  protected initConductorBody() {
    this.buildConductorBody();
    this.addChild(this.conductorBody);
  }

  protected initSelectionRectangle() {
    this.genericInitSelectionRectangleFunctionality();
    this.selectionRectangle.on("pointermove", (e) => this.onPointerMove(e));
  }

  protected onPointerDown() {
    this.dragStart();
    Orchestrator.actions.turnOffAllElementSelections(this.id);
    Orchestrator.actions.toggleElementSelection(this.id);
  }

  protected onPointerMove(e: PointerEvent) {
    // will do something here soon!!!
    e;
  }

  protected onPointerUp() {
    this.dragEnd();
    if (this.isBeingDragged()) {
      this.isBeingDragged(false);
      Orchestrator.actions.turnOnElementSelection(this.id);
    }
  }
}
