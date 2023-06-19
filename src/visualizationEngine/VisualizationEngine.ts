import { Container, Renderer, Ticker } from "pixi.js";
import Gate from "./Gate";
import { visualizationEngine } from "@/App";

interface VisualizationEngineComponents {
  renderer: Renderer;
  stage: Container;
  ticker: Ticker;
}

export default class VisualizationEngine {
  renderer: Renderer = new Renderer();
  stage: Container = new Container();
  ticker: Ticker = new Ticker();
  dragTarget?: Gate | null; // for tracking the current `DisplayObject` being dragged
  dragOrigin: { x: number; y: number } = { x: 0, y: 0 }; // for tracking the beginning position of the mouse pointer when dragging
  dragTargetOrigin: { x: number; y: number } = { x: 0, y: 0 }; // for tracking the beginning position of the `dragTarget` when dragging

  init() {
    const resize = () => {
      const canvas = this.renderer.view as HTMLCanvasElement;
      const _w = canvas.offsetWidth;
      const _h = canvas.offsetHeight;
      this.renderer.resize(_w, _h);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => this.onDragMove(e));
    window.addEventListener("pointerdown", (e) => this.onPointerDown(e));

    new Gate(visualizationEngine, 200, 200).init();

    this.ticker.add(() => {
      this.renderer.render(this.stage);
    });
    this.ticker.start();
  }

  setComponent<T extends keyof VisualizationEngineComponents>(
    componentName: T,
    component: VisualizationEngineComponents[T]
  ) {
    (this as VisualizationEngineComponents)[componentName] = component;
  }

  onDragMove(e: PointerEvent) {
    if (this.dragTarget && this.dragTarget.isBeingDragged()) {
      this.dragTarget.overridingSelect(true);
      this.dragTarget.x =
        this.dragTargetOrigin.x + (e.screenX - this.dragOrigin.x);
      this.dragTarget.y =
        this.dragTargetOrigin.y + (e.screenY - this.dragOrigin.y);
    }
  }

  onPointerDown(e: PointerEvent) {
    this.dragOrigin = {
      x: e.screenX,
      y: e.screenY,
    };
    this.dragTargetOrigin = {
      x: this.dragTarget?.x || 0,
      y: this.dragTarget?.y || 0,
    };
  }
}
