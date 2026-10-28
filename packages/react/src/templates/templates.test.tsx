import { render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import type { ComponentType } from "react";
import { AiChat } from "./ai-chat";
import { AiImageGeneration } from "./ai-image-generation";
import { AiProfile } from "./ai-profile";
import { ChatStarter } from "./chat-starter";
import { FinanceDashboard } from "./finance-dashboard";
import { HomeDashboard } from "./home-dashboard";
import { MarketingDashboard } from "./marketing-dashboard";
import { MedicalProfile } from "./medical-profile";
import { MultiAgentChat } from "./multi-agent-chat";
import { ProjectBoard } from "./project-board";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

/** Each template renders and shows its defining content. */
const TEMPLATES: [string, ComponentType, RegExp][] = [
  ["ChatStarter", ChatStarter, /What are we working on\?/],
  ["AiChat", AiChat, /billing period toggle/i],
  ["MultiAgentChat", MultiAgentChat, /Ask the team/],
  ["AiImageGeneration", AiImageGeneration, /lighthouse on basalt cliffs/],
  ["AiProfile", AiProfile, /Mia Chen/],
  ["HomeDashboard", HomeDashboard, /Good morning, Alex/],
  ["FinanceDashboard", FinanceDashboard, /Recent transactions/],
  ["MarketingDashboard", MarketingDashboard, /Campaigns/],
  ["MedicalProfile", MedicalProfile, /Dana Okafor/],
  ["ProjectBoard", ProjectBoard, /Sprint 14/],
];

describe.each(TEMPLATES)("%s", (_, Template, marker) => {
  it("renders its screen", () => {
    render(<Template />);
    expect(document.body).toHaveTextContent(marker);
  });
});

describe("ProjectBoard", () => {
  it("opens with the in-progress ticket and its comments", () => {
    render(<ProjectBoard />);
    expect(screen.getByRole("complementary", { name: /WIN-130/ })).toHaveTextContent("First PR is up for review");
  });
});
