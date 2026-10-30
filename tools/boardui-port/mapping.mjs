// BoardUI → @ds vocabulary. Used by port.mjs to convert BoardUI's MIT-licensed
// free components onto this system's tokens. Values were matched by their
// light and dark resolution, names were chosen by meaning (see README.md).

/** BoardUI semantic color name → [@ds utility color name, @ds CSS variable]. */
export const COLORS = {
  // Blocks (application components)
  "background-inner-default": ["surface", "--ds-color-bg-surface"],
  "notification-center-background": ["surface", "--ds-color-bg-surface"],
  "stat-card-icon-background": ["surface", "--ds-color-bg-surface"],
  "team-menu-count-background": ["muted", "--ds-color-bg-muted"],
  "team-menu-count-foreground": ["fg-secondary", "--ds-color-text-secondary"],
  "theme-toggle-sidebar-background": ["muted", "--ds-color-bg-muted"],
  "theme-toggle-sidebar-selected-background": ["surface", "--ds-color-bg-surface"],
  "border-button-white": ["surface", "--ds-color-bg-surface"],
  "border-sidebar-profile-hover": ["line-hover", "--ds-color-border-hover"],
  "border-table": ["line", "--ds-color-border-default"],
  // Charts
  "chart-track": ["chart-track", "--ds-color-chart-track"],
  "chart-cursor": ["chart-cursor", "--ds-color-chart-cursor"],
  "chart-neutral": ["chart-neutral", "--ds-color-chart-neutral"],
  "chart-1": ["chart-1", "--ds-color-chart-1"],
  "chart-1-active": ["chart-1-active", "--ds-color-chart-1-active"],
  "chart-2": ["chart-2", "--ds-color-chart-2"],
  "chart-2-active": ["chart-2-active", "--ds-color-chart-2-active"],
  "chart-3": ["chart-3", "--ds-color-chart-3"],
  "chart-3-active": ["chart-3-active", "--ds-color-chart-3-active"],
  "chart-4": ["chart-4", "--ds-color-chart-4"],
  "chart-4-active": ["chart-4-active", "--ds-color-chart-4-active"],
  "chart-5": ["chart-5", "--ds-color-chart-5"],
  "chart-5-active": ["chart-5-active", "--ds-color-chart-5-active"],
  "chart-6": ["chart-6", "--ds-color-chart-6"],
  "chart-6-active": ["chart-6-active", "--ds-color-chart-6-active"],
  "chart-7": ["chart-7", "--ds-color-chart-7"],
  "chart-7-active": ["chart-7-active", "--ds-color-chart-7-active"],
  "chart-8": ["chart-8", "--ds-color-chart-8"],
  "chart-8-active": ["chart-8-active", "--ds-color-chart-8-active"],
  "chart-9": ["chart-9", "--ds-color-chart-9"],
  "chart-9-active": ["chart-9-active", "--ds-color-chart-9-active"],
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
  // Blocks (application components)
  "shadow-card": "shadow-raised",
  "rounded-notification-card": "rounded-2lg",
  "bg-blue-200": "bg-tag-blue",
  "text-blue-700": "text-tag-blue-fg",
  "bg-amber-200": "bg-tag-yellow",
  "text-amber-700": "text-tag-yellow-fg",
  "text-pink-700": "text-avatar-pink-fg",
  "bg-green-500": "bg-status-success-solid",
  "bg-red-600": "bg-status-danger-solid",
  "text-lime-600": "text-status-success-fg",
  "bg-blue-400/70": "bg-chart-6/70",
  "bg-lime-400/70": "bg-chart-2/70",
  "bg-orange-400/70": "bg-plan-art-orange/70",
  "from-blue-500": "from-stat-icon-blue-start",
  "to-blue-600": "to-stat-icon-blue-end",
  "from-orange-400": "from-stat-icon-orange-start",
  "to-orange-500": "to-stat-icon-orange-end",
  "from-purple-500": "from-stat-icon-purple-start",
  "to-purple-600": "to-stat-icon-purple-end",
  "from-pink-500": "from-stat-icon-pink-start",
  "to-pink-600": "to-stat-icon-pink-end",
  "from-sky-400": "from-stat-icon-sky-start",
  "to-sky-500": "to-stat-icon-sky-end",
  "from-emerald-500": "from-stat-icon-emerald-start",
  "to-emerald-600": "to-stat-icon-emerald-end",
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
  "title-1-medium": "title-lg-strong",
  "title-2-medium": "title-md-strong",
  "display-4-medium": "display-sm",
  "headline-medium": "headline-emphasis",
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
  "@/hooks/use-count-up": "hooks/use-count-up",
  "@/components/application/theme/theme-toggle": "blocks/theme-toggle/theme-toggle",
  "@/components/application/settings/settings-modal": "blocks/settings/settings-modal",
  "@/components/application/notification-center/notification-center": "blocks/notification-center/notification-center",
  "@/components/application/auth/auth-media-carousel": "blocks/auth/auth-media-carousel",
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
  // The class mapper renames Tailwind's bare `rounded`; here it's a variable name.
  "charts/revenue-chart/revenue-chart-card.tsx": [
    ["const rounded-sm = ", "const rounded = "],
    ['`${rounded-sm > 0 ? "+" : ""}${rounded-sm}%`', '`${rounded > 0 ? "+" : ""}${rounded}%`'],
    ["color: rounded-sm > 0 ?", "color: rounded > 0 ?"],
  ],
  "charts/revenue-chart/orders-chart-card.tsx": [
    ["const rounded-sm = ", "const rounded = "],
    ['`${rounded-sm > 0 ? "+" : ""}${rounded-sm}%`', '`${rounded > 0 ? "+" : ""}${rounded}%`'],
    ["color: rounded-sm > 0 ?", "color: rounded > 0 ?"],
  ],
  // Blocks: fictional people instead of real ones, no BoardUI branding or site assets,
  // this system's theme attribute, and tokens in place of dark: variants.
  "blocks/data-table/data-table.tsx": [
    ["const PHOTO_PEOPLE: { name: string; avatar: string }[] = [\n  { name: \"John Clarkson\", avatar: \"/avatars/john-clarkson.webp\" },\n  { name: \"Aspen Lubin\", avatar: \"/avatars/aspen-lubin.webp\" },\n  { name: \"Michael Ekstrom\", avatar: \"/avatars/michael-ekstrom.webp\" },\n  { name: \"Kianna Vaccaro\", avatar: \"/avatars/kianna-vaccaro.webp\" },\n  { name: \"Livia Saris\", avatar: \"/avatars/livia-saris.webp\" },\n  { name: \"Jaydon Aminoff\", avatar: \"/avatars/jaydon-aminoff.webp\" },\n  { name: \"Maria Lubin\", avatar: \"/avatars/maria-lubin.webp\" },\n  { name: \"Ann Press\", avatar: \"/avatars/ann-press.webp\" },\n];", "const PHOTO_PEOPLE: { name: string; avatar?: string }[] = [\n  { name: \"John Clarkson\" },\n  { name: \"Aspen Lubin\" },\n  { name: \"Michael Ekstrom\" },\n  { name: \"Kianna Vaccaro\" },\n  { name: \"Livia Saris\" },\n  { name: \"Jaydon Aminoff\" },\n  { name: \"Maria Lubin\" },\n  { name: \"Ann Press\" },\n];"],
  ],
  "blocks/notification-center/notification-center-demo.tsx": [
    ["avatar: { src: \"/avatars/livia-saris.webp\", alt: \"Livia Saris\" },", "avatar: { initials: \"L\", alt: \"Livia Saris\", color: \"pink\" },"],
    ["avatar: { src: \"/avatars/jaydon-aminoff.webp\", alt: \"Jaydon Aminoff\" },", "avatar: { initials: \"J\", alt: \"Jaydon Aminoff\", color: \"blue\" },"],
  ],
  "blocks/settings/settings-storage.tsx": [
    ["} from \"@remixicon/react\";", "  RiFileExcel2Fill,\n  RiFileTextFill,\n  RiFileVideoFill,\n} from \"@remixicon/react\";"],
    ["const FILE_ICONS: Record<FileKind, { light: string; dark?: string }> = {\n  document: {\n    light: \"/ai-chat/plugin-documents.svg\",\n    dark: \"/ai-chat/plugin-documents-dark.svg\",\n  },\n  spreadsheet: { light: \"/ai-chat/plugin-spreadsheets.svg\" },\n  video: { light: \"/ai-chat/plugin-videos.svg\" },\n};", "const FILE_ICONS: Record<FileKind, { icon: typeof RiFileTextFill; className: string }> = {\n  document: { icon: RiFileTextFill, className: \"bg-tag-blue text-tag-blue-fg\" },\n  spreadsheet: { icon: RiFileExcel2Fill, className: \"bg-tag-lime text-tag-lime-fg\" },\n  video: { icon: RiFileVideoFill, className: \"bg-tag-purple text-tag-purple-fg\" },\n};"],
    ["function StoredFileIcon({ kind }: { kind: FileKind }) {\n  const localize = useTemplateCopy();\n  const { light, dark } = FILE_ICONS[kind];\n\n  if (dark) {\n    return localize((\n      <>\n        {/* eslint-disable-next-line @next/next/no-img-element -- decorative registry-packaged SVG */}\n        <img src={light} alt=\"\" className=\"theme-asset-light size-6 shrink-0 object-contain\" />\n        {/* eslint-disable-next-line @next/next/no-img-element -- decorative registry-packaged SVG */}\n        <img src={dark} alt=\"\" className=\"theme-asset-dark size-6 shrink-0 object-contain\" />\n      </>\n    ));\n  }\n\n  // eslint-disable-next-line @next/next/no-img-element -- decorative registry-packaged SVG\n  return localize(<img src={light} alt=\"\" className=\"size-6 shrink-0 object-contain\" />);\n}", "function StoredFileIcon({ kind }: { kind: FileKind }) {\n  const { icon: Icon, className } = FILE_ICONS[kind];\n  return (\n    <span aria-hidden className={cx(\"flex size-6 shrink-0 items-center justify-center rounded-md\", className)}>\n      <Icon className=\"size-3.5\" />\n    </span>\n  );\n}"],
  ],
  "blocks/sidebar/dashboard-sidebar.tsx": [
    ["/** The Pro dashboard's navigation, the default set. */\nexport const DASHBOARD_NAV: DashboardNavItem[] = [\n  { key: \"home\", label: \"Home\", icon: RiHomeLine, href: \"/templates/dashboard\", badge: 152 },\n  { key: \"project-board\", label: \"Project board\", icon: RiKanbanView2, href: \"/templates/project-board\" },\n  { key: \"marketing\", label: \"Marketing\", icon: RiMegaphoneLine, href: \"/templates/marketing\" },\n  { key: \"calendar\", label: \"Calendar\", icon: RiCalendarLine, href: \"/templates/calendar\" },\n  { key: \"finance\", label: \"Finance\", icon: RiBankLine, href: \"/templates/finance\" },\n  { key: \"medical\", label: \"Medical Report\", icon: RiAsterisk, href: \"/templates/medical-profile\" },\n  { key: \"ai-chat\", label: \"AI Chat\", icon: RiChatAiLine, href: \"/templates/ai-chat\" },\n  { key: \"ai-image\", label: \"AI Image Generation\", icon: RiImageAiLine, href: \"/templates/ai-image-generation\" },\n  { key: \"profile\", label: \"Profile\", icon: RiUserSmileLine, href: \"/templates/ai-profile\" },\n];", "/** The default navigation set. Screens pass their own `items` with real routes. */\nexport const DASHBOARD_NAV: DashboardNavItem[] = [\n  { key: \"home\", label: \"Home\", icon: RiHomeLine, href: \"#dashboard\", badge: 152 },\n  { key: \"project-board\", label: \"Project board\", icon: RiKanbanView2, href: \"#project-board\" },\n  { key: \"marketing\", label: \"Marketing\", icon: RiMegaphoneLine, href: \"#marketing\" },\n  { key: \"calendar\", label: \"Calendar\", icon: RiCalendarLine, href: \"#calendar\" },\n  { key: \"finance\", label: \"Finance\", icon: RiBankLine, href: \"#finance\" },\n  { key: \"medical\", label: \"Medical Report\", icon: RiAsterisk, href: \"#medical-profile\" },\n  { key: \"ai-chat\", label: \"AI Chat\", icon: RiChatAiLine, href: \"#ai-chat\" },\n  { key: \"ai-image\", label: \"AI Image Generation\", icon: RiImageAiLine, href: \"#ai-image-generation\" },\n  { key: \"profile\", label: \"Profile\", icon: RiUserSmileLine, href: \"#ai-profile\" },\n];"],
    ["        planArtSrc=\"/templates/settings-plan-art.png\"\n", ""],
    ["\"bg-muted dark:bg-sunken\"", "\"bg-sidebar-avatar\""],
  ],
  "blocks/sidebar/dashboard-team-menu.tsx": [
    ["<Avatar size=\"md\" color=\"blue\" src=\"/brand/boardui_logo_circle.webp\" alt=\"Board team\" />", "<Avatar size=\"md\" color=\"blue\" initials=\"A\" alt=\"Acme team\" />"],
    ["<Avatar size=\"md\" color=\"blue\" src=\"/brand/boardui_logo_circle.webp\" alt=\"Board team\" />", "<Avatar size=\"md\" color=\"blue\" initials=\"A\" alt=\"Acme team\" />"],
  ],
  "blocks/sidebar/dashboard-user-menu.tsx": [
    ["{ initials: \"M\", color: \"neutral\", name: \"Mertcan Esmergul\" },", "{ initials: \"A\", color: \"neutral\", name: \"Alex Morgan\" },"],
    ["aria-label=\"Mertcan Esmergul\"", "aria-label=\"Alex Morgan\""],
    [">Mertcan Esmergul</span>", ">Alex Morgan</span>"],
  ],
  "blocks/settings/settings-profile.tsx": [
    ["initialValue=\"hi@mertcan.works\"", "initialValue=\"alex@example.com\""],
    ["initialValue=\"Mertcan\"", "initialValue=\"Alex\""],
    ["<SettingsRow label=\"BoardUI account\">", "<SettingsRow label=\"Account\">"],
  ],
  "blocks/auth/auth-card.tsx": [
    ["\"Start building with BoardUI in a couple of minutes.\"", "\"Start building in a couple of minutes.\""],
    ["bg-surface shadow-raised md:grid-cols-2 dark:bg-sunken", "bg-auth-card shadow-raised md:grid-cols-2"],
    ["bg-surface p-6 shadow-raised sm:p-8 dark:bg-sunken", "bg-auth-card p-6 shadow-raised sm:p-8"],
  ],
  "blocks/settings/settings-general.tsx": [
    [">Inside BoardUI</SelectItem>", ">Inside the app</SelectItem>"],
    ["when BoardUI messages you", "when the app messages you"],
  ],
  "blocks/settings/settings-tools.tsx": [
    ["{ id: \"boardui\", label: \"boardui\",", "{ id: \"acme\", label: \"acme\","],
  ],
  "blocks/theme-toggle/theme-toggle.tsx": [
    ["export const THEME_STORAGE_KEY = \"boardui:theme\";", "export const THEME_STORAGE_KEY = \"ds-theme\";"],
    ["export const THEME_CHANGE_EVENT = \"boardui:theme-change\";", "export const THEME_CHANGE_EVENT = \"ds:theme-change\";"],
    ["const THEME_TRANSITION_STYLE_ID = \"boardui-theme-transition-style\";", "const THEME_TRANSITION_STYLE_ID = \"ds-theme-transition-style\";"],
    ["document.documentElement.classList.toggle(\"dark\", theme === \"dark\");", "document.documentElement.dataset.theme = theme;"],
    ["return document.documentElement.classList.contains(\"dark\") ? \"dark\" : \"light\";", "const set = document.documentElement.dataset.theme;\n  if (set === \"dark\" || set === \"light\") return set;\n  return window.matchMedia(\"(prefers-color-scheme: dark)\").matches ? \"dark\" : \"light\";"],
    ["\"bg-white dark:bg-[#2e2e33]\"", "\"bg-surface\""],
    ["\"text-black dark:text-on-action\"", "\"text-fg\""],
    ["\"text-black/45 hover:text-black/70 dark:text-white/45 dark:hover:text-white/70\"", "\"text-fg-tertiary hover:text-fg-secondary\""],
  ],
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

// Free blocks and charts (components/application in BoardUI).
const APPLICATION = {
  "agent-thinking/agent-thinking.tsx": "blocks/agent-thinking/agent-thinking.tsx",
  "composer-loader/composer-loader.tsx": "blocks/composer-loader/composer-loader.tsx",
  "auth/auth-card.tsx": "blocks/auth/auth-card.tsx",
  "auth/auth-media-carousel.tsx": "blocks/auth/auth-media-carousel.tsx",
  "data-grid/data-grid.tsx": "blocks/data-grid/data-grid.tsx",
  "data-grid/data-grid-utils.ts": "blocks/data-grid/data-grid-utils.ts",
  "data-table/data-table.tsx": "blocks/data-table/data-table.tsx",
  "notification-center/notification-center.tsx": "blocks/notification-center/notification-center.tsx",
  "notification-center/notification-center-demo.tsx": "blocks/notification-center/notification-center-demo.tsx",
  "settings/plan-art-flame.tsx": "blocks/settings/plan-art-flame.tsx",
  "settings/settings-general.tsx": "blocks/settings/settings-general.tsx",
  "settings/settings-modal.tsx": "blocks/settings/settings-modal.tsx",
  "settings/settings-profile.tsx": "blocks/settings/settings-profile.tsx",
  "settings/settings-rows.tsx": "blocks/settings/settings-rows.tsx",
  "settings/settings-storage.tsx": "blocks/settings/settings-storage.tsx",
  "settings/settings-tools.tsx": "blocks/settings/settings-tools.tsx",
  "dashboard/dashboard-sidebar.tsx": "blocks/sidebar/dashboard-sidebar.tsx",
  "dashboard/dashboard-team-menu.tsx": "blocks/sidebar/dashboard-team-menu.tsx",
  "dashboard/dashboard-user-menu.tsx": "blocks/sidebar/dashboard-user-menu.tsx",
  "dashboard/stat-cards.tsx": "blocks/stat-cards/stat-cards.tsx",
  "theme/theme-toggle.tsx": "blocks/theme-toggle/theme-toggle.tsx",
  "dashboard/revenue-chart-card.tsx": "charts/revenue-chart/revenue-chart-card.tsx",
  "dashboard/orders-chart-card.tsx": "charts/revenue-chart/orders-chart-card.tsx",
};
for (const [from, to] of Object.entries(APPLICATION)) FILES[`components/application/${from}`] = to;
FILES["hooks/use-count-up.ts"] = "hooks/use-count-up.ts";

/**
 * Strict-mode fixes for the blocks (this repo enables noUncheckedIndexedAccess),
 * and BoardUI's Button size names where blocks read the style map directly.
 * Merged into PATCHES so files can carry both kinds.
 */
const STRICT_PATCHES = {
  "blocks/composer-loader/composer-loader.tsx": [["hexTriplet(c2)[i]", "hexTriplet(c2)[i]!"]],
  "blocks/data-grid/data-grid-utils.ts": [
    ["rows[rows.length - 1].push(field);", "rows[rows.length - 1]!.push(field);"],
    ["rows[rows.length - 1].push(field);", "rows[rows.length - 1]!.push(field);"],
    ['rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === ""', 'rows[rows.length - 1]!.length === 1 && rows[rows.length - 1]![0] === ""'],
  ],
  "blocks/data-grid/data-grid.tsx": [
    ["buttonStyles.size.small, buttonStyles.iconOnlySize.small", "buttonStyles.size.sm, buttonStyles.iconOnlySize.sm"],
    ["buttonStyles.icon.small", "buttonStyles.icon.sm"],
    ["{options[column.key].filter(", "{(options[column.key] ?? []).filter("],
    ["getRowId(data[0]), columnKey: columns[0].key", "getRowId(data[0]!), columnKey: columns[0]!.key"],
    ["([entry]) => setViewportWidth(entry.contentRect.width)", "([entry]) => entry && setViewportWidth(entry.contentRect.width)"],
    ["rows[r][visibleColumns[c].key]", "rows[r]![visibleColumns[c]!.key]"],
    ["getRowId(rows[r]), columnKey: visibleColumns[c].key", "getRowId(rows[r]!), columnKey: visibleColumns[c]!.key"],
    ["(freezeFirstColumn ? columnWidths[0] : 0)", "(freezeFirstColumn ? columnWidths[0]! : 0)"],
    [
      "start + columnWidths[c] > offset + body.clientWidth) body.scrollLeft = (direction === \"rtl\" ? -1 : 1) * (start + columnWidths[c] - body.clientWidth)",
      "start + columnWidths[c]! > offset + body.clientWidth) body.scrollLeft = (direction === \"rtl\" ? -1 : 1) * (start + columnWidths[c]! - body.clientWidth)",
    ],
    [
      "anchor: { rowId: getRowId(rows[0]), columnKey: visibleColumns[0].key }, focus: { rowId: getRowId(rows[rows.length - 1]), columnKey: visibleColumns[visibleColumns.length - 1].key }",
      "anchor: { rowId: getRowId(rows[0]!), columnKey: visibleColumns[0]!.key }, focus: { rowId: getRowId(rows[rows.length - 1]!), columnKey: visibleColumns[visibleColumns.length - 1]!.key }",
    ],
    ["c < matrix[r].length", "c < matrix[r]!.length"],
    ["parseGridValue(matrix[r][c], column)", "parseGridValue(matrix[r]![c]!, column)"],
    ["resizeColumn(column.key, columnWidths[c] + (", "resizeColumn(column.key, columnWidths[c]! + ("],
    ["width = columnWidths[c];", "width = columnWidths[c]!;"],
    ['{summary === null ? "—" :', '{summary == null ? "—" :'],
  ],
  "blocks/data-table/data-table.tsx": [
    ["const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];", "const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)]!;"],
    ["name: PHOTO_PEOPLE[i].name, avatar: PHOTO_PEOPLE[i].avatar", "name: PHOTO_PEOPLE[i]!.name, avatar: PHOTO_PEOPLE[i]!.avatar"],
    ["?? PRICE_BUCKETS[0];", "?? PRICE_BUCKETS[0]!;"],
    ["table.getHeaderGroups()[0].headers", "table.getHeaderGroups()[0]!.headers"],
  ],
  "blocks/settings/settings-storage.tsx": [
    ["const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];", "const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)]!;"],
    ["{ ...pinned[i], id:", "{ ...pinned[i]!, id:"],
  ],
  "blocks/settings/settings-tools.tsx": [
    ["const SERVERS: Record<string, McpServer> = {", "const SERVERS = {"],
    [
      "};\n\n/** Per-scope server lists — switching a pill swaps the section below. */",
      "} satisfies Record<string, McpServer>;\n\n/** Per-scope server lists — switching a pill swaps the section below. */",
    ],
    ["?? SCOPES[0];", "?? SCOPES[0]!;"],
    ['{ id: "bereal", label: "BeReal Task",', '{ id: "daily", label: "Daily Task",'],
  ],
};
for (const [file, patches] of Object.entries(STRICT_PATCHES)) (PATCHES[file] ??= []).push(...patches);

// The free data-grid docs example doubles as the block's ready-made demo.
IMPORTS["@/components/application/data-grid/data-grid"] = "blocks/data-grid/data-grid";
FILES["components/application/docs/examples/data-grid-example.tsx"] = "blocks/data-grid/data-grid-example.tsx";
(PATCHES["blocks/data-grid/data-grid-example.tsx"] ??= []).push([
  "owner: OWNERS[(i * 3) % OWNERS.length], region: REGIONS[(i * 7) % REGIONS.length], stage: STAGES[(i * 13) % STAGES.length]",
  "owner: OWNERS[(i * 3) % OWNERS.length]!, region: REGIONS[(i * 7) % REGIONS.length]!, stage: STAGES[(i * 13) % STAGES.length]!",
]);
PATCHES["blocks/sidebar/dashboard-user-menu.tsx"].push([
  '<Avatar size="md" color="neutral" initials="M" className={avatarClassName} />',
  '<Avatar size="md" color="neutral" initials="A" className={avatarClassName} />',
]);

/**
 * The editorial theme: ported files restyled away from BoardUI's look (filled
 * inputs, pill keycaps). Applied after the other patches on every run.
 */
const THEME_PATCHES = {
  "components/input/input.tsx": [
    [
      "    \"rounded-2lg\",\n    \"bg-muted text-icon-tertiary\",\n    \"ring-2 ring-inset ring-transparent\",",
      "    \"rounded-2lg\",\n    \"bg-surface text-icon-tertiary\",\n    \"ring-1 ring-inset ring-line-control\","
    ],
    [
      "            \"ring-line-hover\",",
      "            \"ring-line-control-hover\","
    ],
    [
      "            \"ring-line-pressed\",",
      "            \"ring-2 ring-focus\","
    ]
  ],
  "components/textarea/textarea.tsx": [
    [
      "    \"rounded-2lg\",\n    \"bg-muted text-icon-tertiary\",\n    \"ring-2 ring-inset ring-transparent\",",
      "    \"rounded-2lg\",\n    \"bg-surface text-icon-tertiary\",\n    \"ring-1 ring-inset ring-line-control\","
    ],
    [
      "            \"ring-line-hover\",",
      "            \"ring-line-control-hover\","
    ],
    [
      "            \"ring-line-pressed\",",
      "            \"ring-2 ring-focus\","
    ]
  ],
  "components/kbd/kbd.tsx": [
    [
      "inline-flex items-center justify-center rounded-full bg-kbd",
      "inline-flex items-center justify-center rounded-xs bg-kbd"
    ]
  ]
};
for (const [file, patches] of Object.entries(THEME_PATCHES)) (PATCHES[file] ??= []).push(...patches);
