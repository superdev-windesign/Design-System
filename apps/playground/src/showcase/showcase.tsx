import { useEffect, useMemo, useState } from "react";
import { Breadcrumb, BreadcrumbItem, Input, LinkButton } from "@ds/react";
import { RiArrowLeftLine, RiArrowRightLine, RiSearchLine } from "@remixicon/react";
import { CATALOG, GROUPS, findEntry } from "./catalog";
import type { CatalogEntry } from "./catalog";

/** Minimal hash router: "#/components" and "#/components/<slug>". */
export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#/, "") || "/";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function ComponentCard({ entry }: { entry: CatalogEntry }) {
  return (
    // The name is the only link; its ::after stretches over the card so the
    // whole card is clickable without nesting the previews' own links in it.
    <div
      className={[
        "relative flex flex-col overflow-hidden rounded-surface border border-line bg-surface shadow-raised transition-colors hover:border-line-hover",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus",
      ].join(" ")}
    >
      {/* Live components, but not interactive here. */}
      <div inert className="flex h-48 items-center justify-center overflow-hidden bg-sunken p-4">
        {entry.preview()}
      </div>
      <div className="flex flex-col gap-1 border-t border-line p-4">
        <a
          href={`#/components/${entry.slug}`}
          className="text-body-md-strong text-fg outline-none after:absolute after:inset-0"
        >
          {entry.name}
        </a>
        <span className="text-body-sm text-fg-secondary">{entry.summary}</span>
      </div>
    </div>
  );
}

export function ShowcaseIndex() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? CATALOG.filter((e) => `${e.name} ${e.summary} ${e.group}`.toLowerCase().includes(q)) : CATALOG;
  }, [query]);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-title-sm-strong text-fg">Components</h1>
          <p className="max-w-prose text-body-md text-fg-secondary">
            {CATALOG.length} components built on the Windesign tokens, grouped by what they help people do. Every
            preview below is the real component. Open one to try it and see how to import it.
          </p>
        </div>
        <Input
          aria-label="Filter components"
          placeholder="Filter by name or purpose"
          leadingIcon={RiSearchLine}
          value={query}
          onChange={setQuery}
          className="w-full max-w-sm"
        />
      </header>

      {GROUPS.map((group) => {
        const entries = matches.filter((e) => e.group === group.name);
        if (entries.length === 0) return null;
        return (
          <section key={group.name} aria-labelledby={`group-${group.name}`} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <h2 id={`group-${group.name}`} className="text-body-md-strong text-fg">
                {group.name}
              </h2>
              <span className="text-body-sm text-fg-tertiary">
                {entries.length} · {group.blurb}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <ComponentCard key={entry.slug} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}

      {matches.length === 0 && (
        <p className="text-body-md text-fg-secondary">No components match “{query}”.</p>
      )}
    </div>
  );
}

export function ShowcaseDetail({ slug }: { slug: string }) {
  const entry = findEntry(slug);
  if (!entry) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-title-sm-strong text-fg">Component not found</h1>
        <LinkButton href="#/components" leadingIcon={RiArrowLeftLine}>
          All components
        </LinkButton>
      </div>
    );
  }

  const index = CATALOG.indexOf(entry);
  const previous = CATALOG[index - 1];
  const next = CATALOG[index + 1];
  const Demo = entry.demo ?? entry.preview;
  const snippet = `import { ${entry.imports.join(", ")} } from "@ds/react";`;

  return (
    <article className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbItem href="#/components">Components</BreadcrumbItem>
          <BreadcrumbItem href="#/components">{entry.group}</BreadcrumbItem>
          <BreadcrumbItem current>{entry.name}</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="text-title-sm-strong text-fg">{entry.name}</h1>
        <p className="max-w-prose text-body-md text-fg-secondary">{entry.summary}</p>
      </div>

      <section aria-label="Live example" className="flex min-h-81.75 items-center justify-center rounded-panel border border-line bg-surface p-4 sm:p-8">
        <Demo />
      </section>

      {/* Foundations document tokens; there's nothing to import. */}
      {entry.imports.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-body-md-strong text-fg">Import</h2>
          <pre className="overflow-x-auto rounded-surface border border-line bg-sunken p-4 font-mono text-body-sm text-fg">
            <code>{snippet}</code>
          </pre>
        </section>
      )}

      <nav aria-label="More components" className="flex items-center justify-between gap-4 border-t border-line pt-6">
        {previous ? (
          <LinkButton href={`#/components/${previous.slug}`} leadingIcon={RiArrowLeftLine}>
            {previous.name}
          </LinkButton>
        ) : (
          <span />
        )}
        {next && (
          <LinkButton href={`#/components/${next.slug}`} trailingIcon={RiArrowRightLine}>
            {next.name}
          </LinkButton>
        )}
      </nav>
    </article>
  );
}
