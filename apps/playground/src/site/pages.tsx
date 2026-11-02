import { useState } from "react";
import type { ReactNode } from "react";
import { RiArrowLeftLine, RiArrowRightLine, RiArrowRightUpLine, RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { Button, Tab, TabList, TabPanel, Tabs, cx, focusRing, focusRingNative } from "@ds/react";
import { CATALOG, GROUPS, findEntry } from "../showcase/catalog";
import type { CatalogEntry, Group } from "../showcase/catalog";
import { COMPONENT_GROUPS, entriesIn, entryNumber, groupNumber, groupSlug } from "./routes";

/* -------------------------------------------------------------------------- */
/*                                    Parts                                   */
/* -------------------------------------------------------------------------- */

/** Small mono label above titles: "03 — Selection". */
function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("font-mono text-caption tracking-wide text-fg-secondary uppercase", className)}>{children}</p>;
}

function NewMark() {
  return <span className="font-mono text-micro-emphasis tracking-wide text-accent-600 uppercase">New</span>;
}

/**
 * One entry as a figure: the live preview in a ruled frame, captioned
 * "Fig. 03.2" with its name and summary. The caption's link stretches over
 * the whole figure; the preview itself is inert.
 */
function Figure({ entry, tall = false }: { entry: CatalogEntry; tall?: boolean }) {
  return (
    <figure className="group relative flex min-w-0 flex-col gap-3 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-focus">
      <div
        inert
        className={cx(
          "flex items-center justify-center overflow-hidden rounded-surface border border-line bg-surface p-5 transition-colors group-hover:border-line-control",
          tall ? "h-80" : "h-56",
        )}
      >
        {entry.preview()}
      </div>
      <figcaption className="flex flex-col gap-1">
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-caption text-fg-secondary">Fig. {entryNumber(entry)}</span>
          {entry.isNew && <NewMark />}
        </span>
        <a
          href={`#/components/${entry.slug}`}
          className="flex items-center gap-1.5 font-display text-title-sm-emphasis text-fg outline-none after:absolute after:inset-0"
        >
          {entry.name}
          <RiArrowRightUpLine aria-hidden className="size-4 text-accent-600 opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
        <span className="text-body-md text-fg-secondary">{entry.summary}</span>
      </figcaption>
    </figure>
  );
}

/** A chapter: number, title, blurb, then its figures. */
function Chapter({ group }: { group: Group }) {
  const meta = GROUPS.find((g) => g.name === group)!;
  const entries = entriesIn(group);
  const wide = group === "Templates" || group === "Blocks" || group === "Charts";
  return (
    // grid-cols-1 is minmax(0, 1fr): a wide preview is clipped by its figure instead of widening the page on phones.
    <section aria-labelledby={`ch-${groupSlug(group)}`} className="grid grid-cols-1 gap-8 border-t border-line pt-8 lg:grid-cols-12">
      <header className="flex flex-col gap-2 lg:col-span-3">
        <span className="font-mono text-caption text-accent-600">{groupNumber(group)}</span>
        <h2 id={`ch-${groupSlug(group)}`} className="font-display text-title-lg-strong text-fg">
          <a href={`#/section/${groupSlug(group)}`} className={cx("rounded-xs hover:underline hover:decoration-1 hover:underline-offset-4", focusRingNative)}>
            {group}
          </a>
        </h2>
        <p className="text-body-md text-fg-secondary">{meta.blurb}</p>
        <p className="font-mono text-caption text-fg-secondary">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
      </header>
      <div className={cx("grid grid-cols-1 gap-x-8 gap-y-12 lg:col-span-9", wide ? "sm:grid-cols-1 xl:grid-cols-2" : "sm:grid-cols-2")}>
        {entries.map((entry) => (
          <Figure key={entry.slug} entry={entry} tall={group === "Templates"} />
        ))}
      </div>
    </section>
  );
}

/** Page container with the site's margins. */
function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto flex w-full max-w-6xl flex-col px-5 sm:px-8", className)}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/*                                    Home                                    */
/* -------------------------------------------------------------------------- */

const FEATURED = ["button", "select", "date-range-picker", "toast", "revenue-chart", "command-palette"];

