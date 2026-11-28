import { RiArrowUpLine, RiGithubFill, RiNpmjsFill } from "@remixicon/react";
import { Button, CopyButton, IconLinkButton, Link } from "@windesign-ds/react";
import { REPO_URL, VERSION } from "./meta";

const NPM_URL = "https://www.npmjs.com/package/@windesign-ds/react";
const INSTALL = "npm install @windesign-ds/react @windesign-ds/styles";
import { BRAND_GROUPS, PATTERN_GROUPS, groupSlug } from "./routes";
import { Wordmark } from "./site-header";
import { SignInGate } from "./gated-code";

type FooterLink = { label: string; href: string; external?: boolean };

const RESOURCES: FooterLink[] = [
  { label: "Use with AI", href: "#/ai" },
  { label: "Source on GitHub", href: REPO_URL, external: true },
  { label: "Rules for AI agents", href: `${REPO_URL}/blob/main/AGENTS.md`, external: true },
];

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Foundations",
    links: [
      { label: "Overview", href: "#/section/foundations" },
      { label: "Color", href: "#/components/color" },
      { label: "Typography", href: "#/components/typography" },
      { label: "Theming", href: "#/components/theming" },
    ],
  },
  {
    title: "Components",
    links: [
      { label: "All components", href: "#/components" },
      { label: "Actions", href: "#/section/actions" },
      { label: "Forms", href: "#/section/forms" },
      { label: "Overlays", href: "#/section/overlays" },
    ],
  },
  { title: "Patterns", links: PATTERN_GROUPS.map((g) => ({ label: g, href: `#/section/${groupSlug(g)}` })) },
  { title: "Brands", links: BRAND_GROUPS.map((g) => ({ label: g, href: `#/section/${groupSlug(g)}` })) },
  { title: "Resources", links: RESOURCES },
];

function FooterAnchor({ link }: { link: FooterLink }) {
  return (
    <Link
      href={link.href}
      variant="quiet"
      isExternal={link.external}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className="text-body-sm"
    >
      {link.label}
    </Link>
  );
}

/**
 * The site footer. On the home page it's a full index of the site; beside the
 * docs sidebar, which already lists everything, it's one line.
 */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const credit = (
    <p className="text-body-sm text-fg-secondary">
      Windesign Design System · v{VERSION} · Built on React Aria and design tokens
    </p>
  );

  if (compact)
    return (
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          {credit}
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {RESOURCES.map((link) => (
              <li key={link.label}>
                <FooterAnchor link={link} />
              </li>
            ))}
          </ul>
        </div>
      </footer>
    );

  return (
    <footer className="overflow-hidden border-t border-line bg-sunken">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pt-14 pb-10 sm:px-8 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-5 lg:col-span-4">
          <Wordmark showVersion={false} />
          <p className="max-w-xs text-body-md text-fg-secondary">React components, blocks and templates on React Aria, styled only through design tokens.</p>
          {/* The one line most people need, ready to copy. */}
          <SignInGate compact className="w-full max-w-sm">
            <div className="flex w-full items-center gap-2 rounded-control-md border border-line bg-surface py-1.5 ps-3 pe-1.5">
              <code className="min-w-0 flex-1 truncate font-code text-body-sm text-fg">{INSTALL}</code>
              <CopyButton value={INSTALL} iconOnly label="Copy the install command" size="sm" variant="tertiary" />
            </div>
          </SignInGate>
          <div className="flex items-center gap-2">
            <IconLinkButton icon={RiGithubFill} size="small" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="Source on GitHub" />
            <IconLinkButton icon={RiNpmjsFill} size="small" href={NPM_URL} target="_blank" rel="noreferrer" aria-label="@windesign-ds/react on npm" />
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h2 className="text-body-sm-strong text-fg">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-body-sm text-fg-secondary">
            © {new Date().getFullYear()} Windesign · MIT licence · v{VERSION}
          </p>
          <Button
            variant="tertiary"
            size="sm"
            leadingIcon={RiArrowUpLine}
            onPress={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="self-start sm:self-auto"
          >
            Back to top
          </Button>
        </div>
      </div>
      {/* The name, set large and faint along the bottom edge. SVG text scales with the
          width without a hand-picked font size; it's decoration, so it's hidden from
          assistive tech. */}
      <svg aria-hidden viewBox="0 0 1000 150" className="mx-auto -mb-6 block w-full max-w-6xl px-5 text-line select-none sm:-mb-10 sm:px-8">
        <text x="500" y="135" textAnchor="middle" fontSize={190} className="fill-current font-display" style={{ letterSpacing: "-0.04em" }}>
          Windesign
        </text>
      </svg>
    </footer>
  );
}
