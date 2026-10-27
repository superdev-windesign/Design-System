// BoardUI → @ds vocabulary. Used by port.mjs to convert BoardUI's MIT-licensed
// free components onto this system's tokens. Values were matched by their
// light and dark resolution, names were chosen by meaning (see README.md).

/** BoardUI semantic color name → [@ds utility color name, @ds CSS variable]. */
export const COLORS = {
  // Surfaces
  "background-full": ["canvas", "--ds-color-bg-canvas"],
  "background-primary-default": ["surface", "--ds-color-bg-surface"],
  "background-primary-hover": ["surface-hover", "--ds-color-bg-surface-hover"],
  "background-primary-active": ["surface-pressed", "--ds-color-bg-surface-pressed"],
  "background-primary-disabled": ["surface-disabled", "--ds-color-bg-surface-disabled"],
  "background-secondary-default": ["sunken", "--ds-color-bg-sunken"],
  "background-secondary-hover": ["sunken-hover", "--ds-color-bg-sunken-hover"],
  "background-tertiary-default": ["muted", "--ds-color-bg-muted"],
  "background-tertiary-hover": ["muted-hover", "--ds-color-bg-muted-hover"],
  "background-tertiary-error": ["danger-subtle", "--ds-color-bg-danger-subtle"],
  "background-quaternary-default": ["strong", "--ds-color-bg-strong"],
  "background-quaternary-hover": ["strong-hover", "--ds-color-bg-strong-hover"],
  "dropdown-item-hover-background": ["surface-hover", "--ds-color-bg-surface-hover"],

  // Text
  "text-primary": ["fg", "--ds-color-text-primary"],
  "text-secondary": ["fg-secondary", "--ds-color-text-secondary"],
  "text-tertiary": ["fg-tertiary", "--ds-color-text-tertiary"],
  "text-disabled": ["fg-disabled", "--ds-color-text-disabled"],
  "text-white": ["on-action", "--ds-color-text-on-action"],
  "text-error-primary": ["fg-danger", "--ds-color-text-danger"],
  "text-error-placeholder": ["fg-danger-placeholder", "--ds-color-text-danger-placeholder"],
  "text-placeholder": ["fg-placeholder", "--ds-color-text-placeholder"],

  // Icons
  "foreground-icon-primary": ["icon", "--ds-color-icon-primary"],
  "foreground-icon-secondary": ["icon-secondary", "--ds-color-icon-secondary"],
  "foreground-icon-tertiary": ["icon-tertiary", "--ds-color-icon-tertiary"],
  "foreground-icon-quaternary": ["icon-quaternary", "--ds-color-icon-quaternary"],
  "foreground-icon-error": ["icon-danger", "--ds-color-icon-danger"],
  "icon-button-disabled-foreground": ["icon-disabled", "--ds-color-icon-disabled"],

  // Borders and focus
  "border-button-default": ["line", "--ds-color-border-default"],
  "border-button-hover": ["line-hover", "--ds-color-border-hover"],
  "border-button-active": ["line-pressed", "--ds-color-border-pressed"],
  "border-button-group": ["line-group", "--ds-color-border-group"],
  "border-error-default": ["line-danger", "--ds-color-border-danger"],
  "border-checkbox-default": ["line-control", "--ds-color-border-control"],
  "border-checkbox-hover": ["line-control-hover", "--ds-color-border-control-hover"],
  "separator-border": ["separator", "--ds-color-border-separator"],
  "border-focus-ring": ["focus", "--ds-color-border-focus"],

  // Actions and controls
  "button-primary-disabled-foreground": ["action-primary-fg-disabled", "--ds-color-action-primary-fg-disabled"],
  "foreground-disabled-danger": ["action-danger-fg-disabled", "--ds-color-action-danger-fg-disabled"],
  "button-ghost-background": ["action-tertiary", "--ds-color-action-tertiary-bg"],
  "button-ghost-hover": ["action-tertiary-hover", "--ds-color-action-tertiary-bg-hover"],
  "button-ghost-active": ["action-tertiary-pressed", "--ds-color-action-tertiary-bg-pressed"],
  "button-ghost-disabled": ["action-tertiary-disabled", "--ds-color-action-tertiary-bg-disabled"],
  "button-ghost-foreground": ["action-tertiary-fg", "--ds-color-action-tertiary-fg"],
  "button-ghost-disabled-foreground": ["action-tertiary-fg-disabled", "--ds-color-action-tertiary-fg-disabled"],
  "control-indicator-background": ["control-knob", "--ds-color-control-knob"],
  "control-indicator-background-subtle": ["control-knob-shade", "--ds-color-control-knob-shade"],

  // Form fields
  "input-disabled-background": ["field-disabled", "--ds-color-field-bg-disabled"],
  "input-disabled-foreground": ["field-icon-disabled", "--ds-color-field-icon-disabled"],
  "input-disabled-text": ["field-fg-disabled", "--ds-color-field-fg-disabled"],

  // Selection and indicators
  "date-range-background": ["selection-range", "--ds-color-selection-range"],
  "date-range-edge-background": ["selection-range-edge", "--ds-color-selection-range-edge"],
  "status-dot-green-halo": ["indicator-green-halo", "--ds-color-indicator-green-halo"],
  "status-dot-yellow-halo": ["indicator-yellow-halo", "--ds-color-indicator-yellow-halo"],
  "status-dot-indigo-halo": ["indicator-indigo-halo", "--ds-color-indicator-indigo-halo"],

  // Status by meaning
  "notification-information-background": ["status-info", "--ds-color-status-info-bg"],
  "notification-information-foreground": ["status-info-fg", "--ds-color-status-info-fg"],
  "notification-success-background": ["status-success", "--ds-color-status-success-bg"],
  "notification-success-foreground": ["status-success-fg", "--ds-color-status-success-fg"],
  "notification-error-background": ["status-danger", "--ds-color-status-danger-bg"],
  "notification-error-foreground": ["status-danger-fg", "--ds-color-status-danger-fg"],

  // Component-scoped
  "kbd-background": ["kbd", "--ds-component-kbd-bg"],
  "kbd-foreground": ["kbd-fg", "--ds-component-kbd-fg"],
  "avatar-neutral-background": ["avatar", "--ds-component-avatar-bg"],
  "badge-neutral-background": ["badge-neutral", "--ds-component-badge-neutral-bg"],
  "file-upload-icon-background": ["file-upload-icon", "--ds-component-file-upload-icon-bg"],
  "file-upload-icon-foreground": ["file-upload-icon-fg", "--ds-component-file-upload-icon-fg"],
  "file-upload-icon-foreground-hover": ["file-upload-icon-fg-hover", "--ds-component-file-upload-icon-fg-hover"],
  "pill-tab-blue-selected-background": ["pill-tab-selected", "--ds-component-pill-tab-selected-bg"],
  "pill-tab-blue-hover-background": ["pill-tab-hover", "--ds-component-pill-tab-hover-bg"],
  "segmented-control-background": ["segmented", "--ds-component-segmented-bg"],
  "segmented-control-selected-background": ["segmented-selected", "--ds-component-segmented-selected-bg"],
  "tab-count-selected-background": ["tab-count-selected", "--ds-component-tab-count-selected-bg"],
  "switch-off-chip-start": ["switch-off-start", "--ds-component-switch-off-start"],
  "switch-off-chip-end": ["switch-off-end", "--ds-component-switch-off-end"],
  "switch-on-chip-start": ["switch-on-start", "--ds-component-switch-on-start"],
  "switch-on-chip-end": ["switch-on-end", "--ds-component-switch-on-end"],
};

