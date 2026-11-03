import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Spinner, SpinnerGlyph } from "../components/spinner/spinner";
import { ColorPicker, ColorWell } from "../components/color-picker/color-picker";
import { ComposerAttachments, ComposerWithAttachments, attachmentKind, type ComposerAttachment } from "./composer/composer-attachments";
import { AgentCreator, type AgentConfig } from "./agent-creator/agent-creator";

describe("Spinner and SpinnerGlyph", () => {
  it("keeps the glyph decorative and can drop the track", () => {
    const { container, rerender } = render(<SpinnerGlyph size="xl" />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(container.querySelector("circle")).toBeInTheDocument();
    rerender(<SpinnerGlyph track={false} />);
    expect(container.querySelector("circle")).toBeNull();
    rerender(<Spinner size="xl" aria-label="Saving" />);
    expect(screen.getByRole("progressbar", { name: "Saving" })).toBeInTheDocument();
  });
});

describe("ColorPicker variants", () => {
  it("shows the editor inline with HEX, RGB and HSL readouts", () => {
    render(<ColorPicker variant="inline" label="Brand colour" defaultValue="#c2410c" />);
    const editor = screen.getByRole("group", { name: "Brand colour" });
    expect(within(editor).getByText("#C2410C")).toBeInTheDocument();
    expect(within(editor).getByText("rgb(194, 65, 12)")).toBeInTheDocument();
    expect(within(editor).getByText(/^hsl\(/)).toBeInTheDocument();
  });

  it("opens the editor from a well, with an opacity rail when asked", async () => {
    const user = userEvent.setup();
    render(<ColorWell aria-label="Bug colour" defaultValue="#b91c1c" showAlpha />);
    await user.click(screen.getByRole("button", { name: "Bug colour" }));
    expect(await screen.findByText("Opacity")).toBeInTheDocument();
  });
});

describe("Composer attachments", () => {
  it("knows six kinds and shows an image's thumbnail", () => {
    expect(["a.key", "b.mp4", "c.png", "d.xlsx", "e.tsx", "f.pdf"].map(attachmentKind)).toEqual([
      "presentation",
      "video",
      "image",
      "sheet",
      "code",
      "document",
    ]);
    const { container } = render(
      <ComposerAttachments items={[{ id: "1", name: "harbour.png", size: 2048, kind: "image", src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" }]} />,
    );
    expect(container.querySelector("img")).toBeInTheDocument();
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
  });

  it("lands queued files one after another", async () => {
    const landed: string[] = [];
    const onAllUploaded = vi.fn();
    function Queue() {
      const [files, setFiles] = useState<ComposerAttachment[]>([
        { id: "a", name: "notes.pdf", size: 1000, progress: 0 },
        { id: "b", name: "chart.png", size: 2000, progress: 0 },
      ]);
      return (
        <ComposerWithAttachments
          attachments={files}
          onAttachmentsChange={setFiles}
          uploadDuration={60}
          uploadGap={10}
          onUploadComplete={(file) => landed.push(file.name)}
          onAllUploaded={onAllUploaded}
        />
      );
    }
    render(<Queue />);
    expect(screen.getAllByText("Waiting")).toHaveLength(2);
    await waitFor(() => expect(onAllUploaded).toHaveBeenCalledOnce(), { timeout: 2000 });
    expect(landed).toEqual(["notes.pdf", "chart.png"]);
    expect(screen.queryByText("Waiting")).not.toBeInTheDocument();
  });
});

describe("AgentCreator", () => {
  it("works controlled, with shapes, expressions and a close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const changes: AgentConfig[] = [];
    function Controlled() {
      const [agent, setAgent] = useState<AgentConfig>({ name: "Nimbus", description: "", color: 6, tone: "concise", voice: "calm", speed: 1 });
      return (
        <AgentCreator
          layout="sidebar"
          agent={agent}
          onChange={(next) => {
            changes.push(next);
            setAgent(next);
          }}
          onClose={onClose}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("radio", { name: "Hexagon" }));
    await user.click(screen.getByRole("radio", { name: "Surprised" }));
    await user.type(screen.getByRole("textbox", { name: "Label" }), "Ops");
    expect(changes.at(-1)).toEqual(expect.objectContaining({ shape: "hexagon", expression: "surprised", label: "Ops", name: "Nimbus" }));
    expect(within(screen.getByRole("complementary", { name: "Preview" })).getByText("Ops")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
