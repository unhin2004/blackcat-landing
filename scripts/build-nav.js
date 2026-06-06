#!/usr/bin/env node
/*
 * Nav inliner. Reads _partials/nav.html and writes its contents between
 * the <!-- NAV-INJECT START --> ... <!-- NAV-INJECT END --> markers in
 * every HTML page that contains them.
 *
 * Run: npm run build:nav
 *
 * If a page has no markers, it is skipped — add the marker pair where the
 * nav should live to opt the page in.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PARTIAL_PATH = path.join(ROOT, "_partials", "nav.html");
const START = "<!-- NAV-INJECT START -->";
const END = "<!-- NAV-INJECT END -->";
const GEN_BANNER =
  "  <!-- Generated from _partials/nav.html — edit there, run `npm run build:nav` -->";

const SKIP_DIRS = new Set([".git", "node_modules", "_partials", "scripts", "dist", "src"]);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      yield full;
    }
  }
}

function inline(partial, source) {
  const startIdx = source.indexOf(START);
  if (startIdx === -1) return null;
  const endIdx = source.indexOf(END, startIdx);
  if (endIdx === -1) {
    throw new Error(`Found ${START} but no matching ${END}`);
  }
  const before = source.slice(0, startIdx + START.length);
  const after = source.slice(endIdx);
  return `${before}\n${GEN_BANNER}\n${partial}\n  ${after}`;
}

function main() {
  if (!fs.existsSync(PARTIAL_PATH)) {
    console.error(`Missing partial: ${PARTIAL_PATH}`);
    process.exit(1);
  }
  const partial = fs.readFileSync(PARTIAL_PATH, "utf8").trim();

  let changed = 0;
  let skipped = 0;
  let unchanged = 0;
  for (const file of walk(ROOT)) {
    const rel = path.relative(ROOT, file);
    const src = fs.readFileSync(file, "utf8");
    let next;
    try {
      next = inline(partial, src);
    } catch (e) {
      console.error(`  ERROR ${rel}: ${e.message}`);
      process.exit(1);
    }
    if (next === null) {
      skipped++;
      continue;
    }
    if (next === src) {
      unchanged++;
      console.log(`  unchanged  ${rel}`);
      continue;
    }
    fs.writeFileSync(file, next);
    changed++;
    console.log(`  updated    ${rel}`);
  }
  console.log(
    `\n${changed} updated, ${unchanged} already current, ${skipped} skipped (no markers)`
  );
}

main();