// Categorical tags (hue-named on purpose: they carry no meaning).
for (const hue of ["blue", "cyan", "lime", "orange", "purple", "rose", "yellow"]) {
  COLORS[`status-${hue}-background`] = [`tag-${hue}`, `--ds-color-tag-${hue}-bg`];
  COLORS[`status-${hue}-text`] = [`tag-${hue}-fg`, `--ds-color-tag-${hue}-fg`];
}

/** Whole-class replacements for primitives and one-off values BoardUI used directly. */
export const CLASSES = {
  rounded: "rounded-sm",
  "rounded-[3px]": "rounded-hairline",
  "text-white": "text-on-action",
  "fill-white": "fill-on-action",
  "shadow-xs": "shadow-raised",
  "shadow-dropdown": "shadow-overlay",
  "shadow-2xs": "shadow-hairline",
  "shadow-checkbox-selected": "shadow-control-checked",
  "blur-[2px]": "blur-enter",
  "blur-[4px]": "blur-enter-strong",
  "bg-lime-500": "bg-status-success-solid",
  "bg-rose-500": "bg-status-danger-solid",
  "bg-neutral-950": "bg-social-dark",
  "bg-neutral-800": "bg-social-dark-hover",
  "bg-neutral-900": "bg-social-dark-pressed",
  "bg-black/10": "bg-tab-count",
  "bg-blue-300": "bg-avatar-blue",
  "text-blue-900": "text-avatar-blue-fg",
  "bg-lime-200": "bg-avatar-lime",
  "text-lime-700": "text-avatar-lime-fg",
  "bg-pink-200": "bg-avatar-pink",
  "text-pink-500": "text-avatar-pink-fg",
  "text-[10px]": "text-micro-emphasis",
  "text-[18px]": "text-title-sm-emphasis",

  // Hand-tuned control effects, now component shadow tokens (keys use the
  // --ds- variable names because CSS variables are rewritten first).
  "shadow-[inset_0px_0px_0px_0.875px_var(--ds-color-accent-500),inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)]": "shadow-radio-checked-sm",
  "shadow-[inset_0px_0px_0px_1px_var(--ds-color-accent-500),inset_0px_2px_0px_0px_rgba(255,255,255,0.25)]": "shadow-radio-checked-md",
  "shadow-[inset_0_1px_1px_rgb(0_0_0/0.06)]": "shadow-slider-track",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.24),0_1px_2px_rgb(4_80_226/0.16)]": "shadow-slider-fill",
  "shadow-[0_2px_4px_rgb(0_0_0/0.10),inset_0_1px_0_rgb(255_255_255/0.8)]": "shadow-slider-thumb",
  "shadow-[0_3px_8px_color-mix(in_srgb,var(--ds-color-accent-600)_22%,transparent)]": "shadow-slider-thumb-active",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.24)]": "shadow-slider-highlight",
  "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25),inset_0_0_0_0.5px_var(--ds-color-accent-500)]": "shadow-switch-on-sm",
  "shadow-[inset_0_1.5px_0_0_rgb(255_255_255/0.25),inset_0_0_0_0.75px_var(--ds-color-accent-500)]": "shadow-switch-on-md",
  "shadow-[0_2px_2px_0_rgb(0_0_0/0.03)]": "shadow-switch-chip-sm",
  "shadow-[0_3px_3px_0_rgb(0_0_0/0.03)]": "shadow-switch-chip-md",
  "shadow-[0_4px_4px_0_rgb(0_0_0/0.03)]": "shadow-switch-chip-lg",
  "shadow-[0_3px_3px_0_rgb(0_0_0/0.03),0_0.75px_0_0_rgb(0_0_0/0.05)]": "shadow-switch-thumb",
};

