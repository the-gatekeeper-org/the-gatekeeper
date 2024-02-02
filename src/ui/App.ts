import { adaptEffect, h } from "promethium-js";
import { html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import Toolbar from "./Toolbar";
import { visualizationEngine } from "@/engines/visualization/VisualizationEngine";

function App() {
  const canvasRef = createRef();

  adaptEffect(() => {
    visualizationEngine.init(canvasRef.value as HTMLCanvasElement);
  }, []);

  return () => html`
    <div class="w-full h-full bg-primary-dark text-primary-dark relative">
      ${h(Toolbar)}
      <canvas
        ${ref(canvasRef)}
        id="canvas"
        class="h-full w-full bg-primary-dark"
      ></canvas>
    </div>
  `;
}

export default App;
