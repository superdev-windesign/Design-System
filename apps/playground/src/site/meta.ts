import pkg from "../../../../packages/react/package.json";
import type { CatalogEntry } from "../showcase/catalog";

/** The public repository the site is built from. */
export const REPO_URL = "https://github.com/superdev-windesign/Design-System";

/** The component library's version, shown beside the wordmark. */
export const VERSION = pkg.version;

/**
 * Every source file in @windesign-ds/react, by path. The modules are already in the
 * bundle through the package's index, so the lazy imports add no chunks; only
 * the paths are used, to link each page to its source.
 */
const SOURCES = Object.keys(
  import.meta.glob(["../../../../packages/react/src/**/*.tsx", "!../../../../packages/react/src/**/*.test.tsx"]),
).map((path) => path.slice(path.indexOf("packages/")));

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** The GitHub page for an entry's main component, when one of its imports names a file. */
export function sourceUrl(entry: CatalogEntry) {
  for (const name of entry.imports) {
    const file = SOURCES.find((path) => path.endsWith(`/${kebab(name)}.tsx`));
    if (file) return `${REPO_URL}/blob/main/${file}`;
  }
  return undefined;
}
