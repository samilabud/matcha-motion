// Fails when screens (src/app) bypass the design system with arbitrary Tailwind values or raw colors.
// Components in src/components may use arbitrary values deliberately; screens may not.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/app";
const PATTERNS = [
  { re: /\b[a-z][a-z-]*-\[[^\]]+\]/g, why: "arbitrary Tailwind value" },
  { re: /#[0-9a-fA-F]{3,8}\b/g, why: "raw hex color" },
  { re: /\brgba?\(/g, why: "raw rgb color" },
];

const files = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|mdx)$/.test(p) ? [p] : [];
  });

let failures = 0;
for (const file of files(ROOT)) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const { re, why } of PATTERNS) {
        for (const match of line.matchAll(re)) {
          console.error(`${file}:${i + 1}  ${why}: ${match[0]}`);
          failures++;
        }
      }
    });
}
if (failures) {
  console.error(`\n${failures} hardcoded value(s) in ${ROOT}. Add a token or a component variant instead.`);
  process.exit(1);
}
console.log(`check-no-hardcoded: ${ROOT} is clean`);
