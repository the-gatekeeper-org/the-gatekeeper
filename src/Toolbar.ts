import { h, html, map } from "promethium-js";
import Button from "./Button";
import Orchestrator from "@/entities/Orchestrator";

const buttons: Parameters<typeof Button>[0][] = [
  {
    text: "S",
    onClick: () => {
      Orchestrator.actions.changeSimulatorClickMode("selecting");
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("select");
    },
    id: "select",
  },
  {
    text: "Q",
    onClick: () => {
      Orchestrator.actions.changeSimulatorClickMode("simulating");
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("simulate");
      Orchestrator.actions.turnOffAllElementSelections();
    },
    id: "simulate",
  },
  {
    text: "I",
    onClick: () => {
      Orchestrator.actions.changeSimulatorClickMode("other");
      Orchestrator.actions.prepareToAddInput();
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("input");
      Orchestrator.actions.turnOffAllElementSelections();
    },
    id: "input",
  },
  {
    text: "Y",
    onClick: () => {
      Orchestrator.actions.changeSimulatorClickMode("other");
      Orchestrator.actions.prepareToAddOutput();
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("output");
      Orchestrator.actions.turnOffAllElementSelections();
    },
    id: "output",
  },
  {
    text: "A",
    onClick: () => {
      Orchestrator.actions.changeSimulatorClickMode("other");
      Orchestrator.actions.prepareToAddGate({ gateType: "and" });
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("and");
      Orchestrator.actions.turnOffAllElementSelections();
    },
    id: "and",
  },
  {
    text: "O",
    onClick: () => {
      Orchestrator.actions.changeSimulatorClickMode("other");
      Orchestrator.actions.prepareToAddGate({
        gateType: "or",
        noOfInputs: 2,
      });
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("or");
      Orchestrator.actions.turnOffAllElementSelections();
    },
    id: "or",
  },
  {
    text: "N",
    onClick: () => {
      Orchestrator.actions.changeSimulatorClickMode("other");
      Orchestrator.actions.prepareToAddGate({
        gateType: "not",
      });
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("not");
      Orchestrator.actions.turnOffAllElementSelections();
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
          })
        )}
      </div>
      ${h(Button, { type: "primary", text: "?" })}
    </div>
  `;
}

export default Toolbar;
