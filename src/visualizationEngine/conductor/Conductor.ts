import VisualizationEngine from "@/visualizationEngine/VisualizationEngine";
import { ElementId } from "@/entities/utils";
import {
  conductorConnectionPoints,
  conductorPreviewData,
} from "@/entities/visualizationEntities";
import { Container, Graphics } from "pixi.js";
import { conductorBodyDimensions } from "./dimensions";
import { stroke } from "@/colors";
import { adaptEffect } from "promethium-js";
import { hasDirectionRestarted } from "./utils";

export type ConductorOrientation = "h" | "v";

export type ConductorOptions = {
  visualizationEngine: VisualizationEngine;
  id: ElementId;
};

export class Conductor extends Container {
  id: ElementId;
  conductorBody = new Graphics();
  static conductorPreview = new Graphics();
  static conductorPreviewPrimaryOrientation: ConductorOrientation = "h";

  constructor(options: ConductorOptions) {
    super();
    this.id = options.id;
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
            hasDirectionRestarted(coordinates, "x") ||
            hasDirectionRestarted(coordinates, "y");
          if (resetPrimaryOrientation) {
            Conductor.conductorPreviewPrimaryOrientation =
              Math.abs(coordinates.current.x - coordinates.starting.x) >=
              Math.abs(coordinates.current.y - coordinates.starting.y)
                ? "h"
                : "v";
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

  private buildConductorBody() {
    const connectionPoints = conductorConnectionPoints.adaptParticle(
      this.id
    )[0]();
    if (connectionPoints[0] && connectionPoints[1])
      this.conductorBody
        .lineStyle({
          width: conductorBodyDimensions.strokeWidth,
          color: stroke["primary-dark"],
        })
        .moveTo(connectionPoints[0].x, connectionPoints[0].y)
        .lineTo(connectionPoints[1].x, connectionPoints[1].y);
  }

  init() {
    this.initConductorBody();
  }

  detonate() {
    this.conductorBody.destroy();
    this.destroy();
  }

  private initConductorBody() {
    this.buildConductorBody();
    this.addChild(this.conductorBody);
  }
}
