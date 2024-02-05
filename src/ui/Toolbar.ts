import { h } from "promethium-js";
import { html } from "lit";
import { map } from "lit/directives/map.js";
import Button from "./Button";
import {
  ButtonSelection,
  _generalAppStateActions,
} from "@/stateEntities/generalAppState";
import { _circuitElementActions } from "@/circuitElements/actions";
import { CircuitElementType } from "@/stateEntities/generalCircuitElementData";

const buttons: Parameters<typeof Button>[0][] = [
  {
    tooltipText: "Select",
    icon: "cursor",
    onClick: (id: ButtonSelection) => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", id);
    },
    id: "select",
  },
  {
    tooltipText: "Simulate",
    icon: "hand-index-thumb",
    onClick: (id: ButtonSelection) => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", id);
    },
    id: "simulate",
  },
  {
    tooltipText: "Wire",
    icon: "bounding-box",
    onClick: (id: ButtonSelection) => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", id);
    },
    id: "wire",
  },
  {
    tooltipText: "And",
    icon: "and-gate",
    onClick: (id: ButtonSelection) => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", id);
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: id as CircuitElementType,
      });
    },
    id: "and",
  },
  {
    tooltipText: "Not",
    icon: "not-gate",
    onClick: (id: ButtonSelection) => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", id);
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: id as CircuitElementType,
      });
    },
    id: "not",
  },
  {
    tooltipText: "Or",
    icon: "or-gate",
    onClick: (id: ButtonSelection) => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", id);
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: id as CircuitElementType,
      });
    },
    id: "or",
  },
  {
    tooltipText: "Input",
    icon: "info-square",
    onClick: (id: ButtonSelection) => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", id);
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: id as CircuitElementType,
      });
    },
    id: "input",
  },
  {
    tooltipText: "Output",
    icon: "info-circle",
    onClick: (id: ButtonSelection) => {
      _generalAppStateActions.dispatch("turnOnButtonSelection", id);
      _circuitElementActions.dispatch("prepareToAddCircuitElement", {
        type: id as CircuitElementType,
      });
    },
    id: "output",
  },
];

function Toolbar() {
  return () => html`
    <div class="w-full flex justify-center items-center">
      <div
        class="absolute bottom-main border border-primary-dark rounded-full px-2 py-2"
      >
        ${map(buttons, (props) =>
          h(Button, {
            tooltipText: props.tooltipText,
            icon: props.icon,
            onClick: () => props.onClick(props.id),
            id: props.id,
          }),
        )}
      </div>
    </div>
  `;
}

export default Toolbar;
