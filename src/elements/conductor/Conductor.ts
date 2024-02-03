import {
  _generalElementData,
  _elementPositions,
} from "@/stateEntities/generalElementData";
import {
  _conductorConnectionPointsCollection,
  _elementConnectionPointsActions,
} from "@/stateEntities/elementConnectionPoints";
import { Graphics, IPointData } from "pixi.js";
import {
  conductorBodyDimensions,
  selectionRectangeDimensions,
} from "./dimensions";
import { stroke } from "@/ui/colors";
import { adaptEffect, adaptSyncEffect } from "promethium-js";
import {
  directionHasRestarted,
  getConductorLengthFromConnectionPoints,
  getConductorOrientationFromConnectionPoints,
  getConductorDirectionFromConnectionPoints,
  addConductorConnectionPoints,
} from "./utils";
import { CircuitElement, CircuitElementOptions } from "../CircuitElement";
import { ca } from "@/utils";
import {
  adjustOpacityOnInteract,
  conductorConnectionPointIsBeingHoveredOver,
} from "../utils";
import { round } from "@/engines/visualization/utils";
import { _derivedAppState } from "@/stateEntities/generalAppState";
import { _simulationDataActions } from "@/stateEntities/simulationData";

export type ConductorOrientation = "h" | "v";

export type ConductorOptions = CircuitElementOptions;

export class Conductor extends CircuitElement {
  conductorBody = new Graphics();
  conductorEndLocalConnectionPoint: IPointData | null = null;
  static conductorPreview = new Graphics();
  static conductorPreviewPrimaryOrientation: ConductorOrientation = "h";

  constructor(options: ConductorOptions) {
    const { visualizationEngine, id } = options;
    super({ visualizationEngine, id });
  }

  static buildConductorPreview() {
    adaptEffect(() => {
      Conductor.conductorPreview.clear();
      const conductorPreviewData = _generalElementData.adaptParticleValue(
        "conductorPreviewData",
      );
      if (conductorPreviewData.isBeingDrawn) {
        const coordinates = conductorPreviewData.coordinates;
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

  protected addConductorConnectionPoints() {
    const position = _elementPositions.adaptParticle(this.id)![0];
    adaptEffect(() => {
      _elementConnectionPointsActions.dispatch(
        "clearConductorConnectionPoints",
        { id: this.id },
      );
      addConductorConnectionPoints(this);
    }, [position]);
  }

  protected setConductorEndGlobalConnectionPoint() {
    adaptEffect(() => {
      const connectionPoints =
        _conductorConnectionPointsCollection.adaptParticle(this.id)![0]();
      this.conductorEndLocalConnectionPoint = this.toLocal(connectionPoints[1]);
    });
  }

  protected buildConductorBody() {
    adaptEffect(() => {
      this.conductorBody.clear();
      const connectionPoints =
        _conductorConnectionPointsCollection.adaptParticle(this.id)![0]();
      if (connectionPoints[0] && connectionPoints[1]) {
        const origin = this.toLocal(connectionPoints[0]);
        const end = this.toLocal(connectionPoints[1]);
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
        selectionRectangeDimensions.strokeWidth,
      );
      const connectionPoints =
        _conductorConnectionPointsCollection.adaptParticle(this.id)![0]();
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
                },
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
              },
            );
          },
        );
        const { width, height } = this.getBounds();
        this.selectionRectangle.drawRect(
          origin_X!,
          origin_Y!,
          width + selectionRectangeDimensions.widthDelta,
          height + selectionRectangeDimensions.heightDelta,
        );
      }
    });
  }

  protected conditionallyDrawConnectionPointCircle(e: PointerEvent) {
    if (conductorConnectionPointIsBeingHoveredOver(this, { x: e.x, y: e.y })) {
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
    this.conductorBody.destroy();
    this.genericDetonateFunctionality();
  }

  init() {
    return adaptSyncEffect(() => {
      this.setConductorEndGlobalConnectionPoint();
      this.addConductorConnectionPoints();
      this.initConductorBody();
      this.genericInitFunctionality();
    }, []);
  }

  protected initConductorBody() {
    this.buildConductorBody();
    this.addChild(this.conductorBody);
  }

  protected onPointerDown = () => {
    const simulatorClickMode =
      _derivedAppState.adaptDerivativeValue("clickMode");
    if (simulatorClickMode === "select") {
      this.genericOnPointerDownFunctionality();
    }
  };

  protected onPointerMove = (e: PointerEvent) => {
    const simulatorClickMode =
      _derivedAppState.adaptDerivativeValue("clickMode");
    if (simulatorClickMode === "select") {
      this.genericOnPointerMoveFunctionality(e);
    }
  };

  protected onPointerUp = () => {
    const simulatorClickMode =
      _derivedAppState.adaptDerivativeValue("clickMode");
    if (simulatorClickMode === "select") {
      this.genericOnPointerUpFunctionality();
    }
  };
}
