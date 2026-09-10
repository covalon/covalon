// scripts/optimize-images.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { globby } from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const ORIGINALS_DIR = path.join(__dirname, '..', 'images_original');

// Dynamic size: ~0.5 bytes per pixel, clamped
const BYTES_PER_PIXEL = 0.5;
const MIN_SIZE_BYTES = 25 * 1024;       // 25 KB
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const MAX_DIMENSION = 4000;              // longest edge
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

const VERBOSE = process.argv.includes('-v') || process.argv.includes('--verbose');
const vlog = (...args) => { VERBOSE && console.log(...args) }

function getMaxBytesForImage(width, height) {
  const area = width * height;
  const target = area * BYTES_PER_PIXEL;
  return Math.max(MIN_SIZE_BYTES, Math.min(MAX_SIZE_BYTES, target));
}

// Key used to identify "the same image" regardless of which extension it currently
// has (foo.png before compression vs foo.webp after). dir + basename-without-ext.
function keyFor(relativeInImages) {
  const dir = path.dirname(relativeInImages);
  const base = path.basename(relativeInImages, path.extname(relativeInImages));
  return path.join(dir, base);
}

// image-comparison.csv is git-tracked, unlike images_original/, so it's the
// source of truth for "have we already optimized this image" across a fresh
// clone / CI run where images_original/ won't exist.
function readComparisonCsv(csvPath) {
  if (!fs.existsSync(csvPath)) return [];

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim().length > 0);

  const rows = [];
  for (let i = 1; i < lines.length; i++) { // skip header
    const fields = lines[i].split(',');
    if (fields.length < 7) continue;

    // File paths shouldn't contain commas, but just in case, treat the last
    // 6 fields as the numeric columns and everything before that as the path.
    const numeric = fields.slice(-6).map(Number);
    const filePath = fields.slice(0, fields.length - 6).join(',');

    rows.push({
      path: filePath,
      originalSize: numeric[0],
      newSize: numeric[1],
    });
  }
  return rows;
}

function findExistingOriginal(relativeInImages) {
  return alreadyHandled.has(keyFor(relativeInImages));
}

const CSV_PATH = path.join(__dirname, '..', 'image-comparison.csv');

// Module-level so processImage/findExistingOriginal can see it without
// threading it through every call.
let alreadyHandled;
let previousRowsByKey;

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('No images/ folder found – nothing to do.');
    return;
  }

  const previousRows = readComparisonCsv(CSV_PATH);
  previousRowsByKey = new Map(previousRows.map(row => [keyFor(row.path.replace(/^images[\\/]/, '')), row]));
  alreadyHandled = new Set(previousRowsByKey.keys());

  const patterns = IMAGE_EXTENSIONS.map(ext => `images/**/*.${ext}`);
  const files = await globby(patterns, { cwd: path.join(__dirname, '..') });

  if (files.length === 0) {
    console.log('No images found to process.');
    return;
  }

  console.log(`Found ${files.length} image(s) to process.\n`);

  const stats = [];

  for (const file of files) {
    const result = await processImage(file);
    if (result) stats.push(result);
  }

  await updateSrcPacks();

  printComparisonTable(stats);
  writeComparisonCsv(stats);

  console.log('\nDone! All images optimized and references updated.');
  console.log('Size comparison saved to: image-comparison.csv');
}

