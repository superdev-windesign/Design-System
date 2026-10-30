import "@fontsource-variable/fraunces";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
