import { useState } from "react";
import {
  RiCalendarLine,
  RiCameraLine,
  RiChat3Line,
  RiMailLine,
  RiMapPin2Line,
  RiMusic2Line,
  RiSettings3Line,
  RiShoppingBag3Line,
  RiWallet3Line,
} from "@remixicon/react";
import {
  AnimatedList,
  AppFolder,
  Avatar,
  Button,
  CompareSlider,
  Coverflow,
  ImageTrail,
  Lens,
  Marquee,
  PageTransition,
  ProgressiveBlur,
  ScrollProgress,
  ScrollTextReveal,
  SegmentedControl,
  SegmentedControlItem,
  StickyScrollReveal,
  TracingBeam,
} from "@windesign-ds/react";
import type { IconComponent, PageTransitionVariant } from "@windesign-ds/react";
import type { CatalogEntry } from "./catalog";
import { Art, Filler, ScrollBox, effect } from "./effects-kit";

/* ───────────────────────────── Lists, carousels and media ───────────────────────────── */

const FEED = [
  { who: "Ada", what: "commented on Q3 plan", color: "pink" as const },
  { who: "Kwame", what: "merged the tokens update", color: "blue" as const },
  { who: "Lucía", what: "shared three interview notes", color: "lime" as const },
  { who: "Ravi", what: "moved Launch to Friday", color: "neutral" as const },
  { who: "Ada", what: "approved the new icon set", color: "pink" as const },
];

function Feed({ compact = false }: { compact?: boolean }) {
  return (
    <AnimatedList loop className={compact ? "w-64" : "w-80"}>
      {FEED.map((item, i) => (
        <div key={i} className="flex items-center gap-3 rounded-surface border border-line bg-surface p-3 shadow-raised">
          <Avatar initials={item.who.slice(0, 2).toUpperCase()} color={item.color} size="md" />
          <span className="text-body-sm text-fg">
            <span className="text-body-sm-strong">{item.who}</span> {item.what}
          </span>
        </div>
      ))}
    </AnimatedList>
  );
}

const QUOTES = [
  ["“We shipped the redesign in a week.”", "Ada, Northwind"],
  ["“Dark mode was one line.”", "Kwame, Tidal"],
  ["“Our audit came back clean.”", "Lucía, Arbor"],
  ["“The brand switch sold it.”", "Ravi, Helix"],
];

function QuoteCard({ quote, by }: { quote: string; by: string }) {
  return (
    <figure className="flex w-64 flex-col gap-2 rounded-surface border border-line bg-surface p-4">
      <blockquote className="text-body-md text-fg">{quote}</blockquote>
      <figcaption className="text-caption text-fg-secondary">{by}</figcaption>
    </figure>
  );
}

const WORDMARKS = ["Northwind", "Tidal", "Arbor", "Helix", "Quanta", "Lumen"];

const COVERS = ["Midnight", "Coastline", "Afterglow", "Paper Moon", "Static", "Low Tide", "Ember"].map((label) => ({
  id: label,
  label,
  content: (
    <Art seed={label}>
      <span className="absolute bottom-3 left-3 text-body-md-strong text-on-action">{label}</span>
    </Art>
  ),
}));

const APPS: { id: string; label: string; icon: IconComponent; seed: string }[] = [
  { id: "mail", label: "Mail", icon: RiMailLine, seed: "mail" },
  { id: "calendar", label: "Calendar", icon: RiCalendarLine, seed: "calendar" },
  { id: "camera", label: "Camera", icon: RiCameraLine, seed: "camera" },
  { id: "music", label: "Music", icon: RiMusic2Line, seed: "music" },
  { id: "maps", label: "Maps", icon: RiMapPin2Line, seed: "maps" },
  { id: "wallet", label: "Wallet", icon: RiWallet3Line, seed: "wallet" },
  { id: "chat", label: "Messages", icon: RiChat3Line, seed: "chat" },
  { id: "shop", label: "Store", icon: RiShoppingBag3Line, seed: "shop" },
  { id: "settings", label: "Settings", icon: RiSettings3Line, seed: "settings" },
];

const folderApps = APPS.map(({ icon: Icon, seed, ...app }) => ({
  ...app,
  icon: (
    <Art seed={seed} className="flex items-center justify-center">
      <Icon aria-hidden className="size-1/2 text-on-action" />
    </Art>
  ),
}));

