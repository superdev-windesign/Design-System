import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccentPicker } from "./accent-picker/accent-picker";
import { ThemeProvider, accentVariables, applyAccent, contrastWithWhite, startThemeTransition, useTheme } from "../foundations/theme";

const root = document.documentElement;
const accent600 = () => root.style.getPropertyValue("--ds-color-accent-600");

afterEach(() => {
  applyAccent("terracotta");
  localStorage.clear();
  delete (document as { startViewTransition?: unknown }).startViewTransition;
});

describe("accent helpers", () => {
  it("maps presets onto their ramp, shifted where text needs it", () => {
    expect(accentVariables("terracotta")).toBeNull();
    expect(accentVariables("blue")!["--ds-color-accent-600"]).toBe("var(--ds-color-blue-600)");
    expect(accentVariables("orange")!["--ds-color-accent-600"]).toBe("var(--ds-color-orange-700)");
    expect(accentVariables("orange")!["--ds-color-accent-950"]).toBe("var(--ds-color-orange-950)");
  });

  it("builds a custom ramp around the colour", () => {
    const vars = accentVariables("#2f6f4f")!;
    expect(vars["--ds-color-accent-600"]).toBe("#2f6f4f");
    expect(vars["--ds-color-accent-50"]).toBe("color-mix(in oklab, #2f6f4f, white 92%)");
    expect(vars["--ds-color-accent-900"]).toBe("color-mix(in oklab, #2f6f4f, black 48%)");
  });

  it("measures white text on a colour", () => {
    expect(contrastWithWhite("#000000")).toBeCloseTo(21, 0);
    expect(contrastWithWhite("#ffff00")).toBeLessThan(1.1);
    expect(contrastWithWhite("not a colour")).toBe(21);
  });
});

describe("startThemeTransition", () => {
  it("applies at once without the View Transitions API", () => {
    const update = vi.fn();
    startThemeTransition(update, { x: 10, y: 20 });
    expect(update).toHaveBeenCalledOnce();
    expect(root.dataset.themeTransition).toBeUndefined();
  });

  it("reveals from the origin when the API is there", async () => {
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => (finish = resolve));
    const start = vi.fn((update: () => void) => {
      update();
      return { finished };
    });
    (document as { startViewTransition?: unknown }).startViewTransition = start;
    const update = vi.fn();
    startThemeTransition(update, { x: 10, y: 20 });
    expect(start).toHaveBeenCalledWith(update);
    expect(root.style.getPropertyValue("--ds-reveal-x")).toBe("10px");
    expect(root.style.getPropertyValue("--ds-reveal-y")).toBe("20px");
    expect(root.dataset.themeTransition).toBe("");
    finish();
    await finished;
    await Promise.resolve();
    expect(root.dataset.themeTransition).toBeUndefined();
  });
});

describe("AccentPicker", () => {
  function Current() {
    return <output>{useTheme().accent}</output>;
  }

  it("re-tints the page from a swatch and remembers it", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider storageKey={null} accentStorageKey="test-accent">
        <AccentPicker />
        <Current />
      </ThemeProvider>,
    );
    expect(screen.getByRole("radio", { name: "Terracotta" })).toBeChecked();
    expect(screen.getByRole("button", { name: /Reset/ })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "Blue" }));
    expect(screen.getByRole("radio", { name: "Blue" })).toBeChecked();
    expect(accent600()).toBe("var(--ds-color-blue-600)");
    expect(localStorage.getItem("test-accent")).toBe("blue");
    expect(screen.getByText("Accent: Blue")).toHaveAttribute("role", "status");

    await user.click(screen.getByRole("button", { name: /Reset/ }));
    expect(screen.getByText("terracotta")).toBeInTheDocument();
    expect(accent600()).toBe("");
    expect(localStorage.getItem("test-accent")).toBeNull();
  });

  it("restores a stored accent and warns about a pale custom one", () => {
    localStorage.setItem("test-accent", "#f5d76e");
    render(
      <ThemeProvider storageKey={null} accentStorageKey="test-accent">
        <AccentPicker />
      </ThemeProvider>,
    );
    expect(accent600()).toBe("#f5d76e");
    expect(screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
    expect(screen.getByText(/hard to read/)).toHaveAttribute("role", "status");
  });
});
