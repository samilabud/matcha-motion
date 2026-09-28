// Figma variables → CSS custom properties + TS motion tokens.
//
// Inputs (never edit the outputs, re-export from Figma instead):
//   tokens/figma/core.tokens.json      Figma "Core" collection (primitives), native DTCG export
//   tokens/figma/semantic.tokens.json  Figma "Semantic" collection, aliases into Core
//   tokens/motion.json                 motion tokens (Figma has no motion variables)
//
// Figma's export differs from what Style Dictionary expects in three ways, handled below:
//   1. Names are Figma's ("Neutrals Colors/100", "BR Size 3"), so we rename them to a code scale.
//   2. Colors are objects ({hex, alpha, components}), so we flatten them to hex strings.
//   3. Cross-collection aliases are exported as resolved values plus
//      $extensions["com.figma.aliasData"], so we turn them back into {references}.
import { readFileSync } from "node:fs";
import StyleDictionary from "style-dictionary";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const core = read("tokens/figma/core.tokens.json");
const semantic = read("tokens/figma/semantic.tokens.json");
const motion = read("tokens/motion.json");

const kebab = (s) => s.trim().toLowerCase().replace(/\s+/g, "-");

// Figma path (array of names) → code path, or null to leave it out of the build.
function renamePath(path) {
  const [group, ...rest] = path;
  const leaf = path.at(-1);
  const colorGroups = {
    "Primary Colors": "primary",
    "Secondary Colors": "secondary",
    "Neutrals Colors": "neutral",
    "Overlay Colors": "overlay",
    "System Colors": "system",
  };
  if (colorGroups[group]) return ["color", colorGroups[group], ...rest.map(kebab)];
  if (/^BR /.test(group)) return ["radius", kebab(group.replace(/^BR (Size )?/, ""))];
  if (/^BW /.test(group)) return ["border-width", kebab(group.replace(/^BW Size /, ""))];
  if (group === "Sizes") return ["size", kebab(leaf.replace(/^Size /, ""))];
  if (group === "Container Default") return ["container", leaf === "Default" ? "width" : "padding-x"];
  if (group === "Typography") {
    const [kind, ...tail] = rest;
    if (kind === "Font Family") return ["font", "family", kebab(leaf.replace(/ Font$/, ""))];
    if (kind === "Font Weight") return ["font", "weight", kebab(leaf)];
    if (kind === "Font Size") {
      const [sub] = tail;
      if (sub === "Displays") return ["font", "size", "display", leaf.replace(/^Display /, "")];
      if (sub === "Paragraphs") return ["font", "size", "body", kebab(leaf)];
      return ["font", "size", "base"];
    }
  }
  // Social Media Colors, Logo Colors, Template Name: not part of the site's design language.
  return null;
}

const FONT_WEIGHTS = { Regular: 400, Medium: 500, "Semi Bold": 600, Bold: 700, "Extra Bold": 800 };
const isToken = (node) => node && typeof node === "object" && "$value" in node;

function toHex({ hex, alpha }) {
  if (alpha === undefined || alpha >= 1) return hex.toLowerCase();
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `${hex}${a}`.toLowerCase();
}

// Walks a Figma export and calls visit(figmaPath, token) for every token.
function walk(node, path, visit) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (isToken(child)) visit([...path, key], child);
    else if (child && typeof child === "object") walk(child, [...path, key], visit);
  }
}

function setIn(obj, path, value) {
  let cur = obj;
  for (const key of path.slice(0, -1)) cur = cur[key] ??= {};
  cur[path.at(-1)] = value;
}

const ref = (figmaPath) => {
  const renamed = renamePath(figmaPath);
  if (!renamed) throw new Error(`Reference to excluded Figma variable: ${figmaPath.join("/")}`);
  return `{${renamed.join(".")}}`;
};

function convertValue(figmaPath, token) {
  const { $type, $value } = token;
  const alias = token.$extensions?.["com.figma.aliasData"];
  if (alias) return { $type: $type === "number" ? "dimension" : $type, $value: ref(alias.targetVariableName.split("/")) };
  if (typeof $value === "string" && $value.startsWith("{")) {
    return { $type: "dimension", $value: ref($value.slice(1, -1).split(".")) };
  }
  if ($type === "color") return { $type, $value: toHex($value) };
  if (figmaPath.includes("Font Weight")) return { $type: "fontWeight", $value: FONT_WEIGHTS[$value] ?? $value };
  if ($type === "string") return { $type: "fontFamily", $value };
  return { $type: "dimension", $value: `${$value}px` };
}

const tokens = { motion: motion.motion };

walk(core, [], (figmaPath, token) => {
  const path = renamePath(figmaPath);
  if (path) setIn(tokens, path, convertValue(figmaPath, token));
});

// Semantic names are already code-shaped (bg/canvas → color.bg.canvas).
walk(semantic, [], (figmaPath, token) => {
  setIn(tokens, ["color", ...figmaPath], convertValue(figmaPath, token));
});

// Motion tokens as typed TS, in the units Motion expects (seconds, bezier arrays).
StyleDictionary.registerFormat({
  name: "ts/motion",
  format: ({ dictionary }) => {
    const group = (name, toValue) =>
      Object.fromEntries(
        dictionary.allTokens
          .filter((t) => t.path[1] === name)
          .map((t) => [t.path[2].replace(/-(\w)/g, (_, c) => c.toUpperCase()), toValue(t.original.$value)]),
      );
    const seconds = (v) => parseFloat(v) / 1000;
    const out = {
      duration: group("duration", seconds),
      ease: group("ease", (v) => v),
      stagger: group("stagger", seconds),
    };
    return (
      "// Generated by sd.config.mjs from tokens/motion.json. Do not edit.\n" +
      Object.entries(out)
        .map(([k, v]) => `export const ${k} = ${JSON.stringify(v, null, 2)} as const;`)
        .join("\n\n") +
      "\n"
    );
  },
});

const sd = new StyleDictionary({
  tokens,
  usesDtcg: true,
  log: { verbosity: "default", warnings: "error" },
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "ds",
      buildPath: "src/styles/",
      files: [{ destination: "tokens.css", format: "css/variables", options: { outputReferences: true } }],
    },
    ts: {
      transforms: ["name/kebab"],
      buildPath: "src/lib/motion/",
      files: [
        { destination: "tokens.generated.ts", format: "ts/motion", filter: (t) => t.path[0] === "motion" },
      ],
    },
  },
});

await sd.buildAllPlatforms();
