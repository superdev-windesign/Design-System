import { readFileSync } from "node:fs";

/** One prop of a component, read from its TypeScript type. */
export interface Prop {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

/** One thing a component entry exports: the component itself, a hook, a type… */
export interface ApiEntry {
    name: string;
    kind: "component" | "function" | "type" | "value";
    description: string;
    /** Props declared in this library (components only). */
    props?: Prop[];
    /** Packages whose props it also accepts, e.g. react-aria-components. */
    inherits?: string[];
}

export interface Component {
    name: string;      // "dynamic-island"
    title: string;     // "Dynamic Island"
    group: string;
    summary: string;
    aliases: string[]; // other names, e.g. "Modal"
    exports: string[]; // what to import from @windesign-ds/react
    files: string[];   // source files the CLI copies
    dependencies: Record<string, string>; // npm packages it needs
    api: ApiEntry[];
    /** A working example: the docs demo's source. */
    example?: string;
}

export interface TokenGroup {
    title: string;
    kind: string;
    /** Which utilities the tokens go with, e.g. "bg-*" or "rounded-*". */
    utilities: string;
    tokens: string[];
}

export interface Data {
    version: string;
    components: Component[];
    tokens: TokenGroup[];
}

// Found from this file's own location, not the current folder:
// an AI app can start the server from any folder.
const read = <T>(file: string): T => JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8")) as T;

export function loadData(): Data {
    const { version, components } = read<{ version: string; components: Component[] }>("components.json");
    const { groups } = read<{ groups: TokenGroup[] }>("tokens.json");
    return { version, components, tokens: groups };
}
