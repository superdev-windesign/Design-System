# windesign-ds

Add Windesign design-system components to your React project **as source**.
The CLI copies a component, and the files it uses inside the system, into your
project, and installs any npm packages it needs. The code is then yours to
change.

```sh
npx windesign-ds@latest add context-menu
```

```sh
pnpm dlx windesign-ds@latest add context-menu
yarn dlx windesign-ds@latest add context-menu
bunx --bun windesign-ds@latest add context-menu
```

Your app needs React 19 and Tailwind CSS v4. Browse every component at
https://galactic-deepskyblue-toad-85.hostingersite.com. Each page shows its
`add` command.

## Commands

| Command | What it does |
| --- | --- |
| `init` | Installs `@windesign-ds/styles`, adds its theme to your main CSS file, and saves where components go in `windesign.json`. `add` runs it for you the first time. |
| `add <name...>` | Copies components, and the files they use, into your project. It installs or upgrades the npm packages they need, then prints the import lines. |
| `list [search]` | Shows every component you can add, by group. |

A name is a component's page name (`context-menu`, `dynamic-island`), another
name it's known by (`modal`), or any single export (`AnimatedNumber`).

## Options

| Option | |
| --- | --- |
| `--path <dir>` | Where components go (default `src/components/windesign`) |
| `--cwd <dir>` | Run in another folder |
| `-o, --overwrite` | Replace files you've changed without asking |
| `-y, --yes` | Don't ask; use the defaults |
| `--dry-run` | Show what would happen without changing anything |

## What gets copied

Components keep the system's folder layout under your components folder, so
their imports between each other keep working. For example,
`add context-menu` writes:

```
src/components/windesign/
  components/menu/context-menu.tsx
  components/menu/menu.tsx
  components/button/button.tsx
  recipes/menu.ts
  recipes/focus-ring.ts
  utils/cx.ts
```

Files shared between components, like `utils/cx.ts`, are written once. If you
run `add` again after changing a file, you're asked before it's replaced.

Prefer to keep the components in `node_modules`? Install the package instead:
`npm install @windesign-ds/react @windesign-ds/styles`.

MIT licence.
