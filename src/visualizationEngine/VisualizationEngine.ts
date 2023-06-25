import { Container, Graphics, Renderer, Ticker } from "pixi.js";
import Gate from "./gate/Gate";
import { GateOptions } from "./gate/Gate";

type VisualizationEngineComponents = {
  renderer: Renderer;
  stage: Container;
  ticker: Ticker;
};

export default class VisualizationEngine {
  renderer: Renderer = new Renderer();
  stage: Container = new Container();
  ticker: Ticker = new Ticker();
  dragTarget?: Gate | null; // for tracking the current `DisplayObject` being dragged
  dragOrigin: { x: number; y: number } = { x: 0, y: 0 }; // for tracking the beginning position of the mouse pointer when dragging
  dragTargetOrigin: { x: number; y: number } = { x: 0, y: 0 }; // for tracking the beginning position of the `dragTarget` when dragging

  init() {
    Graphics.curves.maxLength = 4;

    const resize = () => {
      const canvas = this.renderer.view as HTMLCanvasElement;
      const _w = canvas.offsetWidth;
      const _h = canvas.offsetHeight;
      this.renderer.resize(_w, _h);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => this.onDragMove(e));
    window.addEventListener("pointerdown", (e) => this.onPointerDown(e));

    this.addGate({
      x: 200,
      y: 200,
      gate: "xnor",
      noOfInputs: 2,
    });

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

  addGate(options: Omit<GateOptions, "visualizationEngine">) {
    const gate = new Gate({ visualizationEngine: this, ...options });
    gate.init();
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
