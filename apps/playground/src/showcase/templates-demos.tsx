import type { ComponentType } from "react";
import {
  AiChat,
  AiImageGeneration,
  AiProfile,
  ChatStarter,
  FinanceDashboard,
  HomeDashboard,
  MarketingDashboard,
  MedicalProfile,
  MultiAgentChat,
  ProjectBoard,
} from "@windesign-ds/react";
import { Fit } from "./blocks-demos";

/** A template in a fixed-height frame: templates fill their container and lay out to its width. */
export function TemplateFrame({ template: Template }: { template: ComponentType<{ className?: string }> }) {
  return (
    <div className="h-200 w-full overflow-hidden rounded-2xl border border-line text-start shadow-raised">
      <Template />
    </div>
  );
}

/** The index card: the template painted at desktop size, scaled down. */
export function TemplatePreview({ template: Template }: { template: ComponentType<{ className?: string }> }) {
  return (
    <Fit width={1280}>
      <div className="h-200">
        <Template />
      </div>
    </Fit>
  );
}

export const TEMPLATES = {
  ChatStarter,
  AiChat,
  MultiAgentChat,
  AiImageGeneration,
  AiProfile,
  HomeDashboard,
  FinanceDashboard,
  MarketingDashboard,
  MedicalProfile,
  ProjectBoard,
};
