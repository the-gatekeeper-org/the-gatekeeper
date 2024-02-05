import { h } from "promethium-js";
import { html } from "lit";
import { map } from "lit/directives/map.js";
import Button from "./Button";
import { _generalAppStateActions } from "@/stateEntities/generalAppState";
import { _circuitElementActions } from "@/circuitElements/actions";

const buttons: Parameters<typeof Button>[0][] = [
  {
    text: "S",
    onClick: () => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", "select");
    },
    id: "select",
  },
  {
    text: "Q",
    onClick: () => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", "simulate");
    },
    id: "simulate",
  },
  {
    text: "I",
    onClick: () => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", "input");
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: "input",
      });
    },
    id: "input",
  },
  {
    text: "Y",
    onClick: () => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", "output");
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: "output",
      });
    },
    id: "output",
  },
  {
    text: "A",
    onClick: () => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", "and");
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: "and",
      });
    },
    id: "and",
  },
  {
    text: "O",
    onClick: () => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", "or");
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: "or",
      });
    },
    id: "or",
  },
  {
    text: "N",
    onClick: () => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", "not");
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: "not",
      });
    },
    id: "not",
  },
];

function Toolbar() {
  return () => html`
    <div class="absolute top-main left-main flex w-toolbar justify-between">
      ${h(Button, { type: "primary", text: "M", onClick() {}, id: "select" })}
      <div
        class="bg-secondary-dark border border-primary-dark rounded-md flex items-center p-1 px-2"
      >
        ${map(buttons, (props) =>
          h(Button, {
            type: "secondary",
            text: props.text,
            onClick: () => props.onClick?.(props.id),
            id: props.id,
          }),
        )}
      </div>
      ${h(Button, { type: "primary", text: "?", onClick() {}, id: "select" })}
    </div>
  `;
}

export default Toolbar;
