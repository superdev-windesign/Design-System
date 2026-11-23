import "@testing-library/jest-dom/vitest";

// jsdom lacks these browser APIs; React Aria and motion probe for them.
// (Tests that opt into the node environment have no window at all.)
const hasWindow = typeof window !== "undefined";

if (hasWindow && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

if (hasWindow && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (hasWindow && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

if (hasWindow) {
  // jsdom defines scrollTo but only to log "Not implemented".
  window.scrollTo = () => {};
}

if (hasWindow) {
  // jsdom has no 2D canvas; the effects skip drawing when getContext returns null.
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
}
