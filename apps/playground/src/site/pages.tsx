import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  RiAccessibilityLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiBrushLine,
  RiContrast2Line,
  RiDropLine,
  RiExternalLinkLine,
  RiLayoutMasonryLine,
  RiPaletteLine,
  RiSearchLine,
  RiShapesLine,
  RiStackLine,
} from "@remixicon/react";
import {
  BRANDS,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Checkbox,
  Chip,
  CodeBlock,
  EmptyState,
  Input,
  Link,
  LinkButton,
  SearchField,
  SegmentedControl,
  SegmentedControlItem,
  Switch,
  TableOfContents,
  cx,
  focusRingNative,
} from "@windesign-ds/react";
import type { IconComponent } from "@windesign-ds/react";
import { CATALOG, GROUPS, findEntry } from "../showcase/catalog";
import type { CatalogEntry, Group } from "../showcase/catalog";
import { AccentSection } from "./accent-section";
import { InstallCommand, cliCommand, installCommand } from "./install-command";
import { sourceUrl } from "./meta";
import { BRAND_GROUPS, COMPONENT_GROUPS, PATTERN_GROUPS, entriesIn, groupSlug } from "./routes";

/* -------------------------------------------------------------------------- */
/*                                    Parts                                   */
/* -------------------------------------------------------------------------- */

/** Page container with the site's margins. */
function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto flex w-full max-w-6xl flex-col px-5 sm:px-8", className)}>{children}</div>;
}

const go = (hash: string) => () => {
  window.location.hash = hash;
};

/** The trail above a page title. The last item is the page itself. */
type Crumb = { label: string; href?: string };

function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumb className="text-body-sm">
      {items.map((item, i) =>
        i === items.length - 1 ? (
          <BreadcrumbItem key={item.label} current>
            {item.label}
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem key={item.label} href={item.href}>
            {item.label}
          </BreadcrumbItem>
        ),
      )}
    </Breadcrumb>
  );
}

/** The crumbs that lead to a group's overview. */
function groupTrail(group: Group): Crumb[] {
  if (group === "Foundations") return [{ label: "Foundations", href: "#/section/foundations" }];
  if (PATTERN_GROUPS.includes(group)) return [{ label: "Patterns" }, { label: group, href: `#/section/${groupSlug(group)}` }];
  if (BRAND_GROUPS.includes(group)) return [{ label: "Brands" }, { label: group, href: `#/section/${groupSlug(group)}` }];
  return [
    { label: "Components", href: "#/components" },
    { label: group, href: `#/section/${groupSlug(group)}` },
  ];
}

function PageHeader({ crumbs, title, lead, children }: { crumbs?: Crumb[]; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4">
      {crumbs && <Crumbs items={crumbs} />}
      <h1 className="text-display-sm font-semibold tracking-tight text-balance text-fg sm:text-display-md">{title}</h1>
      {lead && <p className="max-w-3xl text-body-lg text-pretty text-fg-secondary">{lead}</p>}
      {children}
    </header>
  );
}

