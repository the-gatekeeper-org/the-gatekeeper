import {
  conductorConnectionPoints,
  conductorPreviewData,
} from "@/entities/visualizationEntities";
import { Graphics } from "pixi.js";
import {
  conductorBodyDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { stroke } from "@/colors";
import { adaptEffect } from "promethium-js";
import {
  directionHasRestarted,
  getConductorLengthFromConnectionPoints,
  getConductorOrientationFromConnectionPoints,
  getConductorDirectionFromConnectionPoints,
} from "./utils";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import { ca } from "@/utils";
import { adjustOpacityOnInteract } from "../utils";

export type ConductorOrientation = "h" | "v";

export type ConductorOptions = CircuitElementOptions;

export class Conductor extends CircuitElement {
  conductorBody = new Graphics();
  static conductorPreview = new Graphics();
  static conductorPreviewPrimaryOrientation: ConductorOrientation = "h";

  constructor(options: ConductorOptions) {
    const { visualizationEngine, x, y, id } = options;
    super({ visualizationEngine, x, y, id });
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
    adaptEffect(() => {
      this.conductorBody.clear();
      const connectionPoints = conductorConnectionPoints.adaptParticle(
        this.id
      )[0]();
      if (connectionPoints[0] && connectionPoints[1]) {
        const origin = connectionPoints[0];
        const end = connectionPoints[1];
        this.conductorBody
          .lineStyle({
            width: conductorBodyDimensions.strokeWidth,
            color: stroke["primary-dark"],
          })
          .moveTo(origin.x, origin.y)
          .lineTo(end.x, end.y);
      }
      adjustOpacityOnInteract(this, this.conductorBody);
    });
  }

  protected buildSelectionRectangle() {
    adaptEffect(() => {
      this.genericBuildSelectionRectangleFunctionality(
        selectionRectangeDimensions.strokeWidth
      );
      const connectionPoints = conductorConnectionPoints.adaptParticle(
        this.id
      )[0]();
      if (connectionPoints[0] && connectionPoints[1]) {
        const orientation =
          getConductorOrientationFromConnectionPoints(connectionPoints);
        const length = getConductorLengthFromConnectionPoints(connectionPoints);
        const direction =
          getConductorDirectionFromConnectionPoints(connectionPoints);
        let origin_X: number;
        let origin_Y: number;
        ca(
          {
            condition: orientation === "h",
            action() {
              ca(
                {
                  condition: direction === 1,
                  action() {
                    origin_X = selectionRectangeDimensions.origin_X;
                    origin_Y =
                      selectionRectangeDimensions.origin_Y -
                      selectionRectangeDimensions.originFixDelta;
                  },
                },
                () => {
                  origin_X = selectionRectangeDimensions.origin_X - length;
                  origin_Y =
                    selectionRectangeDimensions.origin_Y -
                    selectionRectangeDimensions.originFixDelta;
                }
              );
            },
          },
          () => {
            ca(
              {
                condition: direction === 1,
                action() {
                  origin_X =
                    selectionRectangeDimensions.origin_X -
                    selectionRectangeDimensions.originFixDelta;
                  origin_Y = selectionRectangeDimensions.origin_Y;
                },
              },
              () => {
                origin_X =
                  selectionRectangeDimensions.origin_X -
                  selectionRectangeDimensions.originFixDelta;
                origin_Y = selectionRectangeDimensions.origin_Y - length;
              }
            );
          }
        );
        const { width, height } = this.getBounds();
        this.selectionRectangle.drawRect(
          origin_X!,
          origin_Y!,
          width + selectionRectangeDimensions.widthDelta,
          height + selectionRectangeDimensions.heightDelta
        );
      }
    });
  }

  detonate() {
    this.conductorBody.destroy();
    this.destroy();
  }

  init() {
    this.initConductorBody();
    this.genericInitFunctionality();
  }

  protected initConductorBody() {
    this.buildConductorBody();
    this.addChild(this.conductorBody);
  }

  protected onPointerDown() {
    this.genericOnPointerDownFunctionality();
  }

  protected onPointerUp() {
    this.genericOnPointerUpFunctionality();
  }
}
