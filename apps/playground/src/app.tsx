import { SkipLink, Toaster } from "@ds/react";
import { GROUPS } from "./showcase/catalog";
import type { Group } from "./showcase/catalog";
import { DocsSidebar } from "./site/docs-nav";
import { ContentsPage, DetailPage, HomePage, MissingPage, sectionCrumbs } from "./site/pages";
import { COMPONENT_GROUPS, isDocsRoute, useRoute } from "./site/routes";
import { SiteFooter } from "./site/site-footer";
import { SiteHeader } from "./site/site-header";

/** Lead paragraphs for the group overview pages that say more than the group's blurb. */
const SECTION_LEAD: Partial<Record<Group, string>> = {
  Foundations: "The tokens every component is built from (colour, type, space, corners, depth and motion) and how theming works, read live from the token bridge.",
  Blocks: "Larger pieces made from the components: agent tools, data views, settings and navigation, ready to drop into a screen.",
  Charts: "Chart cards on one shell and one palette, each with a written description of its data.",
  Templates: "Whole screens assembled from blocks and charts. They fit whatever space they're given.",
};

export function App() {
  const route = useRoute();

  let page;
  if (route.kind === "home") page = <HomePage />;
  else if (route.kind === "index")
    page = (
      <ContentsPage
        groups={COMPONENT_GROUPS}
        crumbs={[{ label: "Components" }]}
        title="Components"
        lead="The controls and patterns everything else is made from, grouped by what they do. Every card is the live component; open one for its page."
      />
    );
  else if (route.kind === "section") {
    const lead = SECTION_LEAD[route.group] ?? GROUPS.find((g) => g.name === route.group)?.blurb ?? "";
    page = <ContentsPage key={route.group} groups={[route.group]} crumbs={sectionCrumbs(route.group)} title={route.group} lead={lead} />;
  } else if (route.kind === "detail") page = <DetailPage key={route.entry.slug} entry={route.entry} />;
  else page = <MissingPage path={route.path} />;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-fg">
      <SkipLink href="#main" />
      <SiteHeader route={route} />
      {/* One app-wide toast region; anything can call toast.success(…). */}
      <Toaster />
      {isDocsRoute(route) ? (
        // The docs shell: the contents tree pinned on the left, the page beside it.
        <div className="flex w-full flex-1 items-start">
          <DocsSidebar route={route} />
          <div className="flex min-w-0 flex-1 flex-col self-stretch">
            <main id="main" tabIndex={-1} className="flex-1">
              {page}
            </main>
            <SiteFooter compact />
          </div>
        </div>
      ) : (
        <>
          <main id="main" tabIndex={-1} className="flex-1">
            {page}
          </main>
          <SiteFooter />
        </>
      )}
    </div>
  );
}
