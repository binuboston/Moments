#!/usr/bin/env node
/**
 * Converts selected daisyUI themes (MIT, © Pouya Saadeghi) into invitation
 * palettes: features/templates/palettes/daisy.generated.ts.
 *
 * daisyUI is not a dependency. Its themes are app colour schemes, so each one
 * is mapped onto the invitation roles and adjusted to pass WCAG AA:
 *   bg       base-100
 *   surface  base-100 lifted towards white (light) or the text (dark)
 *   text     base-content
 *   muted    text mixed towards bg, as soft as AA allows (>= 4.5:1)
 *   accent   the first of primary / secondary / accent reaching 4.5:1 on bg,
 *            else primary shifted in lightness (OKLCH) until it does
 *   accentContrast  black or white, whichever reads better on the accent
 *   border   base-300 (light) or text mixed into bg (dark)
 *
 * Run: node scripts/generate-daisy-palettes.mjs
 */
import { writeFileSync } from "node:fs";

const VERSION = "5.0.43";
const THEMES = ["lofi", "black", "silk", "nord", "wireframe", "cupcake", "bumblebee", "pastel", "lemonade", "fantasy", "corporate", "business", "winter", "dim", "emerald", "night", "luxury", "coffee", "forest", "garden", "valentine", "retro", "autumn", "caramellatte", "sunset", "dracula"];

// --- colour maths ---------------------------------------------------------
const clamp = (x) => Math.min(1, Math.max(0, x));
function oklchToRgb(l, c, h) {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const [L, M, S] = [l_ ** 3, m_ ** 3, s_ ** 3];
  const lin = [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
  return lin.map((v) => clamp(v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
}
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
const fromHex = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [x, y] = [lum(fromHex(a)), lum(fromHex(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const mix = (a, b, t) => toHex(fromHex(a).map((v, i) => v + (fromHex(b)[i] - v) * t));

function parseOklch(value) {
  const m = value.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) throw new Error(`Unexpected colour ${value}`);
  const l = Number(m[1]);
  return { l: value.includes("%") ? l / 100 : l, c: Number(m[2]), h: Number(m[3]) };
}
const hexOf = ({ l, c, h }) => toHex(oklchToRgb(l, c, h));

const AA = 4.5;

/** Readable on the background, and with readable button text (black or white) on top. */
const usable = (hex, bg) => contrast(hex, bg) >= AA && Math.max(contrast("#ffffff", hex), contrast("#111111", hex)) >= AA;

function accentFor(vars, bg, dark) {
  for (const key of ["primary", "secondary", "accent"]) {
    const hex = hexOf(vars[key]);
    if (usable(hex, bg)) return hex;
  }
  // Shift the primary's lightness (keeping hue and chroma) away from the background until it works.
  const p = { ...vars.primary };
  for (let i = 0; i < 100 && !usable(hexOf(p), bg); i++) p.l = clamp(p.l + (dark ? 0.01 : -0.01));
  return hexOf(p);
}

function mutedFor(text, bg) {
  let best = text;
  for (let t = 0; t <= 0.7; t += 0.02) {
    const candidate = mix(text, bg, t);
    if (contrast(candidate, bg) < AA) break;
    best = candidate;
  }
  return best;
}

function toPalette(name, css) {
  const vars = {};
  for (const [, key, value] of css.matchAll(/--color-([a-z0-9-]+):\s*(oklch\([^)]+\))/g)) vars[key] = parseOklch(value);
  const dark = /color-scheme:\s*dark/.test(css);
  const bg = hexOf(vars["base-100"]);
  const text = hexOf(vars["base-content"]);
  const accent = accentFor(vars, bg, dark);
  const accentContrast = contrast("#ffffff", accent) >= contrast("#111111", accent) ? "#ffffff" : "#111111";
  const palette = {
    id: `daisy-${name}`,
    name: name[0].toUpperCase() + name.slice(1),
    vars: {
      bg,
      surface: dark ? mix(bg, text, 0.05) : mix(bg, "#ffffff", 0.7),
      text,
      muted: mutedFor(text, bg),
      accent,
      accentContrast,
      border: dark ? mix(bg, text, 0.14) : hexOf(vars["base-300"]),
    },
  };
  palette.swatch = [bg, accent, hexOf(vars.secondary)];
  const checks = { text: contrast(text, bg), muted: contrast(palette.vars.muted, bg), accent: contrast(accent, bg), button: contrast(accentContrast, accent) };
  for (const [k, v] of Object.entries(checks)) if (v < AA) throw new Error(`${name}: ${k} contrast ${v.toFixed(2)} < ${AA}`);
  return palette;
}

const palettes = [];
for (const name of THEMES) {
  const res = await fetch(`https://unpkg.com/daisyui@${VERSION}/theme/${name}.css`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  palettes.push(toPalette(name, await res.text()));
}

const body = palettes.map((p) => `  "${p.id.slice(6)}": ${JSON.stringify(p)},`).join("\n");
writeFileSync(
  new URL("../features/templates/palettes/daisy.generated.ts", import.meta.url),
  `// Generated by scripts/generate-daisy-palettes.mjs from daisyUI ${VERSION} themes
// (MIT License, Copyright (c) 2020 Pouya Saadeghi). Do not edit by hand.
import type { Palette } from "@/features/templates/types";

export const DAISY_PALETTES = {
${body}
} satisfies Record<string, Palette>;
`,
);
console.log(`Wrote ${palettes.length} palettes`);