/** BoardUI composite text styles → @ds composite text styles. */
export const TEXT = {
  "body-medium": "body-md-strong",
  "body-regular": "body-md",
  "body-2-medium": "body-sm-strong",
  "body-2-regular": "body-sm",
  "caption-1-regular": "caption",
  "caption-1-medium": "caption-strong",
  "caption-1-semibold": "caption-emphasis",
  "headline-semibold": "headline-emphasis",
  "title-3-medium": "title-sm-strong",
};

/** BoardUI module specifier → path inside packages/react/src (no extension). */
export const IMPORTS = {
  "@/utils/cx": "utils/cx",
  "@/utils/use-dismiss-on-outside-press": "utils/use-dismiss-on-outside-press",
  "@/utils/directional-icon": "utils/directional-icon",
  "@/utils/scroll-direction": "utils/scroll-direction",
  "@/components/foundations/direction/direction": "foundations/direction",
  "@/components/foundations/template-copy/template-copy": "foundations/template-copy",
  "@/components/foundations/icons/chevrons": "icons/chevrons",
  "@/components/base/dropdown/menu-styles": "recipes/menu",
  "@/components/base/buttons/button": "components/button/button",
  "@/components/base/select/select": "components/select/select",
  "@/components/base/badges/status-dot": "components/status-dot/status-dot",
  "@/components/base/date-picker/shared": "components/date-picker/shared",
};

/** Default imports from frameworks → named imports from this package (`<path>#<name>`). */
export const DEFAULT_IMPORTS = {
  "next/link": "foundations/link#Link",
};