function PhotoPair() {
  return (
    <CompareSlider
      beforeLabel="Before"
      afterLabel="After"
      before={<Art seed="raw photo grey dull" className="grayscale" />}
      after={<Art seed="raw photo grey dull" />}
    />
  );
}

const MEDIA_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "animated-list",
    name: "Animated List",
    summary: "Items arrive one at a time and drop in on top, like notifications landing.",
    imports: ["AnimatedList"],
    aliases: ["Activity feed", "Notification list"],
    preview: () => <Feed compact />,
    demo: () => <Feed />,
  }),
  effect({
    slug: "marquee",
    name: "Marquee",
    summary: "A row or column of content scrolling endlessly, pausing on hover and focus.",
    imports: ["Marquee"],
    aliases: ["Ticker", "Logo wall", "Infinite scroll", "Infinite moving cards"],
    preview: () => (
      <Marquee className="w-80">
        {WORDMARKS.map((w) => (
          <span key={w} className="text-title-sm-strong text-fg-secondary">
            {w}
          </span>
        ))}
      </Marquee>
    ),
    demo: () => (
      <div className="flex w-full flex-col gap-4">
        <Marquee>
          {QUOTES.map(([q, by]) => (
            <QuoteCard key={by} quote={q!} by={by!} />
          ))}
        </Marquee>
        <Marquee reverse speed={0.8}>
          {WORDMARKS.map((w) => (
            <span key={w} className="text-title-md-strong text-fg-secondary">
              {w}
            </span>
          ))}
        </Marquee>
      </div>
    ),
  }),
  effect({
    slug: "coverflow",
    name: "Coverflow",
    summary: "A 3D carousel: the current card faces you and the rest turn away on either side.",
    imports: ["Coverflow"],
    aliases: ["3D carousel", "Carousel"],
    preview: () => (
      <div className="w-96 scale-70">
        <Coverflow aria-label="Albums" items={COVERS} defaultIndex={3} />
      </div>
    ),
    demo: () => <Coverflow aria-label="Albums" items={COVERS} defaultIndex={3} className="w-full" />,
  }),
  effect({
    slug: "compare-slider",
    name: "Compare Slider",
    summary: "Two versions of a picture with a handle to wipe between them.",
    imports: ["CompareSlider"],
    aliases: ["Before and after", "Image compare"],
    preview: () => (
      <div className="w-72">
        <PhotoPair />
      </div>
    ),
    demo: () => <PhotoPair />,
  }),
  effect({
    slug: "image-trail",
    name: "Image Trail",
    summary: "Pictures drop behind the pointer as it moves, leaving a trail of the work.",
    imports: ["ImageTrail"],
    aliases: ["Cursor image trail", "Trailing image"],
    preview: () => (
      <div className="relative flex h-40 w-72 items-center justify-center">
        {["one", "two", "three"].map((s, i) => (
          <span key={s} className="absolute size-20 overflow-hidden rounded-surface shadow-overlay" style={{ translate: `${(i - 1) * 56}px ${(i - 1) * -10}px`, rotate: `${(i - 1) * 8}deg` }}>
            <Art seed={s} />
          </span>
        ))}
      </div>
    ),
    demo: () => (
      <ImageTrail items={["one", "two", "three", "four", "five", "six"].map((s) => <Art key={s} seed={s} />)} className="h-80 w-full rounded-surface border border-line bg-canvas">
        <div className="flex h-80 items-center justify-center text-title-lg-strong text-fg">Move across this panel</div>
      </ImageTrail>
    ),
  }),
  effect({
    slug: "lens",
    name: "Lens",
    summary: "A round magnifier that follows the pointer and shows the picture enlarged.",
    imports: ["Lens"],
    aliases: ["Magnifier", "Zoom lens"],
    preview: () => (
      <div className="relative h-36 w-56 overflow-hidden rounded-surface">
        <Art seed="map detail" />
        <span className="absolute top-6 left-16 size-20 overflow-hidden rounded-full border-2 border-surface shadow-overlay">
          <Art seed="map detail" className="scale-200" />
        </span>
      </div>
    ),
    demo: () => (
      <Lens className="h-72 w-full max-w-lg rounded-surface">
        <Art seed="a detailed city map at night">
          <span className="absolute bottom-4 left-4 text-body-sm-strong text-on-action">Hover to look closer</span>
        </Art>
      </Lens>
    ),
  }),
  effect({
    slug: "app-folder",
    name: "App Folder",
    summary: "A tile of tiny icons that opens like a phone's folder, each icon growing into place.",
    imports: ["AppFolder"],
    aliases: ["iOS folder", "Folder"],
    preview: () => <AppFolder name="Daily" apps={folderApps} />,
    demo: () => (
      <div className="flex gap-8">
        <AppFolder name="Daily" apps={folderApps} />
        <AppFolder name="Travel" apps={folderApps.slice(3, 7)} />
      </div>
    ),
  }),
];

