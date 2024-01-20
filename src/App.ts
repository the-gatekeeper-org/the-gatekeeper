import { adaptEffect, h } from "promethium-js";
import { html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import Toolbar from "./Toolbar";
import Orchestrator, { visualizationEngine } from "./entities/Orchestrator";
import { ipcInit } from "photon-lib-js";
import { Gate } from "./visualizationEngine/gate/Gate";
import { Input } from "./visualizationEngine/input/Input";
import { Output } from "./visualizationEngine/output/Output";

export const ipc = ipcInit("5172");
function App() {
  const canvasRef = createRef();

  adaptEffect(() => {
    ipc.on("open", () => {
      console.log("We're open!!!");
    });
    ipc.on("action", (payload) => {
      switch (payload.action) {
        case "addGate": {
          const gate = new Gate({ visualizationEngine, ...payload.options });
          const { id, gateType } = payload.options;
          Orchestrator.dispatch("addGate", { id, gate, gateType });
          gate.init();
          visualizationEngine.stage.addChild(gate);
          break;
        }
        case "addInput": {
          const input = new Input({ visualizationEngine, ...payload.options });
          const { id } = payload.options;
          Orchestrator.dispatch("addInput", { id, input });
          input.init();
          visualizationEngine.stage.addChild(input);
          break;
        }
        case "addOutput": {
          const output = new Output({
            visualizationEngine,
            ...payload.options,
          });
          const { id } = payload.options;
          Orchestrator.dispatch("addOutput", { id, output });
          output.init();
          visualizationEngine.stage.addChild(output);
          break;
        }
        // case "updateConductorPreview": {
        //   Orchestrator.actions.updateConductorPreview(payload.options);
        //   break;
        // }
        case "addConductor": {
          Orchestrator.dispatch("addConductor", payload.options);
          break;
        }
        case "removeConductor": {
          Orchestrator.dispatch("removeConductor", payload.options);
          break;
        }
        case "removeInput": {
          Orchestrator.dispatch("removeInput", payload.options);
          break;
        }
        case "removeOutput": {
          Orchestrator.dispatch("removeOutput", payload.options);
          break;
        }
        case "removeGate": {
          Orchestrator.dispatch("removeGate", payload.options);
          break;
        }
        case "changeElementPosition": {
          Orchestrator.dispatch("changeElementPosition", payload.options);
          break;
        }
        case "addNodeInput": {
          Orchestrator.dispatch("addNodeInput", payload.options);
          break;
        }
        case "toggleInputValue": {
          Orchestrator.dispatch("toggleInputValue", payload.options);
          break;
        }
      }
    });
  }, []);

  adaptEffect(() => {
    Orchestrator.dispatch("init", canvasRef.value as HTMLCanvasElement);
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