/**
 * Exact-text patches applied after conversion, per destination file:
 * strict-mode fixes (this repo enables noUncheckedIndexedAccess) and
 * framework-specific pieces swapped for neutral ones.
 */
export const PATCHES = {
  "components/date-picker/meeting-scheduler.tsx": [
    ['const [h, m] = time.split(":").map(Number);', 'const [h = 0, m = 0] = time.split(":").map(Number);'],
    // A generic video icon instead of a third-party brand image from BoardUI's site assets.
    ['import Image from "next/image";\n', 'import { RiVideoChatLine } from "@remixicon/react";\n'],
    [
      '<Image src="/brand/google_meet.png" alt="" width={20} height={20} className="size-5 shrink-0" />',
      '<RiVideoChatLine aria-hidden className="size-5 shrink-0 text-icon-secondary" />',
    ],
    // Fictional demo defaults instead of a real person's name and email.
    ['name: "Mertcan Esmergul",\n  email: "hi@mertcan.works",\n  avatarInitial: "M",', 'name: "Alex Morgan",\n  email: "alex@example.com",\n  avatarInitial: "A",'],
    ['conferencing: "Google meet",', 'conferencing: "Video call",'],
  ],
  "components/file-upload/file-upload.tsx": [
    ["const { width, height } = entry.contentRect;", "if (!entry) return;\n      const { width, height } = entry.contentRect;"],
  ],
  "components/pagination/pagination.tsx": [
    ["setIsCompact(entry.contentRect.width < COMPACT_WIDTH);", "if (entry) setIsCompact(entry.contentRect.width < COMPACT_WIDTH);"],
    // Our Button requires a name whenever iconOnly can be true; it matches the visible label otherwise.
    ["aria-label={isCompact ? previousLabel : undefined}", "aria-label={previousLabel}"],
    ["aria-label={isCompact ? nextLabel : undefined}", "aria-label={nextLabel}"],
  ],
  "components/input-otp/input-otp.tsx": [["chars[index + offset] = clean[offset];", "chars[index + offset] = clean.charAt(offset);"]],
  "components/tree-view/tree-view.tsx": [["const child = rows[index];", "const child = rows[index]!;"]],
};

/** Source files (relative to BoardUI's root) → destination (relative to packages/react/src). */
export const FILES = {
  "utils/directional-icon.ts": "utils/directional-icon.ts",
  "utils/scroll-direction.ts": "utils/scroll-direction.ts",
  "components/foundations/direction/direction.tsx": "foundations/direction.tsx",
  "components/foundations/template-copy/template-copy.tsx": "foundations/template-copy.tsx",
};
const BASE = [
  "announcement/announcement.tsx",
  "avatar/avatar.tsx",
  "badges/badge.tsx",
  "badges/chip.tsx",
  "breadcrumb/breadcrumb.tsx",
  "buttons/button-group.tsx",
  "buttons/close-button.tsx",
  "buttons/icon-button.tsx",
  "buttons/link-button.tsx",
  "carousel/carousel.tsx",
  "checkbox/checkbox.tsx",
  "checkbox/checkbox-card.tsx",
  "checkbox/checkbox-glyph.tsx",
  "date-picker/meeting-scheduler.tsx",
  "divider/divider.tsx",
  "dropdown/dropdown.tsx",
  "file-upload/file-upload.tsx",
  "input/input.tsx",
  "input/hint-text.tsx",
  "input/label.tsx",
  "input-otp/input-otp.tsx",
  "kbd/kbd.tsx",
  "notification/notification.tsx",
  "pagination/pagination.tsx",
  "radio/radio.tsx",
  "radio/radio-card.tsx",
  "segmented-control/segmented-control.tsx",
  "slider/slider.tsx",
  "social-button/social-button.tsx",
  "social-button/social-color-logos.ts",
  "social-button/social-providers.ts",
  "switch/switch.tsx",
  "switch/switch-card.tsx",
  "table/table.tsx",
  "tabs/tabs.tsx",
  "tabs/pill-tab.tsx",
  "textarea/textarea.tsx",
  "tooltip/tooltip.tsx",
  "tree-view/tree-view.tsx",
];
for (const file of BASE) FILES[`components/base/${file}`] = `components/${file}`;