/* ────────────────────────────── Scroll and transitions ────────────────────────────── */

const CHANGES = [
  ["Glass brand", "A third brand on a thick Liquid Glass material, with 26 components of its own."],
  ["Moon gets its own forms", "Pill switches, a straight tab underline and 40px controls, from Moon's own source."],
  ["Docs redesign", "A sidebar, breadcrumbs, a filter, and an On this page rail on every component."],
  ["Effects", "Seventy animated components, every one on tokens and still under reduced motion."],
];

const TOUR = [
  { title: "Tokens first", description: "Every colour, radius, shadow and duration comes from one set of tokens.", visual: <Art seed="tokens first" /> },
  { title: "Three brands", description: "Windesign, Moon and Glass restyle every component without a fork.", visual: <Art seed="three brands" /> },
  { title: "Light and dark", description: "Themes remap the same names, so nothing branches on theme.", visual: <Art seed="light and dark" /> },
  { title: "Built to be read", description: "React Aria behaviour, one focus ring, and checked contrast.", visual: <Art seed="built to be read" /> },
];

const VARIANTS: PageTransitionVariant[] = ["fade", "slide", "zoom", "blur", "curtain"];

function TransitionDemo({ auto = false }: { auto?: boolean }) {
  const [page, setPage] = useState(0);
  const [variant, setVariant] = useState<PageTransitionVariant>("curtain");
  const pages = [
    { title: "Inbox", seed: "inbox" },
    { title: "Projects", seed: "projects" },
    { title: "Reports", seed: "reports" },
  ];
  const current = pages[page % pages.length]!;
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      {!auto && (
        <SegmentedControl aria-label="Transition" selectedKeys={[variant]} onSelectionChange={(k) => setVariant([...k][0] as PageTransitionVariant)}>
          {VARIANTS.map((v) => (
            <SegmentedControlItem key={v} id={v}>
              {v[0]!.toUpperCase() + v.slice(1)}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      )}
      <PageTransition transitionKey={page} variant={variant} className="h-48 w-full rounded-surface border border-line">
        <Art seed={current.seed} className="h-48">
          <span className="absolute bottom-4 left-4 text-title-lg-strong text-on-action">{current.title}</span>
        </Art>
      </PageTransition>
      <Button variant="secondary" size="sm" onPress={() => setPage((p) => p + 1)}>
        Next page
      </Button>
    </div>
  );
}

const SCROLL_ENTRIES: CatalogEntry[] = [
  effect({
    slug: "tracing-beam",
    name: "Tracing Beam",
    summary: "A rule down the side of a long article that fills with light as you read.",
    imports: ["TracingBeam"],
    aliases: ["Scroll timeline", "Reading line"],
    preview: () => (
      <div className="relative flex h-40 w-64 flex-col gap-3 ps-10">
        <span className="absolute start-3 top-0 bottom-0 w-0.5 rounded-full bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-linear-to-b from-accent-500 to-effect-2" />
        </span>
        {CHANGES.slice(0, 3).map(([t]) => (
          <span key={t} className="text-body-md-strong text-fg">
            {t}
          </span>
        ))}
      </div>
    ),
    demo: () => (
      <ScrollBox>
        {(ref) => (
          <div className="p-6">
            <TracingBeam scrollRef={ref}>
              <div className="flex flex-col gap-10 pb-40">
                {CHANGES.map(([title, text]) => (
                  <article key={title} className="flex flex-col gap-2">
                    <h3 className="text-title-md-strong text-fg">{title}</h3>
                    <p className="text-body-md text-fg-secondary">{text}</p>
                    <Filler count={1} />
                  </article>
                ))}
              </div>
            </TracingBeam>
          </div>
        )}
      </ScrollBox>
    ),
  }),
  effect({
    slug: "scroll-progress",
    name: "Scroll Progress",
    summary: "A thin accent bar that fills as you read.",
    imports: ["ScrollProgress"],
    aliases: ["Reading progress", "Progress bar"],
    preview: () => (
      <div className="flex w-64 flex-col gap-3 overflow-hidden rounded-surface border border-line bg-surface">
        <span className="h-1 w-3/5 bg-linear-to-r from-accent-500 to-effect-2" />
        <span className="px-4 pb-4 text-body-sm text-fg-secondary">A long read, 60% through.</span>
      </div>
    ),
    demo: () => (
      <ScrollBox>
        {(ref) => (
          <>
            <ScrollProgress scrollRef={ref} />
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-title-lg-strong text-fg">Scroll this panel</h3>
              <Filler count={8} />
            </div>
          </>
        )}
      </ScrollBox>
    ),
  }),
  effect({
    slug: "sticky-scroll-reveal",
    name: "Sticky Scroll Reveal",
    summary: "Text scrolls past while a pinned panel cross-fades to each section's picture.",
    imports: ["StickyScrollReveal"],
    aliases: ["Sticky scroll", "Feature tour", "Scrollytelling"],
    preview: () => (
      <div className="grid w-80 grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          {TOUR.slice(0, 3).map((t, i) => (
            <span key={t.title} className={i === 1 ? "text-body-sm-strong text-fg" : "text-body-sm text-fg-secondary opacity-50"}>
              {t.title}
            </span>
          ))}
        </div>
        <div className="h-28 overflow-hidden rounded-surface">{TOUR[1]!.visual}</div>
      </div>
    ),
    demo: () => (
      <ScrollBox>
        {(ref) => (
          <div className="px-6 py-24">
            <StickyScrollReveal scrollRef={ref} items={TOUR} />
          </div>
        )}
      </ScrollBox>
    ),
  }),
  effect({
    slug: "scroll-text-reveal",
    name: "Scroll Text Reveal",
    summary: "A statement whose words light up one after another as you scroll through it.",
    imports: ["ScrollTextReveal"],
    aliases: ["Text reveal", "Scroll highlight"],
    preview: () => (
      <p className="max-w-xs text-center text-title-md-strong">
        <span className="text-fg">One set of tokens, </span>
        <span className="text-fg opacity-20">every brand and theme.</span>
      </p>
    ),
    demo: () => (
      <ScrollBox>
        {(ref) => (
          <div className="flex flex-col gap-4 px-6 py-64">
            <ScrollTextReveal scrollRef={ref} text="One set of tokens dresses every component, in every brand and both themes, without a single fork." />
          </div>
        )}
      </ScrollBox>
    ),
  }),
  effect({
    slug: "progressive-blur",
    name: "Progressive Blur",
    summary: "Blur that deepens toward an edge, so content softens away instead of being cut off.",
    imports: ["ProgressiveBlur"],
    aliases: ["Edge blur", "Gradient blur"],
    preview: () => (
      <div className="relative h-40 w-64 overflow-hidden rounded-surface">
        <Art seed="progressive blur preview" />
        <ProgressiveBlur className="h-20" />
      </div>
    ),
    demo: () => (
      <div className="relative h-80 w-full max-w-md overflow-hidden rounded-surface border border-line">
        <div className="scrollbar-thin h-full overflow-y-auto">
          <div className="flex flex-col gap-3 p-4 pb-24">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="h-20 shrink-0 overflow-hidden rounded-surface">
                <Art seed={`row ${i}`} />
              </div>
            ))}
          </div>
        </div>
        <ProgressiveBlur position="top" className="h-16" />
        <ProgressiveBlur className="h-28" />
      </div>
    ),
  }),
  effect({
    slug: "page-transition",
    name: "Page Transition",
    summary: "Animates between views: fade, slide, zoom, blur, or a curtain of ink.",
    imports: ["PageTransition"],
    aliases: ["Route transition", "View transition", "Curtain"],
    preview: () => (
      <div className="relative h-32 w-56 overflow-hidden rounded-surface">
        <Art seed="projects" />
        <span className="absolute inset-y-0 left-0 w-2/5 bg-fg" />
      </div>
    ),
    demo: () => <TransitionDemo />,
  }),
];

export const EFFECT_MEDIA_ENTRIES: CatalogEntry[] = [...MEDIA_ENTRIES, ...SCROLL_ENTRIES];
