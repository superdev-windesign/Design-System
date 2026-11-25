import { useEffect, useRef, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { RiCloseLine, RiGithubLine, RiMenuLine, RiMoonLine, RiSearchLine, RiShapesFill, RiSunLine } from "@remixicon/react";
import {
  BRANDS,
  Badge,
  CommandGroup,
  CommandItem,
  CommandPalette,
  IconButton,
  IconLinkButton,
  Kbd,
  Select,
  SelectItem,
  cx,
  focusRingNative,
  useTheme,
} from "@windesign-ds/react";
import type { Brand } from "@windesign-ds/react";
import { GROUPS } from "../showcase/catalog";
import { DocsNav } from "./docs-nav";
import { HeaderAccount } from "./google-auth";
import { REPO_URL, VERSION } from "./meta";
import { NAV, entriesIn } from "./routes";
import type { Route } from "./routes";

/** Where a theme or brand change spreads from: the click, or the control's centre from the keyboard. */
type Origin = { x: number; y: number };
const centreOf = (el: Element): Origin => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/* -------------------------------------------------------------------------- */
/*                               Theme and brand                              */
/* -------------------------------------------------------------------------- */

/** One button that flips between light and dark. The site doesn't follow the OS. */
function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <IconButton
      icon={dark ? RiSunLine : RiMoonLine}
      size="small"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={(event) => setTheme(dark ? "light" : "dark", event.detail ? { x: event.clientX, y: event.clientY } : centreOf(event.currentTarget))}
      className={className}
    />
  );
}

/**
 * Windesign, Moon or Glass, as a dropdown: every component restyles, and the
 * change spreads out from the control. Each option shows the brand's accent.
 */
function BrandSwitch({ className }: { className?: string }) {
  const { brand, setBrand } = useTheme();
  const control = useRef<HTMLDivElement>(null);
  return (
    <Select
      ref={control}
      aria-label="Brand"
      size="sm"
      selectedKey={brand}
      onSelectionChange={(key) => {
        const next = key as Brand | null;
        if (!next || next === brand) return;
        // The list closes as it changes, so the ripple starts from the control itself.
        setBrand(next, control.current ? centreOf(control.current) : undefined);
      }}
      // Sized to its label, and as tall as the header's other controls.
      className={cx("w-auto", className)}
      triggerClassName="h-8"
    >
      {BRANDS.map(({ id, label, accentColor }) => (
        <SelectItem key={id} id={id} textValue={label}>
          <span className="flex items-center gap-2">
            {/* The brand's own accent, from its token, not the current theme's. */}
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: accentColor }} />
            {label}
          </span>
        </SelectItem>
      ))}
    </Select>
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

function SearchButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="Search docs"
      aria-keyshortcuts="Meta+K Control+K"
      className={cx(
        "flex h-8 items-center gap-2 rounded-control-md border border-line-control bg-surface ps-2.5 pe-1.5 text-body-sm text-fg-secondary transition-colors hover:border-line-control-hover hover:text-fg xl:w-64",
        focusRingNative,
      )}
    >
      <RiSearchLine aria-hidden className="size-4 shrink-0" />
      {/* From lg the header also holds the nav and brand switch: the words return at xl, where there's room. */}
      <span className="hidden whitespace-nowrap sm:inline lg:hidden xl:inline">Search docs…</span>
      <Kbd className="ms-auto hidden px-1.5 sm:inline-flex">{isApple() ? "⌘K" : "Ctrl K"}</Kbd>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

/** The logo: an accent mark, the name and the library version. */
export function Wordmark({ showVersion = true }: { showVersion?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <a href="#/" aria-label="Windesign Design System home" className={cx("flex items-center gap-2.5 rounded-control-sm", focusRingNative)}>
        <span aria-hidden className="flex size-7 items-center justify-center rounded-control-sm bg-accent-600 text-on-action">
          <RiShapesFill className="size-4" />
        </span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-body-md-strong whitespace-nowrap text-fg">Windesign</span>
          <span className="hidden text-body-md whitespace-nowrap text-fg-secondary 2xl:inline">Design System</span>
        </span>
      </a>
      {showVersion && <Badge aria-label={`Version ${VERSION}`}>v{VERSION}</Badge>}
    </span>
  );
}

function GitHubLink({ className }: { className?: string }) {
  return <IconLinkButton icon={RiGithubLine} size="small" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="Source on GitHub" className={className} />;
}

/** True once the page has scrolled off its top, so the header can gain its surface. */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > threshold);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function SiteHeader({ route }: { route: Route }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // At the very top the header is see-through, so the page (the home hero's light) runs up behind it;
  // scrolled, it's a frosted bar with a rule and a soft shadow.
  const scrolled = useScrolled();

  // Any navigation closes the menu sheet.
  useEffect(() => setMenuOpen(false), [route]);

  return (
    <header
      className={cx(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-(--ds-motion-duration-moderate) ease-standard",
        scrolled ? "border-line bg-canvas/92 shadow-raised [backdrop-filter:var(--ds-effect-glass-panel)]" : "border-transparent bg-transparent",
      )}
    >
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6 xl:gap-6">
        <Wordmark />

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const current = item.matches(route);
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cx(
                  "rounded-control-sm px-3 py-1.5 text-body-md whitespace-nowrap transition-colors",
                  current ? "bg-muted text-body-md-strong text-fg" : "text-fg-secondary hover:bg-surface-hover hover:text-fg",
                  item.wide && "hidden xl:block",
                  focusRingNative,
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <SearchButton onPress={() => setSearchOpen(true)} />
          <BrandSwitch className="hidden lg:block" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <GitHubLink className="hidden sm:inline-flex" />
          {/* Settings on the left of the rule, your account on the right. */}
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-line sm:block" />
          <HeaderAccount />
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
            <div className="sticky -top-5 z-10 -mx-5 -mt-5 flex h-14 items-center justify-between border-b border-line bg-canvas px-5">
              <Wordmark showVersion={false} />
              <IconButton icon={RiCloseLine} size="small" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <BrandSwitch />
              <ThemeToggle />
              <GitHubLink />
            </div>
            <nav aria-label="Sections">
              <ul className="flex flex-col gap-0.5">
                {NAV.map((item) => {
                  const current = item.matches(route);
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className={cx(
                          "flex rounded-control-sm px-2.5 py-2 text-body-md-strong transition-colors",
                          current ? "bg-muted text-fg" : "text-fg-secondary hover:bg-surface-hover hover:text-fg",
                          focusRingNative,
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="border-t border-line pt-4">
              <DocsNav route={route} />
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </header>
  );
}
