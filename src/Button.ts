import { classMap, html } from "promethium-js";
import { buttonSelections } from "@/entities/userInterfaceEntities";

function Button(props: {
  type?: "primary" | "secondary";
  text: string;
  onClick?: () => void;
  id?: Parameters<typeof buttonSelections.adaptParticle>[0];
}) {
  return () => {
    const isSelected = props.id
      ? buttonSelections.adaptParticle(props.id)[0]
      : undefined;
    const variants = classMap({
      "bg-secondary-dark border border-primary-dark hover:scale-105":
        props.type === undefined || props.type === "primary",
      "hover:bg-btn-secondary-dark": props.type === "secondary",
      "bg-btn-secondary-dark": isSelected !== undefined ? isSelected() : false,
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
