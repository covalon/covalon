import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

const PACKAGE_ID = process.cwd();
const OUT_ROOT = `${PACKAGE_ID}/src/packs`;
const expandAdventures = true;
const folders = true;
const DROP_KEYS = new Set(); // set to new Set() to keep _stats

const packs = await fs.readdir("./packs");
for (const pack of packs) {
  if (pack.startsWith(".")) continue;
  console.log("Unpacking " + pack);
  await extractPack(
    `${PACKAGE_ID}/packs/${pack}`,
    `${OUT_ROOT}/${pack}`,
    {
      yaml: false,
      transformName,
      expandAdventures,
      folders,
      clean: true
    }
  );
}

console.log("Normalizing output");
const files = await walk(OUT_ROOT);
for (const file of files) {
  const doc = JSON.parse(await fs.readFile(file, "utf8"));
  const normalized = JSON.stringify(sortKeys(doc), null, 2) + "\n";
  await fs.writeFile(file, normalized);
}
console.log(`Normalized ${files.length} files`);

/**
 * Prefaces the document with its type
 * @param {object} doc - The document data
 */
function transformName(doc, context) {
  const safeFileName = doc.name.replace(/[^a-zA-Z0-9А-я]/g, "_");

  const prefix = ["Actor", "Item"].includes(context.documentType) ? doc.type : context.documentType;

  let name = `${doc.name ? `${prefix}_${safeFileName}_${doc._id}` : doc._id}.json`;
  if (context.folder) name = path.join(context.folder, name);
  return name;
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .filter(k => !DROP_KEYS.has(k))
        .sort()
        .map(k => [k, sortKeys(value[k])])
    );
  }
  return value;
}

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(p));
    else if (entry.name.endsWith(".json")) out.push(p);
  }
  return out;
}