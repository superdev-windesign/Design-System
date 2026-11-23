import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { RiCameraLine, RiMailLine } from "@remixicon/react";
import { AuroraBackground } from "./backgrounds/aurora-background";
import { BackgroundBeams } from "./backgrounds/background-beams";
import { DitherBackground } from "./backgrounds/dither-background";
import { FlickeringGrid } from "./backgrounds/flickering-grid";
import { Hyperspeed } from "./backgrounds/hyperspeed";
import { LightRays } from "./backgrounds/light-rays";
import { LiquidBackground } from "./backgrounds/liquid-background";
import { Meteors } from "./backgrounds/meteors";
import { RetroGrid } from "./backgrounds/retro-grid";
import { ShootingStars } from "./backgrounds/shooting-stars";
import { ClickSpark } from "./buttons/click-spark";
import { ConfettiButton } from "./buttons/confetti-button";
import { ElasticSlider } from "./buttons/elastic-slider";
import { HoldButton } from "./buttons/hold-button";
import { Magnetic } from "./buttons/magnetic";
import { SlideToConfirm } from "./buttons/slide-to-confirm";
import { SquishSwitch } from "./buttons/squish-switch";
import { StatefulButton } from "./buttons/stateful-button";
import { BorderBeam } from "./cards/border-beam";
import { DynamicIsland } from "./cards/dynamic-island";
import { ExpandableCards } from "./cards/expandable-cards";
import { FocusCards } from "./cards/focus-cards";
import { SpotlightCard } from "./cards/spotlight-card";
import { SwipeDeck } from "./cards/swipe-deck";
import { TiltCard } from "./cards/tilt-card";
import { PixelTrail } from "./cursors/pixel-trail";
import { SmoothCursor } from "./cursors/smooth-cursor";
import { SplashCursor } from "./cursors/splash-cursor";
import { TargetCursor } from "./cursors/target-cursor";
import { HaloInput } from "./inputs/halo-input";
import { MultiStepLoader } from "./inputs/multi-step-loader";
import { ScanLoader } from "./inputs/scan-loader";
import { Terminal } from "./inputs/terminal";
import { VanishInput } from "./inputs/vanish-input";
import { AnimatedList } from "./media/animated-list";
import { AppFolder } from "./media/app-folder";
import { CompareSlider } from "./media/compare-slider";
import { Coverflow } from "./media/coverflow";
import { ImageTrail } from "./media/image-trail";
import { Lens } from "./media/lens";
import { Marquee } from "./media/marquee";
import { FanMenu } from "./navigation/fan-menu";
import { FlowingMenu } from "./navigation/flowing-menu";
import { FollowTooltip } from "./navigation/follow-tooltip";
import { GooeyTabs } from "./navigation/gooey-tabs";
import { MegaMenu } from "./navigation/mega-menu";
import { ScrollNavbar } from "./navigation/scroll-navbar";
import { Ballpit } from "./physics/ballpit";
import { FallingText } from "./physics/falling-text";
import { GravityBox } from "./physics/gravity-box";
import { Lanyard } from "./physics/lanyard";
import { PageTransition } from "./scroll/page-transition";
import { ProgressiveBlur } from "./scroll/progressive-blur";
import { ScrollProgress } from "./scroll/scroll-progress";
import { ScrollTextReveal } from "./scroll/scroll-text-reveal";
import { StickyScrollReveal } from "./scroll/sticky-scroll-reveal";
import { TracingBeam } from "./scroll/tracing-beam";
import { AnimatedBeam } from "./spatial/animated-beam";
import { Globe } from "./spatial/globe";
import { IconCloud } from "./spatial/icon-cloud";
import { OrbitingCircles } from "./spatial/orbiting-circles";
import { TiltedMarquee } from "./spatial/tilted-marquee";
import { WorldMap } from "./spatial/world-map";
import { isLand } from "./spatial/world-land";
import { CurvedText } from "./text/curved-text";
import { RotatingText } from "./text/rotating-text";
import { ScrambleText } from "./text/scramble-text";
import { ShimmerText } from "./text/shimmer-text";
import { SplitFlap } from "./text/split-flap";
import { TextGenerate } from "./text/text-generate";
import { TextHighlighter } from "./text/text-highlighter";
import { VariableFontHover } from "./text/variable-font-hover";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("text effects", () => {
  it("keep the real text available to assistive tech", () => {
    render(
      <>
        <TextGenerate text="Your summary is ready" startOnView={false} />
        <ScrambleText text="Access granted" trigger="mount" />
        <RotatingText words={["teams", "makers"]} />
        <SplitFlap text="Tokyo" />
        <CurvedText text="Windesign badge" />
        <VariableFontHover text="Proximity" />
      </>,
    );
    expect(screen.getByText("Your summary is ready")).toBeInTheDocument();
    expect(screen.getByLabelText("Access granted")).toBeInTheDocument();
    expect(screen.getByText("teams, makers")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Tokyo" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Windesign badge" })).toBeInTheDocument();
    expect(screen.getByLabelText("Proximity")).toBeInTheDocument();
  });

  it("marks highlighted phrases and shimmering text", () => {
    render(
      <p>
        <TextHighlighter startOnView={false}>key phrase</TextHighlighter> <ShimmerText>Thinking…</ShimmerText>
      </p>,
    );
    expect(screen.getByText("key phrase").tagName).toBe("MARK");
    expect(screen.getByText("key phrase")).toHaveAttribute("data-on");
    expect(screen.getByText("Thinking…")).toHaveClass("text-shimmer");
  });
});

