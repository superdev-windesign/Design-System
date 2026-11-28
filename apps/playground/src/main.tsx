import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";
import { StrictMode } from "react";
import { ThemeProvider } from "@windesign-ds/react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { GoogleAuthProvider } from "./site/google-auth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* One theme choice for the whole site, light until someone picks dark; index.html applies it before first paint. */}
    <ThemeProvider defaultTheme="light">
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