async function processImage(relativePath) {
  const repoRoot = path.join(__dirname, '..');
  const inputPath = path.join(repoRoot, relativePath);

  vlog(`Processing: ${relativePath}`);

  const relativeInImages = relativePath.replace(/^images[\\/]/, '');

  if (findExistingOriginal(relativeInImages)) {
    vlog(`  Skipping: already recorded in image-comparison.csv`);
    return null;
  }

  const originalPath = path.join(ORIGINALS_DIR, relativeInImages);
  const originalDir = path.dirname(originalPath);
  if (!fs.existsSync(originalDir)) {
    fs.mkdirSync(originalDir, { recursive: true });
  }

  // Get original size before moving
  const originalSize = fs.statSync(inputPath).size;

  if (!fs.existsSync(originalPath)) {
    fs.renameSync(inputPath, originalPath);
  }

  const sourcePath = originalPath;

  const webpRelative = relativeInImages.replace(/\.[^.]+$/, '.webp');
  const webpPath = path.join(repoRoot, 'images', webpRelative);

  const webpDir = path.dirname(webpPath);
  if (!fs.existsSync(webpDir)) {
    fs.mkdirSync(webpDir, { recursive: true });
  }

  let sharpInstance = sharp(sourcePath);

  const metadata = await sharpInstance.metadata();
  let width = metadata.width || 0;
  let height = metadata.height || 0;
  const longest = Math.max(width, height);

  if (longest > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / longest;
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    sharpInstance = sharpInstance.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const maxBytes = getMaxBytesForImage(width, height);

  let quality = 80;
  let outputBuffer;

  while (quality >= 20) {
    outputBuffer = await sharpInstance
      .toFormat('webp', { quality })
      .toBuffer();

    if (outputBuffer.length <= maxBytes) {
      break;
    }
    quality -= 5;
  }

  if (outputBuffer.length > maxBytes) {
    console.warn(
      `Warning: Could not get ${relativePath} under target size ` +
      `(target: ${(maxBytes / 1024).toFixed(1)} KB, actual: ${(outputBuffer.length / 1024).toFixed(1)} KB).`
    );
  }

  const wasWebp = path.extname(relativeInImages).toLowerCase() === '.webp';
  const isLarger = outputBuffer.length > originalSize;

  let newSize;

  if (wasWebp && isLarger) {
    // Recompressing an existing webp made it bigger - keep the original instead.
    fs.copyFileSync(originalPath, webpPath);
    newSize = originalSize;

    vlog(
      `  Skipped: recompressed webp was larger than original ` +
      `(${(outputBuffer.length / 1024).toFixed(1)} KB > ${(originalSize / 1024).toFixed(1)} KB). ` +
      `Kept original at: ${path.relative(repoRoot, webpPath)}`
    );
  } else {
    fs.writeFileSync(webpPath, outputBuffer);
    newSize = outputBuffer.length;

    vlog(
      `  Created: ${path.relative(repoRoot, webpPath)} ` +
      `(${(newSize / 1024).toFixed(1)} KB, max: ${(maxBytes / 1024).toFixed(1)} KB)`
    );
  }

  return {
    path: relativePath,
    originalSize,
    newSize,
    outputPath: path.relative(repoRoot, webpPath),
  };
}

async function updateSrcPacks() {
  const repoRoot = path.join(__dirname, '..');

  const files = await globby(['**/*.yml'], {
    cwd: repoRoot,
    ignore: ['node_modules/**', '.github/**'],
  });

  for (const file of files) {
    // console.log(`looking at file: ${file}`);
    const filePath = path.join(repoRoot, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const updated = content.replace(
      /(["']?)(modules\/covalon\/images\/[^"'\s]+?)\.(png|jpe?g|webp)(\\?["']?)/gi,
      (match, q1, base, ext, q2) => {
        const newPath = `${q1}${base}.webp${q2}`;
        changed = newPath !== match
        if (changed) console.log(`Changed ${match} to ${newPath}`);
        return newPath;
      }
    );

    if (changed) {
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`Updated image references in: ${file}`);
    }
  }
}

function printComparisonTable(stats) {
  console.log('\n=== Image Size Comparison ===\n');

  // Header
  console.log(
    'File'.padEnd(50),
    'Original'.padStart(10),
    'New'.padStart(10),
    'Saved'.padStart(10)
  );
  console.log('-'.repeat(90));

  let totalOriginal = 0;
  let totalNew = 0;

  for (const s of stats) {
    const originalKB = (s.originalSize / 1024).toFixed(1);
    const newKB = (s.newSize / 1024).toFixed(1);
    const savedKB = ((s.originalSize - s.newSize) / 1024).toFixed(1);
    const savedPercent =
      s.originalSize > 0
        ? ((s.originalSize - s.newSize) / s.originalSize) * 100
        : 0;

    console.log(
      s.path.padEnd(50),
      originalKB.padStart(10),
      newKB.padStart(10),
      `${savedKB} KB (${savedPercent.toFixed(1)}%)`.padStart(10)
    );

    totalOriginal += s.originalSize;
    totalNew += s.newSize;
  }

  console.log('-'.repeat(90));
  const totalOriginalKB = (totalOriginal / 1024).toFixed(1);
  const totalNewKB = (totalNew / 1024).toFixed(1);
  const totalSavedKB = ((totalOriginal - totalNew) / 1024).toFixed(1);
  const totalSavedPercent =
    totalOriginal > 0
      ? ((totalOriginal - totalNew) / totalOriginal) * 100
      : 0;

  console.log(
    'TOTAL'.padEnd(50),
    totalOriginalKB.padStart(10),
    totalNewKB.padStart(10),
    `${totalSavedKB} KB (${totalSavedPercent.toFixed(1)}%)`.padStart(10)
  );
}

function writeComparisonCsv(stats) {
  const repoRoot = path.join(__dirname, '..');
  const csvPath = CSV_PATH;

  // Start from everything already on record, then layer this run's results
  // on top (a re-processed file overwrites its old row; everything skipped
  // this run is carried forward unchanged) so the CSV keeps accumulating
  // history instead of shrinking to just this run's files.
  const merged = new Map(previousRowsByKey);
  for (const s of stats) {
    merged.set(keyFor(s.path.replace(/^images[\\/]/, '')), s);
  }
  const allStats = [...merged.values()].sort((a, b) => a.path.localeCompare(b.path));

  const header = 'File,OriginalBytes,NewBytes,OriginalKB,NewKB,SavedKB,SavedPercent\n';
  const lines = allStats.map(s => {
    const originalKB = s.originalSize / 1024;
    const newKB = s.newSize / 1024;
    const savedKB = (s.originalSize - s.newSize) / 1024;
    const savedPercent =
      s.originalSize > 0
        ? ((s.originalSize - s.newSize) / s.originalSize) * 100
        : 0;

    return [
      s.path,
      s.originalSize,
      s.newSize,
      originalKB.toFixed(2),
      newKB.toFixed(2),
      savedKB.toFixed(2),
      savedPercent.toFixed(2),
    ].join(',');
  });

  const csvContent = header + lines.join('\n');
  fs.writeFileSync(csvPath, csvContent, 'utf8');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});