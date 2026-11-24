import { useEffect, useState } from "react";
import { CodeBlock, PillTab, PillTabList } from "@windesign-ds/react";

/**
 * A shell command shown for each package manager, as tabs over one code block.
 * The choice is shared by every command on the site and remembered between
 * visits, so someone on pnpm picks it once.
 */

const MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof MANAGERS)[number];

const STORAGE_KEY = "ds-package-manager";
const EVENT = "ds-package-manager";

function readManager(): PackageManager {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (MANAGERS as readonly string[]).includes(stored ?? "") ? (stored as PackageManager) : "npm";
  } catch {
    return "npm";
  }
}

function usePackageManager() {
  const [manager, setManager] = useState<PackageManager>(readManager);
  useEffect(() => {
    const sync = () => setManager(readManager());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const choose = (next: PackageManager) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Without storage the choice just lasts for this page.
    }
    setManager(next);
    window.dispatchEvent(new Event(EVENT));
  };
  return [manager, choose] as const;
}

/** `npx windesign-ds@latest add <name>` in each manager's words. */
export const cliCommand = (manager: PackageManager, args: string) =>
  ({
    npm: `npx windesign-ds@latest ${args}`,
    pnpm: `pnpm dlx windesign-ds@latest ${args}`,
    yarn: `yarn dlx windesign-ds@latest ${args}`,
    bun: `bunx --bun windesign-ds@latest ${args}`,
  })[manager];

/** Installing packages in each manager's words. */
export const installCommand = (manager: PackageManager, packages: string) => (manager === "npm" ? `npm install ${packages}` : `${manager} add ${packages}`);

export function InstallCommand({ command, label }: { command: (manager: PackageManager) => string; label: string }) {
  const [manager, choose] = usePackageManager();
  return (
    <div className="flex flex-col gap-2">
      <PillTabList aria-label={`${label}: package manager`}>
        {MANAGERS.map((m) => (
          <PillTab key={m} isSelected={manager === m} onSelect={() => choose(m)}>
            {m}
          </PillTab>
        ))}
      </PillTabList>
      <CodeBlock code={command(manager)} language="bash" />
    </div>
  );
}
