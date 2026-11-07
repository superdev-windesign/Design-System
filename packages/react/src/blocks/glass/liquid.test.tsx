import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { vi } from "vitest";
import { RiHome5Fill, RiMailFill, RiMicFill, RiSunFill, RiUser3Fill, RiWindyLine } from "@remixicon/react";
import { CameraBar } from "./camera-bar";
import { FrostedCard } from "./frosted-card";
import { GlassClock, clockDigits, litSegments } from "./glass-clock";
import { GlassColorWheel } from "./glass-color-wheel";
import { GlassDial, dialAngle, dialValue } from "./glass-dial";
import { GlassMetricCard } from "./glass-metric-card";
import { GlassSignIn } from "./glass-sign-in";
import { FlightWidget, WeatherWidget } from "./glass-widgets";
import { LensBar } from "./lens-bar";
import { LiquidButton } from "./liquid-button";
import { GLASS_SCENES, SCENE_THEME, glowStyle, sheenHandlers, type GlassScene } from "./liquid-light";
import { LiquidOrb } from "./liquid-orb";
import { ProfileDeck, deckPose } from "./profile-deck";
import { PromptBar } from "./prompt-bar";
import { SwapBox, swapQuote } from "./swap-box";
import { WaveformPlayer, wavePeaks } from "./waveform-player";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("the light helpers", () => {
  it("points a glow at its token", () => {
    expect(glowStyle("ember")).toEqual({ "--glow": "var(--ds-color-glass-glow-ember)" });
  });

  it("follows a mouse but ignores touch, which has nothing to hover", () => {
    const element = document.createElement("div");
    const event = (pointerType: string) => ({ pointerType, clientX: 30, clientY: 12, currentTarget: element }) as never;
    sheenHandlers.onPointerMove(event("touch"));
    expect(element.style.getPropertyValue("--sheen-on")).toBe("");
    sheenHandlers.onPointerMove(event("mouse"));
    expect(element.style.getPropertyValue("--sheen-x")).toBe("30px");
    expect(element.style.getPropertyValue("--sheen-on")).toBe("1");
    sheenHandlers.onPointerLeave(event("mouse"));
    expect(element.style.getPropertyValue("--sheen-on")).toBe("0");
  });

  it("gives every scene a tone, so nothing renders against the wrong theme", () => {
    expect(Object.keys(SCENE_THEME).sort()).toEqual(Object.keys(GLASS_SCENES).sort());
  });

  it("builds scenes from tokens alone", () => {
    for (const scene of Object.keys(GLASS_SCENES) as GlassScene[]) expect(GLASS_SCENES[scene]).not.toMatch(/#[0-9a-f]{3,8}|rgb\(|oklch\(/i);
  });
});

describe("LiquidButton", () => {
  it("presses, and names itself from its label with the eyebrow in front", async () => {
    const onPress = vi.fn();
    render(
      <LiquidButton eyebrow="Add to" onPress={onPress}>
        My Calendar
      </LiquidButton>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Add to My Calendar" }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("carries its tone, and lets a caller's style through", () => {
    render(
      <LiquidButton tone="mint" style={{ width: 10 }}>
        Go
      </LiquidButton>,
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.style.getPropertyValue("--glow")).toBe("var(--ds-color-glass-glow-mint)");
    expect(button.style.width).toBe("10px");
  });
});

describe("LiquidOrb", () => {
  it("only reports a pressed state when it has one", () => {
    const { rerender } = render(<LiquidOrb icon={RiMicFill} aria-label="Speak" />);
    expect(screen.getByRole("button", { name: "Speak" })).not.toHaveAttribute("aria-pressed");
    rerender(<LiquidOrb icon={RiMicFill} aria-label="Speak" isActive />);
    expect(screen.getByRole("button", { name: "Speak" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("LensBar", () => {
  const items = [
    { id: "home", label: "Home", icon: RiHome5Fill },
    { id: "mail", label: "Mail", icon: RiMailFill },
    { id: "you", label: "You", icon: RiUser3Fill },
  ];

  it("starts on the first item and keeps every item named when its label is hidden", () => {
    render(<LensBar aria-label="Sections" items={items} />);
    expect(screen.getByRole("radio", { name: "Home" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Mail" })).toBeInTheDocument();
    expect(screen.getAllByText(/^(Home|Mail|You)$/)).toHaveLength(1);
  });

  it("moves with the keyboard and reports the new choice", async () => {
    const onChange = vi.fn();
    render(<LensBar aria-label="Sections" items={items} onSelectionChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(onChange).toHaveBeenCalledWith("mail");
    expect(screen.getByRole("radio", { name: "Mail" })).toBeChecked();
  });
});

describe("GlassDial", () => {
  it("maps values across its sweep, with a gap at the bottom", () => {
    expect(dialAngle(0, 0, 100)).toBe(-135);
    expect(dialAngle(50, 0, 100)).toBe(0);
    expect(dialAngle(100, 0, 100)).toBe(135);
    expect(dialAngle(500, 0, 100)).toBe(135);
  });

  it("snaps to its step, and holds at the nearer end inside the gap", () => {
    expect(dialValue(0, 10, 30, 1)).toBe(20);
    expect(dialValue(13, 0, 100, 5)).toBe(55);
    expect(dialValue(170, 0, 100, 1)).toBe(100);
    expect(dialValue(-170, 0, 100, 1)).toBe(0);
  });

  it("doesn't drift on a fractional step", () => {
    expect(dialValue(-135 + 270 * 0.3, 0, 1, 0.1)).toBe(0.3);
  });

  it("is a real slider for keyboards and screen readers", () => {
    const onChange = vi.fn();
    render(<GlassDial label="Temperature" defaultValue={22} min={10} max={30} unit="°" caption="Living room" onChange={onChange} />);
    const slider = screen.getByRole("slider", { name: "Temperature" });
    expect(slider).toHaveAttribute("aria-valuetext", "22°");
    expect(slider).toHaveAccessibleDescription("Living room");
    fireEvent.change(slider, { target: { value: "24" } });
    expect(onChange).toHaveBeenCalledWith(24);
    expect(slider).toHaveAttribute("aria-valuetext", "24°");
  });
});

describe("GlassColorWheel", () => {
  it("offers its swatches and names the wheel", () => {
    render(<GlassColorWheel aria-label="Tint" swatches={["#ff0000", "#00ff00"]} />);
    expect(screen.getByRole("listbox", { name: "Saved colours" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("slider", { name: /Tint/ })).toBeInTheDocument();
  });
});

describe("GlassMetricCard", () => {
  it("describes its bars when told what they show", () => {
    render(<GlassMetricCard label="Nodes" value="77" series={[1, 2, 3]} seriesLabel="Rising through the month" />);
    expect(screen.getByRole("img", { name: "Rising through the month" })).toBeInTheDocument();
  });

  it("hides the bars from assistive tech when it can't describe them", () => {
    render(<GlassMetricCard label="Nodes" value="77" series={[1, 2, 3]} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does without a series", () => {
    render(<GlassMetricCard label="Nodes" value="77" />);
    expect(screen.getByRole("heading", { name: "Nodes" })).toBeInTheDocument();
  });
});

describe("widgets", () => {
  it("names the weather by place and labels each stat", () => {
    render(<WeatherWidget place="Toronto" temperature={21} condition="Clear" icon={RiSunFill} high={24} low={15} stats={[{ id: "wind", label: "Wind", value: "6 km/h", icon: RiWindyLine }]} />);
    const region = screen.getByRole("region", { name: "Weather in Toronto" });
    expect(within(region).getByText("21°")).toBeInTheDocument();
    expect(within(region).getByRole("term")).toHaveTextContent("Wind");
    expect(within(region).getByRole("definition")).toHaveTextContent("6 km/h");
  });

  it("keeps a flight's progress in range", () => {
    render(<FlightWidget flight="KL 861" status="Landing soon" from={{ code: "AMS", time: "9:40" }} to={{ code: "HND", time: "7:25" }} progress={1.4} />);
    expect(screen.getByRole("progressbar", { name: "Flight progress" })).toHaveAttribute("aria-valuenow", "100");
  });
});

describe("GlassClock", () => {
  it("pads the time, and twelve-hour noon and midnight read 12", () => {
    expect(clockDigits(new Date(2026, 0, 1, 6, 5))).toBe("06:05");
    expect(clockDigits(new Date(2026, 0, 1, 15, 30), true)).toBe("03:30");
    expect(clockDigits(new Date(2026, 0, 1, 0, 0), true)).toBe("12:00");
    expect(clockDigits(new Date(2026, 0, 1, 12, 0), true)).toBe("12:00");
  });

  it("lights the right segments", () => {
    expect(litSegments("1")).toBe("bc");
    expect(litSegments("8")).toHaveLength(7);
    expect(litSegments("-")).toBe("");
  });

  it("keeps the reading as text, since the digits are drawn", () => {
    const { container } = render(<GlassClock time={new Date(2026, 0, 1, 6, 0)} />);
    expect(container.querySelector("time")).toHaveTextContent("06:00");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("is only an alarm once it can be answered", async () => {
    const onSnooze = vi.fn();
    render(<GlassClock time={new Date(2026, 0, 1, 6, 0)} onSnooze={onSnooze} />);
    await userEvent.click(screen.getByRole("button", { name: "Snooze" }));
    expect(onSnooze).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Stop" })).not.toBeInTheDocument();
  });

  it("keeps its own time when it isn't given one", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 9, 59, 59));
    const { container, unmount } = render(<GlassClock />);
    expect(container.querySelector("time")).toHaveTextContent("09:59");
    vi.useRealTimers();
    unmount();
  });
});

describe("FrostedCard", () => {
  it("shows its text on the glass", () => {
    render(<FrostedCard title="Everyday" value="$12.00" caption="Jo Marsh" detail="09/29" />);
    for (const text of ["Everyday", "$12.00", "Jo Marsh", "09/29"]) expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe("ProfileDeck", () => {
  const profiles = [
    { id: "a", name: "Ines Moreau", role: "Design" },
    { id: "b", name: "Tomás Rey", role: "Engineering" },
    { id: "c", name: "Amara Osei" },
  ];

  it("shrinks and sinks cards with distance, and hides the far ones", () => {
    expect(deckPose(0)).toEqual({ x: "0%", scale: 1, zIndex: 10, opacity: 1 });
    expect(deckPose(-1).zIndex).toBeLessThan(deckPose(0).zIndex);
    expect(deckPose(1).scale).toBe(deckPose(-1).scale);
    expect(deckPose(3).opacity).toBe(0);
  });

  it("opens on the middle card and brings another forward", async () => {
    const onChange = vi.fn();
    render(<ProfileDeck aria-label="Team" profiles={profiles} onSelectionChange={onChange} />);
    expect(screen.getByRole("radio", { name: "Tomás Rey, Engineering" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Amara Osei" }));
    expect(onChange).toHaveBeenCalledWith("c");
    expect(screen.getByRole("radio", { name: "Amara Osei" })).toBeChecked();
  });
});

describe("WaveformPlayer", () => {
  it("draws the same wave for the same title, within range", () => {
    const wave = wavePeaks("Tidewater");
    expect(wave).toEqual(wavePeaks("Tidewater"));
    expect(wave).not.toEqual(wavePeaks("Undertow"));
    expect(Math.min(...wave)).toBeGreaterThan(0);
    expect(Math.max(...wave)).toBeLessThanOrEqual(1);
  });

  it("swaps play and pause, and is scrubbed through a slider", async () => {
    render(<WaveformPlayer track={{ title: "Tidewater", artist: "The Low Hours", duration: 214 }} />);
    expect(screen.getByRole("slider", { name: "Position" })).toBeInTheDocument();
    expect(screen.getByText("-3:34")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });
});

describe("SwapBox", () => {
  const from = { id: "btc", symbol: "BTC" };
  const to = { id: "usd", symbol: "USD" };

  it("quotes either way", () => {
    expect(swapQuote(2, 100, false)).toBe(200);
    expect(swapQuote(200, 100, true)).toBe(2);
    expect(swapQuote(1, 3, true)).toBe(0.333333);
  });

  it("flips the pair and inverts the rate", async () => {
    render(<SwapBox from={from} to={to} rate={100} defaultAmount={2} />);
    expect(screen.getByLabelText("You receive, in USD")).toHaveTextContent("200");
    await userEvent.click(screen.getByRole("button", { name: "Flip direction" }));
    expect(screen.getByLabelText("You receive, in BTC")).toHaveTextContent("0.02");
  });

  it("reports the swap, and won't swap nothing", async () => {
    const onSwap = vi.fn();
    const { rerender } = render(<SwapBox from={from} to={to} rate={100} defaultAmount={2} onSwap={onSwap} />);
    await userEvent.click(screen.getByRole("button", { name: "Swap" }));
    expect(onSwap).toHaveBeenCalledWith({ pay: from, receive: to, amount: 2, received: 200 });
    rerender(<SwapBox key="empty" from={from} to={to} rate={100} defaultAmount={0} onSwap={onSwap} />);
    expect(screen.getByRole("button", { name: "Swap" })).toBeDisabled();
  });
});

describe("PromptBar", () => {
  it("sends on Enter, clears, and ignores blank messages", async () => {
    const onSubmit = vi.fn();
    render(<PromptBar onSubmit={onSubmit} />);
    const field = screen.getByRole("textbox", { name: "Ask" });
    await userEvent.type(field, "   {Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.clear(field);
    await userEvent.type(field, "  Hello there {Enter}");
    expect(onSubmit).toHaveBeenCalledWith("Hello there");
    expect(field).toHaveValue("");
  });

  it("trades the mic for a send button once there's text", async () => {
    render(<PromptBar onVoice={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Send" })).not.toBeInTheDocument();
    await userEvent.type(screen.getByRole("textbox"), "Hi");
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Speak" })).not.toBeInTheDocument();
  });

  it("only shows a mic when voice is wired up, and announces listening", async () => {
    const onVoice = vi.fn();
    const { rerender } = render(<PromptBar />);
    expect(screen.queryByRole("button", { name: "Speak" })).not.toBeInTheDocument();
    rerender(<PromptBar onVoice={onVoice} />);
    await userEvent.click(screen.getByRole("button", { name: "Speak" }));
    expect(onVoice).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Stop listening" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("CameraBar", () => {
  const modes = [
    { id: "video", label: "Video" },
    { id: "photo", label: "Photo" },
  ];

  it("changes mode and takes a picture", async () => {
    const onMode = vi.fn();
    const onCapture = vi.fn();
    render(<CameraBar modes={modes} defaultMode="photo" onModeChange={onMode} onCapture={onCapture} />);
    expect(screen.getByRole("radio", { name: "Photo" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Video" }));
    expect(onMode).toHaveBeenCalledWith("video");
    await userEvent.click(screen.getByRole("button", { name: "Take photo" }));
    expect(onCapture).toHaveBeenCalledOnce();
  });
});

describe("GlassSignIn", () => {
  it("reports what was typed, and which way round", async () => {
    const onSubmit = vi.fn();
    render(<GlassSignIn onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Email"), "jo@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "test-password");
    await userEvent.click(screen.getByRole("radio", { name: "Join" }));
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(onSubmit).toHaveBeenCalledWith({ mode: "join", email: "jo@example.com", password: "test-password" });
  });

  it("offers other providers", async () => {
    const onProvider = vi.fn();
    render(<GlassSignIn providers={["google"]} onProvider={onProvider} />);
    await userEvent.click(screen.getByRole("button", { name: /Google/ }));
    expect(onProvider).toHaveBeenCalledWith("google");
  });
});
