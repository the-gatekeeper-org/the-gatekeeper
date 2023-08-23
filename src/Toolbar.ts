import { h, html, map } from "promethium-js";
import Button from "./Button";
import Orchestrator from "@/entities/Orchestrator";

const buttons: Parameters<typeof Button>[0][] = [
  { text: "S" },
  { text: "L" },
  { text: "T" },
  {
    text: "I",
    onClick: () => {
      Orchestrator.actions.prepareToAddInput();
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("input");
    },
    id: "input",
  },
  {
    text: "Y",
    onClick: () => {
      Orchestrator.actions.prepareToAddOutput();
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("output");
    },
    id: "output",
  },
  {
    text: "A",
    onClick: () => {
      Orchestrator.actions.prepareToAddGate({ gateType: "and" });
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("and");
    },
    id: "and",
  },
  {
    text: "O",
    onClick: () => {
      Orchestrator.actions.prepareToAddGate({
        gateType: "or",
        noOfInputs: 2,
      });
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("or");
    },
    id: "or",
  },
  {
    text: "N",
    onClick: () => {
      Orchestrator.actions.prepareToAddGate({
        gateType: "not",
      });
      Orchestrator.actions.turnOffButtonSelections();
      Orchestrator.actions.turnOnButtonSelection("not");
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
