import type { Component } from "./data.js";

/**
 * Ranks components against a free-text query. Plain logic, no MCP, so it can
 * be tested on its own.
 *
 *   - a word found in the title, other names or exports   +10
 *   - a word found in the group                             +4
 *   - a word found in the summary                           +3
 *   - the whole query is a component's name or other name  +100
 * Every word has to be found somewhere, so "date range" doesn't return every
 * component that mentions a date.
 */

/** Lowercase words with simple endings dropped, so "rolling", "rolls" and "roll" meet. */
export function words(text: string): string[] {
    return text
        .replace(/([a-z])([A-Z])/g, "$1 $2") // "DynamicIsland" → "Dynamic Island"
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .map(stem);
}

function stem(word: string): string {
    if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
    if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
    if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
    return word;
}

/** Spaces, dashes and case removed: "Dynamic Island", "dynamic-island" and "DynamicIsland" all become one key. */
export const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function search(components: Component[], query: string, limit = 8): Component[] {
    const terms = words(query);
    if (!terms.length) return [];
    const whole = squash(query);

    const scored: { c: Component; score: number }[] = [];
    for (const c of components) {
        const names = new Set(words([c.title, ...c.aliases, ...c.exports].join(" ")));
        const group = new Set(words(c.group));
        const summary = new Set(words(c.summary));

        let score = 0;
        let everyWord = true;
        for (const t of terms) {
            const hit = (names.has(t) ? 10 : 0) + (group.has(t) ? 4 : 0) + (summary.has(t) ? 3 : 0);
            if (!hit) everyWord = false;
            score += hit;
        }
        if ([c.name, c.title, ...c.aliases].some((n) => squash(n) === whole)) score += 100;
        else if (!everyWord) continue;
        scored.push({ c, score });
    }

    return scored
        .sort((a, b) => b.score - a.score || a.c.title.localeCompare(b.c.title))
        .slice(0, limit)
        .map((m) => m.c);
}

/**
 * Close names for a miss. Looser than search: words that match nothing
 * ("thing" in "date picker thing") are dropped rather than ruling everything out.
 */
export function suggest(components: Component[], query: string, limit = 3): string[] {
    const names = (q: string) => search(components, q, limit).map((c) => c.name);
    const all = query.split(/\s+/).filter(Boolean);
    // The whole query, then without one word at a time, then each word alone.
    for (const attempt of [all, ...all.map((_, i) => all.filter((__, j) => j !== i)), ...all.map((w) => [w])]) {
        const found = attempt.length ? names(attempt.join(" ")) : [];
        if (found.length) return found;
    }
    return [];
}

/** One component by any name people use: "dynamic-island", "Dynamic Island", "DynamicIsland" or "Status pill". */
export function findComponent(components: Component[], name: string): Component | undefined {
    const key = squash(name);
    return (
        components.find((c) => squash(c.name) === key || squash(c.title) === key) ??
        components.find((c) => c.aliases.some((a) => squash(a) === key)) ??
        // An export name last: AnimatedNumber is also exported by Stat Card, so prefer the entry it's named after.
        components.find((c) => squash(c.exports[0] ?? "") === key) ??
        components.find((c) => c.exports.some((e) => squash(e) === key))
    );
}
