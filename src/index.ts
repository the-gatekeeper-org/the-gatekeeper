import { h, renderTemplateFn } from "promethium-js";
import App from "@/ui/App";
import "./index.css";
import { html } from "lit";

renderTemplateFn(() => html`${h(App)}`, { renderContainer: "#root" });
