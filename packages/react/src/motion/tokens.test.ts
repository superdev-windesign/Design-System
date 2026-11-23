// @vitest-environment node
import { readFileSync } from "node:fs";
import { easing, effectDuration } from "./tokens";

const tokens = JSON.parse(
  readFileSync(new URL("../../../tokens/dist/json/light.json", import.meta.url), "utf8"),
) as Record<string, string>;

const bezier = (value: string | undefined) =>
  /cubic-bezier\(([^)]+)\)/
    .exec(value ?? "")?.[1]
    ?.split(",")
    .map((n) => Number(n.trim()));

describe("motion tokens mirror", () => {
  it.each(Object.entries(easing))("easing.%s matches --ds-motion-easing-%s", (name, value) => {
    expect(bezier(tokens[`ds-motion-easing-${name}`])).toEqual([...value]);
  });

  it.each(Object.entries(effectDuration))("effectDuration.%s matches --ds-motion-duration-%s", (name, seconds) => {
    expect(tokens[`ds-motion-duration-${name}`]).toBe(`${seconds * 1000}ms`);
  });
});
