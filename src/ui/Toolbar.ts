import { h } from "promethium-js";
import { html } from "lit";
import { map } from "lit/directives/map.js";
import Button from "./Button";
import Orchestrator from "@/entities/Orchestrator";

const buttons: Parameters<typeof Button>[0][] = [
  {
    text: "S",
    onClick: () => {
      Orchestrator.dispatch("changeSimulatorClickMode", "selecting");
      Orchestrator.dispatch("turnOffButtonSelections", undefined);
      Orchestrator.dispatch("turnOnButtonSelection", "select");
    },
    id: "select",
  },
  {
    text: "Q",
    onClick: () => {
      Orchestrator.dispatch("changeSimulatorClickMode", "simulating");
      Orchestrator.dispatch("turnOffButtonSelections", undefined);
      Orchestrator.dispatch("turnOnButtonSelection", "simulate");
      Orchestrator.dispatch("turnOffAllElementSelections", undefined);
    },
    id: "simulate",
  },
  {
    text: "I",
    onClick: () => {
      Orchestrator.dispatch("changeSimulatorClickMode", "other");
      Orchestrator.dispatch("prepareToAddInput", undefined);
      Orchestrator.dispatch("turnOffButtonSelections", undefined);
      Orchestrator.dispatch("turnOnButtonSelection", "input");
      Orchestrator.dispatch("turnOffAllElementSelections", undefined);
    },
    id: "input",
  },
  {
    text: "Y",
    onClick: () => {
      Orchestrator.dispatch("changeSimulatorClickMode", "other");
      Orchestrator.dispatch("prepareToAddOutput", undefined);
      Orchestrator.dispatch("turnOffButtonSelections", undefined);
      Orchestrator.dispatch("turnOnButtonSelection", "output");
      Orchestrator.dispatch("turnOffAllElementSelections", undefined);
    },
    id: "output",
  },
  {
    text: "A",
    onClick: () => {
      Orchestrator.dispatch("changeSimulatorClickMode", "other");
      Orchestrator.dispatch("prepareToAddGate", { gateType: "and" });
      Orchestrator.dispatch("turnOffButtonSelections", undefined);
      Orchestrator.dispatch("turnOnButtonSelection", "and");
      Orchestrator.dispatch("turnOffAllElementSelections", undefined);
    },
    id: "and",
  },
  {
    text: "O",
    onClick: () => {
      Orchestrator.dispatch("changeSimulatorClickMode", "other");
      Orchestrator.dispatch("prepareToAddGate", {
        gateType: "or",
        noOfInputs: 2,
      });
      Orchestrator.dispatch("turnOffButtonSelections", undefined);
      Orchestrator.dispatch("turnOnButtonSelection", "or");
      Orchestrator.dispatch("turnOffAllElementSelections", undefined);
    },
    id: "or",
  },
  {
    text: "N",
    onClick: () => {
      Orchestrator.dispatch("changeSimulatorClickMode", "other");
      Orchestrator.dispatch("prepareToAddGate", {
        gateType: "not",
      });
      Orchestrator.dispatch("turnOffButtonSelections", undefined);
      Orchestrator.dispatch("turnOnButtonSelection", "not");
      Orchestrator.dispatch("turnOffAllElementSelections", undefined);
    },
    id: "not",
  },
];

function Toolbar() {
  return () => html`
    <div class="absolute top-main left-main flex w-toolbar justify-between">
      ${h(Button, { type: "primary", text: "M" })}
      <div
        class="bg-secondary-dark border border-primary-dark rounded-md flex items-center p-1 px-2"
      >
        ${map(buttons, (props) =>
          h(Button, {
            type: "secondary",
            text: props.text,
            onClick: props.onClick,
            id: props.id,
          }),
        )}
      </div>
      ${h(Button, { type: "primary", text: "?" })}
    </div>
  `;
}

export default Toolbar;