/** A section title on the long pages, with an optional action on the right. */
function SectionHeading({ id, title, description, action }: { id: string; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 id={id} className="scroll-mt-24 text-display-sm tracking-tight text-fg">
          {title}
        </h2>
        {description && <p className="text-body-lg text-pretty text-fg-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const NewChip = () => (
  <Chip variant="caption" color="blue">
    New
  </Chip>
);

/**
 * One entry as a card: the live preview on top, then its name and summary.
 * The name's link stretches over the whole card; the preview itself is inert.
 */
function EntryCard({ entry, tall = false }: { entry: CatalogEntry; tall?: boolean }) {
  return (
    <article
      className={cx(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-surface border border-line bg-surface transition-[border-color,box-shadow] duration-(--ds-motion-duration-base)",
        "hover:border-line-control hover:shadow-raised",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus",
      )}
    >
      <div inert className={cx("relative flex items-center justify-center overflow-hidden p-5", tall ? "h-80" : "h-52")}>
        {entry.preview()}
      </div>
      <div className="flex flex-col gap-1 border-t border-line px-4 py-3.5">
        <span className="flex items-center justify-between gap-3">
          <a href={`#/components/${entry.slug}`} className="truncate text-body-md-strong text-fg outline-none after:absolute after:inset-0">
            {entry.name}
          </a>
          <RiArrowRightLine aria-hidden className="size-4 shrink-0 text-icon-secondary opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100" />
        </span>
        <span className="line-clamp-2 text-body-sm text-fg-secondary">{entry.summary}</span>
      </div>
    </article>
  );
}

const WIDE: Group[] = ["Blocks", "Charts", "Templates"];

function CardGrid({ group, entries }: { group: Group; entries: CatalogEntry[] }) {
  return (
    // grid-cols-1 is minmax(0, 1fr): a wide preview is clipped by its card instead of widening the page on phones.
    <div className={cx("grid grid-cols-1 gap-5", WIDE.includes(group) ? "lg:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
      {entries.map((entry) => (
        <EntryCard key={entry.slug} entry={entry} tall={group === "Templates"} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Home                                    */
/* -------------------------------------------------------------------------- */

/** A small form made of live components, so the first screen shows the system working. */
function HeroSpecimen() {
  return (
    <div className="flex flex-col overflow-hidden rounded-surface border border-line bg-surface shadow-raised">
      <div className="flex flex-col gap-0.5 border-b border-line px-5 py-4">
        <span className="text-body-md-strong text-fg">New project</span>
        <span className="text-body-sm text-fg-secondary">Every control here is a live component.</span>
      </div>
      <div className="flex flex-col gap-5 p-5">
        <Input label="Project name" defaultValue="Atlas redesign" />
        <div className="flex flex-col gap-2">
          <span className="text-body-sm-strong text-fg">Plan</span>
          <SegmentedControl aria-label="Plan" defaultSelectedKeys={["team"]}>
            <SegmentedControlItem id="solo">Solo</SegmentedControlItem>
            <SegmentedControlItem id="team">Team</SegmentedControlItem>
            <SegmentedControlItem id="company">Company</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <div className="flex flex-col gap-3">
          <Switch defaultSelected>Notify the team</Switch>
          <Checkbox defaultSelected>Add the starter templates</Checkbox>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
        <Button variant="secondary" size="sm">
          Cancel
        </Button>
        <Button size="sm">Create project</Button>
      </div>
    </div>
  );
}

const componentCount = CATALOG.filter((e) => COMPONENT_GROUPS.includes(e.group)).length;
const patternCount = PATTERN_GROUPS.reduce((n, g) => n + entriesIn(g).length, 0);

function Stats() {
  const stats: [string, number, string][] = [
    ["Components", componentCount, `in ${COMPONENT_GROUPS.length} categories`],
    ["Patterns", patternCount, "blocks, charts and templates"],
    ["Foundations", entriesIn("Foundations").length, "guides to the tokens"],
    ["Brands", BRANDS.length, "each in light and dark"],
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-surface border border-line bg-line lg:grid-cols-4">
      {stats.map(([label, value, note]) => (
        <div key={label} className="flex flex-col gap-1 bg-surface p-5 sm:p-6">
          <dt className="text-body-sm-strong text-fg-secondary">{label}</dt>
          <dd className="text-display-sm text-fg tabular-nums">{value}</dd>
          <dd className="text-body-sm text-fg-secondary">{note}</dd>
        </div>
      ))}
    </dl>
  );
}

type Area = { title: string; href: string; icon: IconComponent; text: string; links: Crumb[] };

const AREAS: Area[] = [
  {
    title: "Foundations",
    href: "#/section/foundations",
    icon: RiPaletteLine,
    text: "Colour, type, space, corners, depth and motion: the tokens every component is built from.",
    links: [
      { label: "Color", href: "#/components/color" },
      { label: "Typography", href: "#/components/typography" },
      { label: "Theming", href: "#/components/theming" },
    ],
  },
  {
    title: "Components",
    href: "#/components",
    icon: RiShapesLine,
    text: `${componentCount} controls and patterns for forms, navigation, feedback, overlays and data.`,
    links: [
      { label: "Button", href: "#/components/button" },
      { label: "Select", href: "#/components/select" },
      { label: "Command Palette", href: "#/components/command-palette" },
    ],
  },
  {
    title: "Patterns",
    href: "#/section/blocks",
    icon: RiLayoutMasonryLine,
    text: "Blocks, charts and whole-screen templates assembled from the components.",
    links: PATTERN_GROUPS.map((g) => ({ label: g, href: `#/section/${groupSlug(g)}` })),
  },
  {
    title: "Brands",
    href: "#/section/glass",
    icon: RiBrushLine,
    text: "Moon and Glass restyle every component through tokens. Try them with the switch in the header.",
    links: BRAND_GROUPS.map((g) => ({ label: g, href: `#/section/${groupSlug(g)}` })),
  },
];

function Explore() {
  return (
    <section aria-labelledby="explore" className="flex flex-col gap-8">
      <SectionHeading id="explore" title="Explore the system" description="Four parts, from the tokens up to whole screens." />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {AREAS.map(({ title, href, icon: AreaIcon, text, links }) => (
          <div key={title} className="flex flex-col gap-5 rounded-surface border border-line bg-surface p-6 transition-[border-color,box-shadow] hover:border-line-control hover:shadow-raised">
            <span aria-hidden className="flex size-10 items-center justify-center rounded-control-md bg-muted text-icon">
              <AreaIcon className="size-5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-title-sm-strong text-fg">
                <a href={href} className={cx("rounded-xs hover:underline hover:decoration-1 hover:underline-offset-4", focusRingNative)}>
                  {title}
                </a>
              </h3>
              <p className="text-body-md text-fg-secondary">{text}</p>
            </div>
            <ul className="mt-auto flex flex-col border-t border-line pt-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={cx("group flex items-center justify-between rounded-xs py-1.5 text-body-sm text-fg-secondary transition-colors hover:text-fg", focusRingNative)}
                  >
                    {link.label}
                    <RiArrowRightSLine aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS: { title: string; text: string; file: string; language: string; code: string }[] = [
  {
    title: "Add the styles",
    text: "Import Tailwind, then the system's theme. It swaps Tailwind's palette for semantic colours, radii, shadows and text styles.",
    file: "src/styles.css",
    language: "css",
    code: `@import "tailwindcss";
@import "@windesign-ds/styles/fonts.css";
@import "@windesign-ds/styles/tailwind.css";

/* Let Tailwind see the classes the components use. */
@source "../node_modules/@windesign-ds/react/dist";`,
  },
  {
    title: "Wrap the app",
    text: "ThemeProvider applies the theme, brand and accent, and remembers each choice between visits.",
    file: "src/main.tsx",
    language: "tsx",
    code: `import { ThemeProvider } from "@windesign-ds/react";
import "./styles.css";

createRoot(root).render(
  <ThemeProvider defaultTheme="light">
    <App />
  </ThemeProvider>,
);`,
  },
  {
    title: "Use the components",
    text: "Import from @windesign-ds/react. Behaviour comes from React Aria, so keyboard and screen reader support come with it.",
    file: "src/save-bar.tsx",
    language: "tsx",
    code: `import { Button } from "@windesign-ds/react";

export function SaveBar({ onSave }: { onSave: () => void }) {
  return <Button onPress={onSave}>Save changes</Button>;
}`,
  },
];

function QuickStart() {
  return (
    <section aria-labelledby="quick-start" className="flex flex-col gap-8">
      <SectionHeading
        id="quick-start"
        title="Quick start"
        description="Install @windesign-ds/react and @windesign-ds/styles from npm (Tailwind CSS v4 and React 19), then three steps put them in an app. Or copy single components in as source with npx windesign-ds@latest add <name>."
      />
      <ol className="flex flex-col">
        {STEPS.map((step, i) => (
          // The numbers sit on a rule that runs down to the next step.
          <li key={step.title} className="relative grid grid-cols-1 gap-4 ps-12 pb-10 last:pb-0 lg:grid-cols-12 lg:gap-8">
            {i < STEPS.length - 1 && <span aria-hidden className="absolute start-3.5 top-9 bottom-1 border-s border-line" />}
            <span
              aria-hidden
              className="absolute start-0 top-0 flex size-7 items-center justify-center rounded-full border border-line-control bg-canvas text-body-sm-strong text-fg tabular-nums"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-2 lg:col-span-4">
              <h3 className="text-body-md-strong text-fg">{step.title}</h3>
              <p className="text-body-md text-fg-secondary">{step.text}</p>
            </div>
            <CodeBlock code={step.code} title={step.file} language={step.language} className="lg:col-span-8" />
          </li>
        ))}
      </ol>
    </section>
  );
}

const PRINCIPLES: { icon: IconComponent; title: string; text: string }[] = [
  {
    icon: RiAccessibilityLine,
    title: "Accessible by default",
    text: "Interactive parts wrap React Aria, so focus, keyboard and screen reader behaviour are built in, with one focus ring everywhere.",
  },
  {
    icon: RiDropLine,
    title: "Styled only through tokens",
    text: "Components use semantic colours, radius roles, elevation and text styles. No hex values, no palette classes, no one-off sizes.",
  },
  {
    icon: RiStackLine,
    title: "Themes and brands remap tokens",
    text: "Light, dark and each brand swap token values. Components never branch on theme or brand, so a new look needs no component changes.",
  },
  {
    icon: RiContrast2Line,
    title: "Contrast is tested",
    text: "Every text and background pairing is listed and checked for contrast in each theme and brand as part of the token tests.",
  },
];

function Principles() {
  return (
    <section aria-labelledby="principles" className="flex flex-col gap-8">
      <SectionHeading id="principles" title="How it's built" description="The rules every component follows, checked in the repository's tests and agent guide." />
      <ul className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map(({ icon: PrincipleIcon, title, text }) => (
          <li key={title} className="flex flex-col gap-3">
            <PrincipleIcon aria-hidden className="size-6 text-accent-600" />
            <h3 className="text-body-md-strong text-fg">{title}</h3>
            <p className="text-body-md text-fg-secondary">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const FEATURED = ["button", "select", "date-range-picker", "toast", "revenue-chart", "command-palette"];

export function HomePage() {
  const featured = FEATURED.map(findEntry).filter((e): e is CatalogEntry => !!e);
  const glassCount = entriesIn("Glass").length;
  return (
    <div className="flex flex-col">
      <section aria-labelledby="hero" className="border-b border-line">
        <Page className="grid grid-cols-1 gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:items-center lg:py-24">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <a
              href="#/section/glass"
              className={cx(
                "group flex items-center gap-2 rounded-full border border-line bg-surface py-1 ps-1 pe-3 text-body-sm text-fg-secondary transition-colors hover:border-line-control hover:text-fg",
                focusRingNative,
              )}
            >
              <NewChip />
              Glass brand: {glassCount} components on Liquid Glass
              <RiArrowRightLine aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
            </a>
            <h1 id="hero" className="text-display-md font-semibold tracking-tight text-balance text-fg sm:text-display-lg">
              Build accessible React interfaces on one set of tokens
            </h1>
            <p className="max-w-xl text-body-lg text-pretty text-fg-secondary">
              Windesign is a design system of {CATALOG.length} components, blocks, charts and templates. Behaviour comes from React Aria, every style comes
              from tokens, and light, dark, three brands and any accent colour work without touching component code.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                trailingIcon={RiArrowRightLine}
                onPress={() => document.getElementById("quick-start")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Get started
              </Button>
              <Button variant="secondary" onPress={go("#/components")}>
                Browse components
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <HeroSpecimen />
          </div>
        </Page>
      </section>

      <Page className="gap-20 py-16 sm:gap-24 sm:py-20">
        <Stats />
        <Explore />
        <QuickStart />
        <Principles />
        <AccentSection />
        <section aria-labelledby="featured" className="flex flex-col gap-8">
          <SectionHeading
            id="featured"
            title="Popular components"
            description="A few of the most used pieces. Every card is the live component."
            action={
              <LinkButton href="#/components" variant="secondary" trailingIcon={RiArrowRightLine}>
                All components
              </LinkButton>
            }
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((entry) => (
              <EntryCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </section>
      </Page>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Contents pages                               */
/* -------------------------------------------------------------------------- */

const matches = (entry: CatalogEntry, query: string) =>
  !query || [entry.name, entry.summary, entry.group, ...(entry.aliases ?? [])].some((text) => text.toLowerCase().includes(query));

/** One group on the all-components page: its heading, then its cards. */
function GroupSection({ group, entries }: { group: Group; entries: CatalogEntry[] }) {
  const blurb = GROUPS.find((g) => g.name === group)?.blurb;
  const id = `group-${groupSlug(group)}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="flex items-center gap-2 text-title-md-strong text-fg">
            {group}
            <Badge>{entries.length}</Badge>
          </h2>
          {blurb && <p className="text-body-md text-fg-secondary">{blurb}</p>}
        </div>
        <LinkButton href={`#/section/${groupSlug(group)}`} variant="secondary" size="small" trailingIcon={RiArrowRightLine} className="shrink-0">
          Overview
        </LinkButton>
      </div>
      <CardGrid group={group} entries={entries} />
    </section>
  );
}

export function ContentsPage({ groups, title, lead, crumbs }: { groups: Group[]; title: string; lead: string; crumbs?: Crumb[] }) {
  const [filter, setFilter] = useState("");
  const query = filter.trim().toLowerCase();
  const total = groups.reduce((n, g) => n + entriesIn(g).length, 0);
  const shown = groups.map((group) => ({ group, entries: entriesIn(group).filter((e) => matches(e, query)) })).filter((g) => g.entries.length);
  const found = shown.reduce((n, g) => n + g.entries.length, 0);

  return (
    <Page className="gap-10 py-8 sm:py-10">
      <PageHeader crumbs={crumbs} title={title} lead={lead} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField aria-label={`Filter ${title}`} placeholder={`Filter ${total} pages…`} value={filter} onChange={setFilter} className="w-full sm:max-w-xs" />
        <p aria-live="polite" className="text-body-sm text-fg-secondary tabular-nums">
          {query ? `${found} of ${total} shown` : `${total} ${total === 1 ? "page" : "pages"}`}
        </p>
      </div>
      {shown.length === 0 ? (
        <EmptyState
          icon={RiSearchLine}
          variant="ruled"
          title="Nothing matches"
          description={`No page in ${title} matches “${filter.trim()}”. Try a shorter word or another name for it.`}
          actions={
            <Button variant="secondary" size="sm" onPress={() => setFilter("")}>
              Clear the filter
            </Button>
          }
        />
      ) : groups.length === 1 ? (
        <CardGrid group={groups[0]!} entries={shown[0]!.entries} />
      ) : (
        <div className="flex flex-col gap-14">
          {shown.map(({ group, entries }) => (
            <GroupSection key={group} group={group} entries={entries} />
          ))}
        </div>
      )}
    </Page>
  );
}

/** The crumbs for a group's overview page. */
export const sectionCrumbs = (group: Group): Crumb[] => {
  const trail = groupTrail(group);
  return [...trail.slice(0, -1), { label: group }];
};

/* -------------------------------------------------------------------------- */
/*                                   Detail                                   */
/* -------------------------------------------------------------------------- */

function Details({ entry, source }: { entry: CatalogEntry; source?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-caption tracking-wide text-fg-secondary uppercase">Details</p>
      <dl className="flex flex-col gap-3 text-body-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-fg-secondary">Category</dt>
          <dd>
            <Link href={`#/section/${groupSlug(entry.group)}`} variant="quiet" className="text-body-sm text-fg">
              {entry.group}
            </Link>
          </dd>
        </div>
        {entry.imports.length > 0 && (
          <div className="flex flex-col gap-1">
            <dt className="text-fg-secondary">Exports</dt>
            <dd className="flex flex-wrap gap-1">
              {entry.imports.map((name) => (
                <code key={name} className="rounded-xs bg-muted px-1 font-code text-caption text-fg">
                  {name}
                </code>
              ))}
            </dd>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <dt className="text-fg-secondary">Package</dt>
          <dd className="font-code text-caption text-fg">@windesign-ds/react</dd>
        </div>
        {source && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-fg-secondary">Source</dt>
            <dd>
              <Link href={source} target="_blank" rel="noreferrer" variant="quiet" isExternal className="text-body-sm text-fg">
                GitHub
              </Link>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function PrevNext({ entry }: { entry: CatalogEntry }) {
  const index = CATALOG.indexOf(entry);
  const previous = CATALOG[index - 1];
  const next = CATALOG[index + 1];
  const card = "group flex flex-col gap-1 rounded-surface border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-line-control hover:shadow-raised";
  return (
    <nav aria-label="Previous and next" className="grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2">
      {previous ? (
        <a href={`#/components/${previous.slug}`} className={cx(card, focusRingNative)}>
          <span className="flex items-center gap-1.5 text-body-sm text-fg-secondary">
            <RiArrowLeftLine aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5 rtl:-scale-x-100" /> Previous
          </span>
          <span className="text-body-md-strong text-fg">{previous.name}</span>
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a href={`#/components/${next.slug}`} className={cx(card, "items-end text-end", focusRingNative)}>
          <span className="flex items-center gap-1.5 text-body-sm text-fg-secondary">
            Next <RiArrowRightLine aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
          </span>
          <span className="text-body-md-strong text-fg">{next.name}</span>
        </a>
      )}
    </nav>
  );
}

export function DetailPage({ entry }: { entry: CatalogEntry }) {
  const article = useRef<HTMLElement>(null);
  const Demo = entry.demo ?? entry.preview;
  const isFoundation = entry.group === "Foundations";
  const isTemplate = entry.group === "Templates";
  const snippet = entry.imports.length ? `import { ${entry.imports.join(", ")} } from "@windesign-ds/react";` : "";
  const source = sourceUrl(entry);
  const siblings = entriesIn(entry.group);
  const at = siblings.indexOf(entry);
  // The next few in the same group, wrapping round, so every page points somewhere new.
  const related = Array.from({ length: Math.min(4, siblings.length - 1) }, (_, i) => siblings[(at + 1 + i) % siblings.length]!);

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-12 px-5 py-8 sm:px-8 sm:py-10">
      <article ref={article} className="flex min-w-0 flex-1 flex-col gap-12">
        <PageHeader
          crumbs={[...groupTrail(entry.group), { label: entry.name }]}
          title={
            <span className="flex flex-wrap items-center gap-3">
              {entry.name}
              {entry.isNew && <NewChip />}
            </span>
          }
          lead={entry.summary}
        >
          {(source || entry.aliases?.length) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {source && (
                <LinkButton href={source} target="_blank" rel="noreferrer" variant="secondary" size="small" trailingIcon={RiExternalLinkLine}>
                  View source
                </LinkButton>
              )}
              {entry.aliases?.length ? <span className="text-body-sm text-fg-secondary">Also called {entry.aliases.join(", ")}</span> : null}
            </div>
          )}
        </PageHeader>

        {isFoundation ? (
          <Demo />
        ) : (
          <section aria-labelledby="preview" className="flex flex-col gap-4">
            <h2 id="preview" className="scroll-mt-20 text-title-md-strong text-fg">
              Preview
            </h2>
            <div className="overflow-hidden rounded-surface border border-line">
              <div className="flex items-center gap-2 border-b border-line bg-sunken px-4 py-2.5 text-body-sm text-fg-secondary">
                <RiPaletteLine aria-hidden className="size-4 shrink-0" />
                Live and interactive. It follows the brand and theme set in the header.
              </div>
              <div className={cx("flex min-h-96 items-center justify-center bg-surface", isTemplate ? "p-0" : "p-6 sm:p-10")}>
                <Demo />
              </div>
            </div>
          </section>
        )}

        {snippet && (
          <section aria-labelledby="installation" className="flex flex-col gap-6">
            <h2 id="installation" className="scroll-mt-20 text-title-md-strong text-fg">
              Installation
            </h2>
            <div className="flex flex-col gap-3">
              <h3 className="text-body-md-strong text-fg">Copy the source into your project</h3>
              <p className="text-body-md text-fg-secondary">
                The CLI copies the component and the files it uses into your project, and installs the npm packages it needs. The code is then yours to change.
              </p>
              <InstallCommand label="Add with the CLI" command={(m) => cliCommand(m, `add ${entry.slug}`)} />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-body-md-strong text-fg">Or install the package</h3>
              <p className="text-body-md text-fg-secondary">Keep the components in node_modules and update them with the package.</p>
              <InstallCommand label="Install the package" command={(m) => installCommand(m, "@windesign-ds/react @windesign-ds/styles")} />
              <CodeBlock code={snippet} language="tsx" />
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related" className="flex flex-col gap-4">
            <h2 id="related" className="scroll-mt-20 text-title-md-strong text-fg">
              More in {entry.group}
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {related.map((other) => (
                <li key={other.slug}>
                  <a
                    href={`#/components/${other.slug}`}
                    className={cx(
                      "group flex h-full flex-col gap-1 rounded-surface border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-line-control hover:shadow-raised",
                      focusRingNative,
                    )}
                  >
                    <span className="flex items-center justify-between gap-3 text-body-md-strong text-fg">
                      {other.name}
                      <RiArrowRightLine aria-hidden className="size-4 shrink-0 text-icon-secondary transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                    </span>
                    <span className="line-clamp-2 text-body-sm text-fg-secondary">{other.summary}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <PrevNext entry={entry} />
      </article>

      <aside aria-label="Page details" className="hidden w-52 shrink-0 xl:block">
        <div className="sticky top-24 flex flex-col gap-8">
          {/* The routes live in the hash, so the contents mustn't write section ids into it. */}
          <TableOfContents containerRef={article} updateHash={false} />
          <Details entry={entry} source={source} />
        </div>
      </aside>
    </div>
  );
}

export function MissingPage({ path }: { path: string }) {
  return (
    <Page className="py-24">
      <EmptyState
        icon={RiSearchLine}
        headingLevel={2}
        title="Page not found"
        description={`There's no page at ${path}. It may have moved; search the docs or start from the home page.`}
        actions={
          <Button variant="secondary" leadingIcon={RiArrowLeftLine} onPress={go("#/")}>
            Back to the home page
          </Button>
        }
      />
    </Page>
  );
}