export function HomePage() {
  const featured = FEATURED.map(findEntry).filter((e): e is CatalogEntry => !!e);
  return (
    <Page className="gap-20 py-12 sm:py-20">
      <section aria-labelledby="hero" className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Kicker>Windesign · Design system · Edition 2026</Kicker>
          <h1 id="hero" className="font-display text-display-md text-fg sm:text-display-lg">
            A design system,
            <br />
            <em className="text-accent-600">set in ink.</em>
          </h1>
          <p className="max-w-xl text-body-md text-fg-secondary">
            {CATALOG.length} components, blocks, charts and templates for React, built on React Aria and styled only through tokens. One
            palette of paper and ink, two themes, every pairing checked for contrast.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onPress={() => (window.location.hash = "#/components")} trailingIcon={RiArrowRightLine}>
              Read the contents
            </Button>
            <Button variant="secondary" onPress={() => (window.location.hash = "#/section/foundations")}>
              Foundations
            </Button>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-surface border border-line bg-line lg:col-span-4">
          {[
            ["Components", CATALOG.filter((e) => COMPONENT_GROUPS.includes(e.group)).length],
            ["Blocks", entriesIn("Blocks").length],
            ["Charts", entriesIn("Charts").length],
            ["Templates", entriesIn("Templates").length],
          ].map(([label, count]) => (
            <div key={label} className="flex flex-col gap-1 bg-surface p-5">
              <dt className="font-mono text-caption tracking-wide text-fg-secondary uppercase">{label}</dt>
              <dd className="font-display text-display-sm text-fg tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="contents" className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <h2 id="contents" className="font-display text-title-lg-strong text-fg">
            Contents
          </h2>
          <Kicker>{GROUPS.length} chapters</Kicker>
        </div>
        <ol className="border-t border-line">
          {GROUPS.map((group) => (
            <li key={group.name} className="border-b border-line">
              <a
                href={`#/section/${groupSlug(group.name)}`}
                className={cx("group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-4 transition-colors hover:bg-surface sm:grid-cols-[4rem_14rem_1fr_auto]", focusRingNative)}
              >
                <span className="ps-1 font-mono text-caption text-accent-600">{groupNumber(group.name)}</span>
                <span className="font-display text-title-sm-emphasis text-fg">{group.name}</span>
                <span className="hidden truncate text-body-md text-fg-secondary sm:block">{group.blurb}</span>
                <span className="flex items-center gap-2 pe-1 font-mono text-caption text-fg-secondary tabular-nums">
                  {entriesIn(group.name).length}
                  <RiArrowRightLine aria-hidden className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="featured" className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Kicker>Plates</Kicker>
          <h2 id="featured" className="font-display text-title-lg-strong text-fg">
            From the collection
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((entry) => (
            <Figure key={entry.slug} entry={entry} />
          ))}
        </div>
      </section>
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Contents pages                               */
/* -------------------------------------------------------------------------- */

export function ContentsPage({ groups, title, lead, kicker }: { groups: Group[]; title: string; lead: string; kicker: string }) {
  return (
    <Page className="gap-12 py-12 sm:py-16">
      <header className="flex max-w-3xl flex-col gap-4">
        <Kicker>{kicker}</Kicker>
        <h1 className="font-display text-display-md text-fg">{title}</h1>
        <p className="text-body-md text-fg-secondary">{lead}</p>
      </header>
      <div className="flex flex-col gap-16">
        {groups.map((group) => (
          <Chapter key={group} group={group} />
        ))}
      </div>
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Detail                                   */
/* -------------------------------------------------------------------------- */

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-surface border border-line bg-sunken p-5 pe-14 font-mono text-body-sm text-fg">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy code"}
        onClick={() => {
          void navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        className={cx("absolute end-3 top-3 flex size-8 items-center justify-center rounded-control-sm text-icon-secondary transition-colors hover:bg-surface hover:text-fg", focusRingNative)}
      >
        {copied ? <RiCheckLine aria-hidden className="size-4" /> : <RiFileCopyLine aria-hidden className="size-4" />}
      </button>
    </div>
  );
}

export function DetailPage({ entry }: { entry: CatalogEntry }) {
  const index = CATALOG.indexOf(entry);
  const previous = CATALOG[index - 1];
  const next = CATALOG[index + 1];
  const siblings = entriesIn(entry.group);
  const Demo = entry.demo ?? entry.preview;
  const isFoundation = entry.group === "Foundations";
  const isTemplate = entry.group === "Templates";
  const snippet = entry.imports.length ? `import { ${entry.imports.join(", ")} } from "@ds/react";` : "";

  return (
    <Page className="gap-12 py-10 sm:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <article className="flex min-w-0 flex-col gap-8 lg:col-span-9">
          <header className="flex flex-col gap-3 border-b border-line pb-8">
            <Kicker>
              <a href={`#/section/${groupSlug(entry.group)}`} className={cx("rounded-xs hover:text-fg", focusRingNative)}>
                {groupNumber(entry.group)} — {entry.group}
              </a>
              <span aria-hidden> · </span>Fig. {entryNumber(entry)}
            </Kicker>
            <h1 className="font-display text-display-md text-fg">{entry.name}</h1>
            <p className="max-w-2xl text-body-md text-fg-secondary">{entry.summary}</p>
          </header>

          {isFoundation ? (
            <Demo />
          ) : (
            <Tabs defaultSelectedKey="preview" className="flex flex-col gap-5">
              <TabList aria-label="View">
                <Tab id="preview">Preview</Tab>
                <Tab id="code">Code</Tab>
              </TabList>
              <TabPanel id="preview" className={cx("rounded-surface", focusRing)}>
                <div
                  className={cx(
                    "flex min-h-80 items-center justify-center rounded-surface border border-line bg-surface",
                    isTemplate ? "p-0 sm:p-0" : "p-5 sm:p-10",
                  )}
                >
                  <Demo />
                </div>
              </TabPanel>
              <TabPanel id="code" className={cx("flex flex-col gap-4 rounded-surface", focusRing)}>
                <CodeBlock code={snippet} />
                <p className="max-w-2xl text-body-sm text-fg-secondary">
                  Styled only through semantic tokens: switch the theme in the header and it follows. Behaviour comes from React Aria, so
                  keyboard, focus and screen reader support are built in.
                </p>
              </TabPanel>
            </Tabs>
          )}
        </article>

        <aside aria-label={`In ${entry.group}`} className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 flex flex-col gap-3">
            <Kicker>In this chapter</Kicker>
            <ol className="flex flex-col border-s border-line">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`#/components/${s.slug}`}
                    aria-current={s.slug === entry.slug ? "page" : undefined}
                    className={cx(
                      "-ms-px flex items-baseline gap-2 border-s-2 py-1.5 ps-3 text-body-sm transition-colors",
                      s.slug === entry.slug ? "border-accent-500 text-fg" : "border-transparent text-fg-secondary hover:text-fg",
                      focusRingNative,
                    )}
                  >
                    <span className="font-mono text-caption">{entryNumber(s).split(".")[1]}</span>
                    {s.name}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <nav aria-label="More" className="grid gap-px overflow-hidden rounded-surface border border-line bg-line sm:grid-cols-2">
        {previous ? (
          <a href={`#/components/${previous.slug}`} className={cx("group flex flex-col gap-1 bg-canvas p-6 transition-colors hover:bg-surface", focusRingNative)}>
            <span className="flex items-center gap-1.5 font-mono text-caption text-fg-secondary">
              <RiArrowLeftLine aria-hidden className="size-3.5 rtl:-scale-x-100" /> Previous
            </span>
            <span className="font-display text-title-sm-emphasis text-fg">{previous.name}</span>
          </a>
        ) : (
          <span className="bg-canvas" />
        )}
        {next ? (
          <a href={`#/components/${next.slug}`} className={cx("group flex flex-col items-end gap-1 bg-canvas p-6 text-end transition-colors hover:bg-surface", focusRingNative)}>
            <span className="flex items-center gap-1.5 font-mono text-caption text-fg-secondary">
              Next <RiArrowRightLine aria-hidden className="size-3.5 rtl:-scale-x-100" />
            </span>
            <span className="font-display text-title-sm-emphasis text-fg">{next.name}</span>
          </a>
        ) : (
          <span className="bg-canvas" />
        )}
      </nav>
    </Page>
  );
}

export function MissingPage({ path }: { path: string }) {
  return (
    <Page className="items-start gap-4 py-24">
      <Kicker>Not found</Kicker>
      <h1 className="font-display text-display-md text-fg">There's no page at {path}.</h1>
      <Button variant="secondary" leadingIcon={RiArrowLeftLine} onPress={() => (window.location.hash = "#/")}>
        Back to the start
      </Button>
    </Page>
  );
}
