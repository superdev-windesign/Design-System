import { readFileSync } from "node:fs";

/** The rules for writing UI with the system (content/rules.md, shipped with the package). */
export function loadRules(): string {
  return readFileSync(new URL("../content/rules.md", import.meta.url), "utf8");
}

export type Framework = "vite" | "next";
export type Method = "package" | "cli";

/** How to add Windesign to a React app, for the framework and the way it'll be used. */
export function setupGuide(framework: Framework, method: Method): string {
  const css = framework === "next" ? "app/globals.css" : "src/index.css";
  const entry = framework === "next" ? "app/layout.tsx" : "src/main.tsx";
  // Relative to the CSS file: src/index.css and app/globals.css are both one level down.
  const fromCss = "../node_modules";

  const install =
    method === "package"
      ? [
          "## 1. Install",
          "npm install @windesign-ds/react @windesign-ds/styles",
          "(pnpm add / yarn add / bun add work the same.) Needs React 19 and Tailwind CSS v4.",
        ]
      : [
          "## 1. Add components as source",
          "npx windesign-ds@latest add <name>        e.g. npx windesign-ds@latest add context-menu",
          "The first run installs @windesign-ds/styles, adds the theme to your CSS file and saves windesign.json.",
          "Each component is copied into src/components/windesign with the files it uses, and its npm packages",
          "are installed. Needs React 19 and Tailwind CSS v4.",
        ];

  const styles = [
    "## 2. Styles",
    `In ${css}:`,
    "```css",
    '@import "tailwindcss";',
    '@import "@windesign-ds/styles/fonts.css";     /* optional: the brands\' typefaces */',
    '@import "@windesign-ds/styles/tailwind.css";',
    ...(method === "package" ? [`@source "${fromCss}/@windesign-ds/react/dist";  /* let Tailwind see the components' classes */`] : []),
    "```",
    method === "cli" ? "(The CLI adds the two @windesign-ds lines for you. Copied components live in your source, so Tailwind already sees them.)" : "",
  ];

  const provider =
    framework === "next"
      ? [
          "## 3. Theme provider",
          `In ${entry}, wrap the page in ThemeProvider. Components that need the browser carry "use client", so this works in the App Router:`,
          "```tsx",
          'import { ThemeProvider } from "@windesign-ds/react";',
          'import "./globals.css";',
          "",
          "export default function RootLayout({ children }: { children: React.ReactNode }) {",
          "  return (",
          '    <html lang="en" suppressHydrationWarning>',
          "      <body>",
          '        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>',
          "      </body>",
          "    </html>",
          "  );",
          "}",
          "```",
        ]
      : [
          "## 3. Theme provider",
          `In ${entry}:`,
          "```tsx",
          'import { createRoot } from "react-dom/client";',
          'import { ThemeProvider } from "@windesign-ds/react";',
          'import App from "./App";',
          'import "./index.css";',
          "",
          'createRoot(document.getElementById("root")!).render(',
          '  <ThemeProvider defaultTheme="light">',
          "    <App />",
          "  </ThemeProvider>,",
          ");",
          "```",
        ];

  const use = [
    "## 4. Use a component",
    "```tsx",
    method === "package" ? 'import { Button } from "@windesign-ds/react";' : 'import { Button } from "@/components/windesign/components/button/button";',
    "",
    "export function SaveBar({ onSave }: { onSave: () => void }) {",
    "  return <Button onPress={onSave}>Save changes</Button>;",
    "}",
    "```",
    "",
    "TypeScript: set \"lib\" to ES2023 or newer in tsconfig.json (new Vite and Next.js projects already do).",
    "Dark mode: data-theme=\"dark\" on <html> or any element. Brands: data-brand=\"moon\" or data-brand=\"glass\".",
  ];

  return [`# Set up Windesign in a ${framework === "next" ? "Next.js" : "Vite"} app (${method === "package" ? "npm package" : "CLI, copied source"})`, "", ...install, "", ...styles, "", ...provider, "", ...use]
    .filter((line) => line !== "")
    .join("\n")
    .replace(/\n(## )/g, "\n\n$1");
}
