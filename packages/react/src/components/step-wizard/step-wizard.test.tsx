import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { StepWizard, WizardStep } from "./step-wizard";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const heading = () => screen.getByRole("heading", { level: 3 });
const rail = () => within(screen.getByRole("navigation", { name: "Progress" })).getAllByRole("listitem");

function Wizard(props: { validate?: () => string | void; onComplete?: () => void; withDone?: boolean }) {
  return (
    <StepWizard onComplete={props.onComplete} renderComplete={props.withDone ? () => <p>All set</p> : undefined}>
      <WizardStep title="Workspace" validate={props.validate}>
        <p>Workspace fields</p>
      </WizardStep>
      <WizardStep title="Team">
        <p>Team fields</p>
      </WizardStep>
      <WizardStep title="Review">
        <p>Review fields</p>
      </WizardStep>
    </StepWizard>
  );
}

describe("StepWizard", () => {
  it("starts on the first step with it marked current", () => {
    render(<Wizard />);
    expect(heading()).toHaveTextContent("Workspace");
    expect(rail()[0]).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  });

  it("moves forward and back, and lets finished steps be revisited", async () => {
    const user = userEvent.setup();
    render(<Wizard />);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(heading()).toHaveTextContent("Team"));
    expect(rail()[1]).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Step 2 of 3: Team")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Step 1: Workspace (completed)" }));
    await waitFor(() => expect(heading()).toHaveTextContent("Workspace"));
  });

  it("stays on the step and shows the message when validation fails", async () => {
    const user = userEvent.setup();
    render(<Wizard validate={() => "Enter a workspace name"} />);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Enter a workspace name");
    expect(heading()).toHaveTextContent("Workspace");
    expect(screen.getByRole("button", { name: "Continue" })).toHaveAccessibleDescription("Enter a workspace name");
  });

  it("calls onComplete on the last step and shows the completion view", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Wizard onComplete={onComplete} withDone />);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "Finish" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(await screen.findByText("All set")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Finish" })).not.toBeInTheDocument();
  });
});
