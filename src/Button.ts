import { html } from "promethium-js";

const Button = () => {
  return () => html`
    <button
      class="w-primary-button h-primary-button bg-11 border border-10
             rounded-md flex items-center justify-center"
    >
      H
    </button>
  `;
};

export default Button;
