import { useEffect, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { RiCloseLine, RiMenuLine, RiMoonLine, RiSearchLine, RiSunLine } from "@remixicon/react";
import { BRANDS, CommandGroup, CommandItem, CommandPalette, IconButton, Kbd, cx, focusRingNative, useTheme } from "@ds/react";
import type { IconComponent, ThemeChoice } from "@ds/react";
import { GROUPS } from "../showcase/catalog";
import { DocsNav } from "./docs-nav";
import { NAV, entriesIn } from "./routes";
import type { Route } from "./routes";

/* -------------------------------------------------------------------------- */
/*                                    Theme                                   */
/* -------------------------------------------------------------------------- */

/** Light or dark, chosen outright: the site doesn't follow the OS. */
const THEMES: { id: ThemeChoice; label: string; icon: IconComponent }[] = [
  { id: "light", label: "Light", icon: RiSunLine },
  { id: "dark", label: "Dark", icon: RiMoonLine },
];

function ThemeSwitch({ className }: { className?: string }) {
  // From the library's ThemeProvider, so the header and the menu sheet share one choice.
  const { theme, setTheme } = useTheme();
  return (
    <div role="group" aria-label="Theme" className={cx("flex items-center rounded-control-md border border-line p-0.5", className)}>
      {THEMES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-pressed={theme === id}
          // The new theme spreads out from the click (or the button's centre, from the keyboard).
          onClick={(event) => {
            const r = event.currentTarget.getBoundingClientRect();
            setTheme(id, event.detail ? { x: event.clientX, y: event.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 });
          }}
          className={cx(
            "flex size-7 items-center justify-center rounded-xs transition-colors",
            theme === id ? "bg-fg text-canvas" : "text-fg-secondary hover:text-fg",
            focusRingNative,
          )}
        >
          <Icon aria-hidden className="size-4" />
        </button>
      ))}
    </div>
  );
}

/** Windesign, Moon or Glass: every component restyles, and the change spreads out from the click. */
function BrandSwitch({ className }: { className?: string }) {
  const { brand, setBrand } = useTheme();
  return (
    <div role="group" aria-label="Brand" className={cx("flex items-center rounded-control-md border border-line p-0.5", className)}>
      {BRANDS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={brand === id}
          onClick={(event) => {
            const r = event.currentTarget.getBoundingClientRect();
            setBrand(id, event.detail ? { x: event.clientX, y: event.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 });
          }}
          className={cx(
            "flex h-7 items-center rounded-xs px-2 text-body-sm transition-colors",
            brand === id ? "bg-fg text-canvas" : "text-fg-secondary hover:text-fg",
            focusRingNative,
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Search                                   */
/* -------------------------------------------------------------------------- */

const isApple = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** Site search, on the system's own command palette. */
export function SiteSearch({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      shortcut="k"
      aria-label="Search the docs"
      placeholder="Search components, blocks, charts…"
      onAction={(key) => {
        window.location.hash = `#/components/${String(key)}`;
      }}
    >
      {GROUPS.map((group) => (
        <CommandGroup key={group.name} title={group.name}>
          {entriesIn(group.name).map((entry) => (
            <CommandItem key={entry.slug} id={entry.slug} description={entry.summary} keywords={[group.name, ...(entry.aliases ?? [])]}>
              {entry.name}
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </CommandPalette>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

export function Wordmark() {
  return (
    <a href="#/" className={cx("flex items-baseline gap-1.5 rounded-xs", focusRingNative)}>
      <span className="font-display text-title-md-strong text-fg">Windesign</span>
      <span className="font-mono text-caption tracking-wide text-accent-600 uppercase">ds</span>
    </a>
  );
}

export function SiteHeader({ route }: { route: Route }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Any navigation closes the menu sheet.
  useEffect(() => setMenuOpen(false), [route]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/92 [backdrop-filter:var(--ds-effect-glass-panel)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Wordmark />

        <nav aria-label="Sections" className="hidden flex-1 items-center gap-6 lg:flex">
          {NAV.map((item) => {
            const current = item.matches(route);
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cx(
                  "rounded-xs py-1 text-body-md transition-colors",
                  current ? "text-fg underline decoration-accent-500 decoration-2 underline-offset-8" : "text-fg-secondary hover:text-fg",
                  focusRingNative,
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-keyshortcuts="Meta+K Control+K"
            className={cx(
              "flex h-9 items-center gap-2 rounded-control-md border border-line-control bg-surface ps-2.5 pe-1.5 text-body-sm text-fg-secondary transition-colors hover:text-fg",
              focusRingNative,
            )}
          >
            <RiSearchLine aria-hidden className="size-4" />
            <span className="hidden sm:inline">Search</span>
            <Kbd className="hidden px-1.5 sm:inline-flex lg:hidden xl:inline-flex">{isApple() ? "⌘K" : "Ctrl K"}</Kbd>
          </button>
          <BrandSwitch className="hidden lg:flex" />
          <ThemeSwitch className="hidden sm:flex" />
          <IconButton icon={RiMenuLine} size="small" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="lg:hidden" />
        </div>
      </div>

      <SiteSearch isOpen={searchOpen} onOpenChange={setSearchOpen} />

      {/* Small screens: the top links, then the same contents tree as the sidebar, in a full-height sheet. */}
      <ModalOverlay
        isOpen={menuOpen}
        onOpenChange={setMenuOpen}
        isDismissable
        className="fixed inset-0 z-50 bg-scrim transition-opacity data-[entering]:opacity-0 data-[exiting]:opacity-0 lg:hidden"
      >
        <Modal className="fixed inset-y-0 end-0 w-full max-w-sm bg-canvas transition-transform duration-(--ds-motion-duration-slow) ease-enter data-[entering]:translate-x-full data-[exiting]:translate-x-full rtl:data-[entering]:-translate-x-full rtl:data-[exiting]:-translate-x-full motion-reduce:transition-none">
          <Dialog aria-label="Menu" data-docs-scroll className="flex h-full flex-col gap-6 overflow-y-auto p-5">
            {/* Pinned: the sheet scrolls to the current page, and on a phone it fills the screen, so this is the only way out. */}
            <div className="sticky -top-5 z-10 -mx-5 -mt-5 flex items-center justify-between border-b border-line bg-canvas px-5 py-3">
              <Wordmark />
              <IconButton icon={RiCloseLine} size="small" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <BrandSwitch />
              <ThemeSwitch />
            </div>
            <nav aria-label="Sections">
              <ol className="flex flex-col">
                {NAV.map((item, i) => (
                  <li key={item.label} className="border-b border-line">
                    <a href={item.href} aria-current={item.matches(route) ? "page" : undefined} className={cx("flex items-baseline gap-4 py-3", focusRingNative)}>
                      <span className="font-mono text-caption text-fg-secondary">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-display text-title-sm-emphasis text-fg">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <DocsNav route={route} />
          </Dialog>
        </Modal>
      </ModalOverlay>
    </header>
  );
}
