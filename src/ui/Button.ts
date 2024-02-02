import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import {
  _generalAppState,
  ButtonSelection,
} from "@/stateEntities/generalAppState";

function Button(props: {
  type?: "primary" | "secondary";
  text: string;
  onClick: (id: ButtonSelection) => void;
  id: ButtonSelection;
}) {
  return () => {
    const isSelected =
      props.id === _generalAppState.adaptParticleValue("buttonSelections");
    const variants = classMap({
      "bg-secondary-dark border border-primary-dark hover:scale-105":
        props.type === undefined || props.type === "primary",
      "hover:bg-btn-secondary-dark": props.type === "secondary",
      "bg-btn-secondary-dark": isSelected,
    });

    return html`
      <button
        class="w-primary-button h-primary-button rounded-md flex items-center justify-center mr-1 last-of-type:mr-0 ${variants}"
        @click=${props.onClick}
      >
        ${props.text}
      </button>
    `;
  };
}

export default Button;
