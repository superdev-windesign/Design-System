// Copies the repository's LICENSE and THIRD_PARTY_NOTICES.md into the package
// being packed (the current directory), so every npm tarball carries them.
// MIT requires the notices of adapted code (BoardUI, Moon) in every copy.
import { copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const file of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) copyFileSync(resolve(root, file), resolve(process.cwd(), file));
