import { html } from "lit";
import {
  $generalAppState,
  ButtonSelection,
} from "@/stateEntities/generalAppState";
import "@shoelace-style/shoelace/dist/components/tooltip/tooltip.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";

function Button(props: {
  tooltipText: string;
  onClick: (id: ButtonSelection) => void;
  id: ButtonSelection;
  icon: string;
}) {
  return () => {
    const isSelected =
      props.id === $generalAppState.adaptParticleValue("buttonSelections");

    return html`
      <sl-tooltip content=${props.tooltipText}>
        <sl-button
          variant=${isSelected ? "primary" : "text"}
          @click=${() => props.onClick(props.id)}
          circle
          ><sl-icon
            src="/icons/${props.icon}.svg"
            label=${props.tooltipText}
            class=${!isSelected ? "text-primary-dark" : ""}
          ></sl-icon
        ></sl-button>
      </sl-tooltip>
    `;
  };
}

export default Button;