describe("buttons and micro-interactions", () => {
  it("StatefulButton shows and announces pending, then success", async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    render(
      <StatefulButton onPress={() => new Promise<void>((r) => (finish = r))} successLabel="Saved">
        Save
      </StatefulButton>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getAllByText("Working…").length).toBeGreaterThan(0));
    await act(async () => finish());
    await waitFor(() => expect(screen.getAllByText("Saved").length).toBeGreaterThan(0));
  });

  it("HoldButton confirms only after being held, from the keyboard too", () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(<HoldButton onConfirm={onConfirm}>Delete</HoldButton>);
    const button = screen.getByRole("button", { name: /Delete/ });
    expect(button).toHaveAccessibleDescription("Press and hold to confirm");
    fireEvent.keyDown(button, { key: " " });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.keyUp(button, { key: " " });
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.keyDown(button, { key: " " });
    act(() => vi.advanceTimersByTime(1300));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("SlideToConfirm confirms with Enter but not with a click", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<SlideToConfirm label="Slide to pay" onConfirm={onConfirm} />);
    const thumb = screen.getByRole("button", { name: /Slide to pay/ });
    await user.click(thumb);
    expect(onConfirm).not.toHaveBeenCalled();
    thumb.focus();
    await user.keyboard("{Enter}");
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("SquishSwitch and ElasticSlider keep their React Aria roles", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SquishSwitch>Wi-Fi</SquishSwitch>
        <ElasticSlider label="Volume" defaultValue={40} />
      </>,
    );
    const sw = screen.getByRole("switch", { name: "Wi-Fi" });
    await user.click(sw);
    expect(sw).toBeChecked();
    const slider = screen.getByRole("slider", { name: "Volume" });
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(slider).toHaveValue("41");
  });

  it("decorative wrappers render their children", () => {
    render(
      <>
        <Magnetic>
          <button type="button">Pull</button>
        </Magnetic>
        <ClickSpark>
          <button type="button">Spark</button>
        </ClickSpark>
        <ConfettiButton>Party</ConfettiButton>
      </>,
    );
    for (const name of ["Pull", "Spark", "Party"]) expect(screen.getByRole("button", { name })).toBeInTheDocument();
  });
});

