import type { Component, TokenGroup } from "./data.js";

/**
 * Turns data into the text the AI reads. Markdown-ish plain text: headings and
 * short lists are what models read most reliably, and they show well in the
 * Inspector too.
 */

export const DOCS = "https://galactic-deepskyblue-toad-85.hostingersite.com";

/** One line per component, for search results and lists. */
export function componentLine(c: Component, i?: number): string {
    return [
        `${i === undefined ? "-" : `${i + 1}.`} ${c.title} (${c.name}), ${c.group}`,
        `   ${c.summary}`,
        c.aliases.length ? `   Also called: ${c.aliases.join(", ")}` : "",
        `   import { ${c.exports.join(", ")} } from "@windesign-ds/react";`,
    ]
        .filter(Boolean)
        .join("\n");
}

/** Everything about one component: what it is, its props, an example, how to add it. */
export function componentDetails(c: Component): string {
    const out = [`# ${c.title} (${c.name})`, `Group: ${c.group}`, "", c.summary];
    if (c.aliases.length) out.push(`Also called: ${c.aliases.join(", ")}`);

    out.push("", "## Import", `import { ${c.exports.join(", ")} } from "@windesign-ds/react";`);

    for (const entry of c.api) {
        out.push("", `## ${entry.name}${entry.kind === "component" ? "" : ` (${entry.kind})`}`);
        if (entry.description) out.push(entry.description);
        if (entry.props?.length) {
            out.push("", "Props:");
            for (const p of entry.props) out.push(`- ${p.name}${p.required ? "" : "?"}: ${p.type}${p.description ? `  ${p.description}` : ""}`);
        }
        if (entry.inherits?.length) out.push(`Also accepts the props of: ${entry.inherits.join(", ")}`);
    }

    if (c.example) {
        out.push(
            "",
            "## Example",
            "From the docs demo. It may use the docs site's own helpers (art, toasts); the component usage is what to follow.",
            "```tsx",
            c.example,
            "```",
        );
    }

    const packages = Object.entries(c.dependencies).map(([pkg, range]) => `${pkg}@${range}`);
    out.push(
        "",
        "## Add it to a project",
        "Package: npm install @windesign-ds/react @windesign-ds/styles",
        `Or copy the source: npx windesign-ds@latest add ${c.name}`,
        `   (copies ${c.files.length} file${c.files.length === 1 ? "" : "s"}${packages.length ? ` and installs ${packages.join(", ")}` : ""})`,
        "",
        `Docs: ${DOCS}/#/components/${c.name}`,
    );
    return out.join("\n");
}

/** Token groups as utility lists. */
export function tokenList(groups: TokenGroup[]): string {
    return groups
        .map((g) => `## ${g.title}\nUse with: ${g.utilities}\n${g.tokens.join(", ")}`)
        .join("\n\n");
}
