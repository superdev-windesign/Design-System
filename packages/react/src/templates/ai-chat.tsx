"use client";

import { useState } from "react";
import { RiCodeSSlashLine, RiShareLine } from "@remixicon/react";
import { Button } from "../components/button/button";
import { CodePanel } from "../blocks/code-panel/code-panel";
import type { CodeFile } from "../blocks/code-panel/code-panel";
import { parseBlocks } from "../blocks/chat/chat-message";
import type { ChatMessageData, ChatRespond } from "../blocks/chat/chat-session";
import { ChatPane } from "./chat-pane";
import { AssistantMark } from "./chat-starter";
import { TemplateRoot } from "./shared";
import type { TemplateProps } from "./shared";

/**
 * AI Chat: a chat with a code panel beside it. Code blocks in replies open
 * as files in the panel, where they stay while the conversation moves on.
 * The panel folds away when closed and comes back from the header.
 */

const EXT: Record<string, string> = { tsx: "tsx", ts: "ts", jsx: "jsx", js: "js", css: "css", html: "html", json: "json", python: "py", py: "py" };

const SEED: ChatMessageData[] = [
  { id: "s1", role: "user", content: "Make a billing period toggle: monthly or yearly, with yearly showing the saving." },
  {
    id: "s2",
    role: "assistant",
    content:
      "Here's a toggle on the system's segmented control. It keeps the choice in state and shows the yearly saving as a chip:\n\n```tsx\nimport { useState } from \"react\";\nimport { Chip, SegmentedControl, SegmentedControlItem } from \"@windesign/react\";\n\nexport function BillingToggle({ onChange }: { onChange?: (p: \"month\" | \"year\") => void }) {\n  const [period, setPeriod] = useState<\"month\" | \"year\">(\"month\");\n  return (\n    <SegmentedControl\n      aria-label=\"Billing period\"\n      selectedKeys={[period]}\n      onSelectionChange={(keys) => {\n        const next = [...keys][0] as \"month\" | \"year\";\n        setPeriod(next);\n        onChange?.(next);\n      }}\n    >\n      <SegmentedControlItem id=\"month\">Monthly</SegmentedControlItem>\n      <SegmentedControlItem id=\"year\">\n        Yearly <Chip color=\"lime\">-20%</Chip>\n      </SegmentedControlItem>\n    </SegmentedControl>\n  );\n}\n```\n\nThe saving sits inside the yearly option, so it's read out with it.",
  },
];

function filesFrom(messages: ChatMessageData[]): CodeFile[] {
  const files: CodeFile[] = [];
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    for (const part of parseBlocks(m.content)) {
      if (part.kind !== "code") continue;
      const name = /export function (\w+)/.exec(part.code)?.[1] ?? `snippet-${files.length + 1}`;
      files.push({ name: `${name}.${EXT[part.language] ?? "txt"}`, language: part.language, code: part.code });
    }
  }
  return files;
}

export interface AiChatProps extends TemplateProps {
  respond?: ChatRespond;
}

export function AiChat({ respond, className }: AiChatProps) {
  const [files, setFiles] = useState<CodeFile[]>(() => filesFrom(SEED));
  const [selected, setSelected] = useState<string | undefined>(files[0]?.name);
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <TemplateRoot className={className}>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <AssistantMark />
            <h2 className="truncate text-body-md-strong text-fg">Billing period toggle</h2>
          </div>
          <div className="flex items-center gap-2">
            {!panelOpen && files.length > 0 && (
              <Button size="sm" variant="secondary" leadingIcon={RiCodeSSlashLine} onPress={() => setPanelOpen(true)}>
                Code
              </Button>
            )}
            <Button size="sm" variant="tertiary" leadingIcon={RiShareLine}>
              Share
            </Button>
          </div>
        </header>
        <ChatPane
          initialMessages={SEED}
          respond={respond}
          renderAvatar={() => <AssistantMark />}
          onMessagesChange={(messages) => setFiles(filesFrom(messages))}
          onOpenCode={(block) => {
            setSelected(files.find((f) => f.code === block.code)?.name);
            setPanelOpen(true);
          }}
          suggestions={["Add a pricing card", "Write tests for it"]}
        />
      </div>
      {panelOpen && files.length > 0 && (
        <div className="hidden w-[min(28rem,45%)] shrink-0 border-s border-line p-3 @3xl:flex">
          <CodePanel files={files} selectedFile={selected} onSelectedFileChange={setSelected} onClose={() => setPanelOpen(false)} className="w-full" />
        </div>
      )}
    </TemplateRoot>
  );
}
