import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { AgentProgress, DEFAULT_AGENT_PROGRESS_STEPS } from "./agent-progress";

const STEPS = ["Analyze the request", "Generate the component", "Run accessibility checks"];
// Processing starts 1.1s after mount; give the whole run room to finish.
const RUN_TIMEOUT = { timeout: 4000 };

beforeAll(() => {
  // Animations finish instantly so exits unmount right away.
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const list = () => screen.getByRole("list");
const status = () => screen.getByRole("status");

describe("AgentProgress", () => {
  it("renders the steps as an ordered list with a countdown", () => {
    render(<AgentProgress steps={STEPS} />);
    expect(within(list()).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("3 steps left")).toBeInTheDocument();
    expect(status()).toHaveTextContent("3 steps left. Current step: Analyze the request");
  });

  it("marks the active step with aria-current", () => {
    render(<AgentProgress steps={STEPS} />);
    const [first, second] = within(list()).getAllByRole("listitem");
    expect(first).toHaveAttribute("aria-current", "step");
    expect(second).not.toHaveAttribute("aria-current");
  });

  it("completes every step, then calls onFinished after the completion delay", async () => {
    const onFinished = vi.fn();
    render(<AgentProgress steps={STEPS} stepDuration={60} completionDelay={50} onFinished={onFinished} />);

    await waitFor(() => expect(status()).toHaveTextContent("All steps completed"), RUN_TIMEOUT);
    expect(within(list()).getAllByText(", completed")).toHaveLength(3);
    expect(within(list()).queryByRole("listitem", { current: "step" })).toBeNull();

    await waitFor(() => expect(onFinished).toHaveBeenCalledTimes(1));
  });

  it("minimizes to the current step and expands again", async () => {
    const user = userEvent.setup();
    render(<AgentProgress steps={STEPS} />);

    await user.click(screen.getByRole("button", { name: "Minimize steps" }));
    const expand = await screen.findByRole("button", { name: "Expand steps" });
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(expand).toHaveTextContent("Analyze the request");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    await user.click(expand);
    expect(await screen.findByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Minimize steps" })).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps advancing while minimized", async () => {
    const user = userEvent.setup();
    render(<AgentProgress steps={STEPS} stepDuration={60} />);

    await user.click(screen.getByRole("button", { name: "Minimize steps" }));
    await waitFor(() => expect(status()).toHaveTextContent("All steps completed"), RUN_TIMEOUT);

    await user.click(screen.getByRole("button", { name: "Expand steps" }));
    expect(within(await screen.findByRole("list")).getAllByText(", completed")).toHaveLength(3);
  });

  it("holds the timeline while paused", async () => {
    const onFinished = vi.fn();
    render(<AgentProgress steps={STEPS} stepDuration={20} completionDelay={0} onFinished={onFinished} isPaused />);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(screen.getByText("3 steps left")).toBeInTheDocument();
    expect(onFinished).not.toHaveBeenCalled();
  });

  it("falls back to the default steps when given an empty list", () => {
    render(<AgentProgress steps={[]} />);
    expect(within(list()).getAllByRole("listitem")).toHaveLength(DEFAULT_AGENT_PROGRESS_STEPS.length);
  });
});
