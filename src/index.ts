import { h, renderTemplateFn } from "promethium-js";
import App from "@/ui/App";
import "./index.css";
import { html } from "lit";
import "@shoelace-style/shoelace/dist/themes/dark.css";

renderTemplateFn(() => html`${h(App)}`, { renderContainer: "#root" });
