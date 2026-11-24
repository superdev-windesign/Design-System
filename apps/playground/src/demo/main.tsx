import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@windesign-ds/react";
import { DemoApp } from "./demo-app";
import "./demo.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <DemoApp />
    </ThemeProvider>
  </StrictMode>,
);
