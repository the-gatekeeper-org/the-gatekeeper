import { adaptEffect, createRef, h, html, ref } from "promethium-js";
import Toolbar from "./Toolbar";
import { Container, Renderer } from "pixi.js";
import VisualizationEngine from "@/visualizationEngine/VisualizationEngine";
import { bg } from "@/colors";

export const visualizationEngine = new VisualizationEngine();

interface GlobalThis {
  __PIXI_STAGE__: Container;
  __PIXI_RENDERER__: Renderer;
}

const App = () => {
  const canvasRef = createRef();

  adaptEffect(() => {
    const canvas = canvasRef.value as HTMLCanvasElement;
    const renderer = new Renderer({
      view: canvas,
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
      antialias: true,
      resolution: 1,
      backgroundColor: bg[10],
    });

    const stage = new Container();

    // for debugging purposes
    if (import.meta.env.DEV) {
      (globalThis as unknown as GlobalThis).__PIXI_STAGE__ = stage;
      (globalThis as unknown as GlobalThis).__PIXI_RENDERER__ = renderer;
    }

    visualizationEngine.setComponent("renderer", renderer);
    visualizationEngine.setComponent("stage", stage);
    visualizationEngine.init();
  }, []);

  return () => html`
    <div class="w-full h-full bg-10 text-10 relative">
      ${h(Toolbar)}
      <canvas
        ${ref(canvasRef)}
        id="canvas"
        class="h-full w-full bg-10"
      ></canvas>
    </div>
  `;
};

export default App;
