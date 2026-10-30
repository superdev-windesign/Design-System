import { Toaster } from "@ds/react";
import { GROUPS } from "./showcase/catalog";
import { ContentsPage, DetailPage, HomePage, MissingPage } from "./site/pages";
import { COMPONENT_GROUPS, useRoute } from "./site/routes";
import { SiteHeader, Wordmark } from "./site/site-header";

/** Lead paragraphs for the four non-component chapters. */
const SECTION_COPY: Partial<Record<(typeof GROUPS)[number]["name"], { kicker: string; lead: string }>> = {
  Foundations: { kicker: "Chapter 01", lead: "The colour and type tokens every component is built from, read live from the token bridge." },
  Blocks: { kicker: "Assemblies", lead: "Larger pieces made from the components: agent tools, data views, settings and navigation." },
  Charts: { kicker: "Data", lead: "Chart cards on one shell and one palette, each with a written description of its data." },
  Templates: { kicker: "Screens", lead: "Whole screens assembled from blocks and charts. They fit whatever space they're given." },
};

export function App() {
  const route = useRoute();

  let page;
  if (route.kind === "home") page = <HomePage />;
  else if (route.kind === "index")
    page = (
      <ContentsPage
        groups={COMPONENT_GROUPS}
        kicker="Contents"
        title="Components"
        lead="The controls and patterns everything else is made from, in chapters. Each figure is the live component; open one for its page."
      />
    );
  else if (route.kind === "section") {
    const copy = SECTION_COPY[route.group];
    const blurb = GROUPS.find((g) => g.name === route.group)?.blurb ?? "";
    page = <ContentsPage groups={[route.group]} kicker={copy?.kicker ?? "Chapter"} title={route.group} lead={copy?.lead ?? blurb} />;
  } else if (route.kind === "detail") page = <DetailPage key={route.entry.slug} entry={route.entry} />;
  else page = <MissingPage path={route.path} />;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-fg">
      <a
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-control-md focus:bg-surface focus:px-3 focus:py-2 focus:text-body-md focus:outline-2 focus:outline-focus"
      >
        Skip to content
      </a>
      <SiteHeader route={route} />
      {/* One app-wide toast region; anything can call toast.success(…). */}
      <Toaster />
      <main id="main" tabIndex={-1} className="flex-1">
        {page}
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Wordmark />
          <p className="font-mono text-caption text-fg-secondary">Set in Fraunces, Instrument Sans and JetBrains Mono · React Aria · Tokens</p>
        </div>
      </footer>
    </div>
  );
}
