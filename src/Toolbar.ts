import { h, html } from "promethium-js";
import Button from "./Button";

const Toolbar = () => {
  return () => html`
    <div class="absolute top-main left-main flex w-toolbar justify-between">
      ${h(Button)}
      <div class="bg-11 border border-10 rounded-md flex items-center">
        S L T I Y A O N
      </div>
      ${h(Button)}
    </div>
  `;
};

export default Toolbar;