describe("cards and surfaces", () => {
  it("render their content", () => {
    render(
      <>
        <BorderBeam isActive={false}>Beam</BorderBeam>
        <SpotlightCard>Spot</SpotlightCard>
        <TiltCard holo>Tilt</TiltCard>
        <DynamicIsland mode="timer">04:59</DynamicIsland>
        <FocusCards items={[{ title: "Reef", href: "#reef", media: null }]} />
      </>,
    );
    expect(screen.getByText("Beam").closest(".border-beam")).toHaveAttribute("data-paused");
    expect(screen.getByText("Spot")).toBeInTheDocument();
    expect(screen.getByText("Tilt")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("04:59");
    expect(screen.getByRole("link", { name: "Reef" })).toBeInTheDocument();
  });

  it("ExpandableCards opens a dialog and closes it with Escape", async () => {
    const user = userEvent.setup();
    render(<ExpandableCards items={[{ id: "reef", title: "Coral reef", media: null, content: "Three dives a day" }]} />);
    await user.click(screen.getByRole("button", { name: /Coral reef/ }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Three dives a day")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("SwipeDeck sorts from the buttons and announces the next card", async () => {
    const user = userEvent.setup();
    const onSwipe = vi.fn();
    render(<SwipeDeck items={["Kyoto", "Lima"]} getKey={(p) => p} getLabel={(p) => p} renderItem={(p) => p} onSwipe={onSwipe} />);
    expect(screen.getByText("Kyoto, 1 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Keep: Kyoto" }));
    expect(onSwipe).toHaveBeenCalledWith("Kyoto", "right");
    expect(screen.getByText("Lima, 2 of 2")).toBeInTheDocument();
  });
});

describe("navigation", () => {
  it("GooeyTabs renders its tabs and moves with the arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <GooeyTabs
        aria-label="Sections"
        items={[
          { id: "a", label: "Overview", content: "Overview panel" },
          { id: "b", label: "Activity", content: "Activity panel" },
        ]}
      />,
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    await user.click(tabs[0]!);
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
  });

  it("FanMenu opens its actions, and Escape closes them", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<FanMenu actions={[{ id: "photo", label: "Take photo", icon: RiCameraLine, onAction }]} />);
    const trigger = screen.getByRole("button", { name: "Quick actions" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Take photo" }));
    expect(onAction).toHaveBeenCalled();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("MegaMenu items are disclosure buttons", async () => {
    const user = userEvent.setup();
    render(<MegaMenu aria-label="Main" items={[{ id: "p", label: "Product", content: <a href="#c">Components</a> }]} />);
    const product = screen.getByRole("button", { name: "Product" });
    await user.click(product);
    expect(product).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Components" })).toBeInTheDocument();
  });

  it("FollowTooltip describes its trigger while focused", async () => {
    const user = userEvent.setup();
    render(
      <FollowTooltip content="Ada Morgan">
        <button type="button">AM</button>
      </FollowTooltip>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "AM" })).toHaveAccessibleDescription("Ada Morgan");
  });

  it("FlowingMenu and ScrollNavbar render links", () => {
    render(
      <>
        <FlowingMenu aria-label="Site" items={[{ label: "Work", href: "#w" }, { label: "Studio", href: "#w" }]} />
        <ScrollNavbar>
          <a href="#d">Docs</a>
        </ScrollNavbar>
      </>,
    );
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });
});

describe("inputs and AI", () => {
  it("VanishInput submits the trimmed text and clears", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<VanishInput aria-label="Ask" placeholders={["Summarise this"]} onSubmit={onSubmit} />);
    const field = screen.getByRole("textbox", { name: "Ask" });
    await user.type(field, "  plan a trip {Enter}");
    expect(onSubmit).toHaveBeenCalledWith("plan a trip");
    expect(field).toHaveValue("");
  });

  it("HaloInput, MultiStepLoader, ScanLoader and Terminal expose their state", () => {
    render(
      <>
        <HaloInput label="Ask anything" icon={RiMailLine} />
        <MultiStepLoader steps={["Reading", "Writing"]} current={1} />
        <ScanLoader progress={0.4} />
        <Terminal lines={[{ kind: "command", text: "npm test" }]} />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Ask anything" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Writing, step 2 of 2");
    expect(screen.getByRole("progressbar", { name: "Generating image" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("$ npm test")).toBeInTheDocument();
  });
});

describe("lists, media and scroll", () => {
  it("Marquee hides its repeated copies", () => {
    render(<Marquee repeat={3}>Northwind</Marquee>);
    const copies = screen.getAllByText("Northwind");
    expect(copies).toHaveLength(3);
    expect(copies.filter((c) => c.closest("[aria-hidden]"))).toHaveLength(2);
  });

  it("CompareSlider is a keyboard slider", async () => {
    const user = userEvent.setup();
    render(<CompareSlider before="old" after="new" />);
    const slider = screen.getByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(slider).toHaveValue("51");
  });

  it("Coverflow moves with its buttons and announces the card", async () => {
    const user = userEvent.setup();
    render(
      <Coverflow
        aria-label="Albums"
        items={[
          { id: "a", label: "Midnight", content: null },
          { id: "b", label: "Coastline", content: null },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Coastline, 2 of 2")).toBeInTheDocument();
  });

  it("AppFolder opens into a dialog of apps", async () => {
    const user = userEvent.setup();
    render(<AppFolder name="Daily" apps={[{ id: "mail", label: "Mail", icon: null }]} />);
    await user.click(screen.getByRole("button", { name: "Daily, folder with 1 apps" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "Mail" })).toBeInTheDocument();
  });

  it("the rest render without errors", () => {
    render(
      <>
        <AnimatedList>
          <span>One</span>
        </AnimatedList>
        <ImageTrail items={[]}>Trail</ImageTrail>
        <Lens>Zoom</Lens>
        <TracingBeam>Story</TracingBeam>
        <ScrollProgress />
        <StickyScrollReveal items={[{ title: "Tokens", description: "One source", visual: null }]} />
        <ScrollTextReveal text="Words light up" />
        <ProgressiveBlur />
        <PageTransition transitionKey={1}>Page</PageTransition>
      </>,
    );
    for (const text of ["One", "Trail", "Story", "Page"]) expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Tokens" })).toBeInTheDocument();
  });
});

describe("backgrounds, cursors, 3D and physics", () => {
  it("decorative layers are hidden from assistive tech", () => {
    const { container } = render(
      <>
        <AuroraBackground />
        <FlickeringGrid />
        <RetroGrid />
        <Meteors />
        <BackgroundBeams />
        <LightRays />
        <DitherBackground />
        <LiquidBackground />
        <Hyperspeed />
        <ShootingStars />
        <OrbitingCircles>
          <span>Icon</span>
        </OrbitingCircles>
        <Ballpit />
      </>,
    );
    for (const canvas of container.querySelectorAll("canvas")) expect(canvas).toHaveAttribute("aria-hidden");
    expect(screen.getByText("Icon").closest("[aria-hidden]")).not.toBeNull();
  });

  it("cursor areas keep their content", () => {
    render(
      <>
        <SmoothCursor>Smooth</SmoothCursor>
        <TargetCursor>Target</TargetCursor>
        <SplashCursor>Splash</SplashCursor>
        <PixelTrail>Pixel</PixelTrail>
      </>,
    );
    for (const text of ["Smooth", "Target", "Splash", "Pixel"]) expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("globes, maps and clouds are named images", () => {
    render(
      <>
        <Globe aria-label="Offices" markers={[{ lat: 51.5, lon: 0 }]} />
        <WorldMap aria-label="Routes" places={[{ lat: 51.5, lon: 0, label: "London" }]} />
        <IconCloud aria-label="Tools" icons={[<span key="a">A</span>]} />
        <TiltedMarquee items={[<span key="a">Shot</span>]} />
      </>,
    );
    for (const name of ["Offices", "Routes", "Tools"]) expect(screen.getByRole("img", { name })).toBeInTheDocument();
  });

  it("the land sketch knows land from sea", () => {
    expect(isLand(48.8, 2.3)).toBe(true); // Paris
    expect(isLand(-1.3, 36.8)).toBe(true); // Nairobi
    expect(isLand(30, -40)).toBe(false); // mid-Atlantic
    expect(isLand(0, -150)).toBe(false); // mid-Pacific
  });

  it("physics pieces keep their content in document order", () => {
    render(
      <>
        <GravityBox>
          <span>React</span>
          <span>Tokens</span>
        </GravityBox>
        <FallingText text="Words come loose" />
        <Lanyard>Ada Morgan</Lanyard>
        <AnimatedBeam containerRef={{ current: null }} fromRef={{ current: null }} toRef={{ current: null }} />
      </>,
    );
    expect(screen.getByText("React").compareDocumentPosition(screen.getByText("Tokens")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("button", { name: "Drop" })).toBeInTheDocument();
    expect(screen.getByText("Ada Morgan")).toBeInTheDocument();
  });
});
