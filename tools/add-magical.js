#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let folder    = '.';
let recursive = false;
let dryRun    = false;

for (const arg of args) {
    switch (arg) {
        case '-r': case '--recursive': recursive = true; break;
        case '-d': case '--dry-run':   dryRun    = true; break;
        case '-h': case '--help':
            console.log(
`Usage: node add-magical-trait.js [OPTIONS] <folder>

Adds "- magical" to traits.value lists that have "- primal" but not "- magical".

Options:
  -r, --recursive   Search subdirectories recursively (default: top-level only)
  -d, --dry-run     Preview changes without modifying files
  -h, --help        Show this help`);
            process.exit(0);
        default:
            if (!arg.startsWith('-')) folder = arg;
    }
}

if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
    console.error(`Error: '${folder}' is not a directory`);
    process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getIndent(line) {
    const trimmed = line.replace(/^\s+/, '');
    return trimmed.trim() ? line.length - trimmed.length : 0;
}

// ── File processing ───────────────────────────────────────────────────────────
function processFile(filepath) {
    const raw    = fs.readFileSync(filepath, 'utf8');
    const eol    = raw.includes('\r\n') ? '\r\n' : '\n';
    const lines  = raw.replace(/\r\n/g, '\n').split('\n');

    const result   = [];
    const inserted = new Set(); // tracks which result[] indices we added
    let i       = 0;
    let changed = false;

    while (i < lines.length) {
        const line = lines[i];

        // ── Match `traits:` at any indentation, no inline value ──────────────
        if (/^\s*traits\s*:\s*$/.test(line)) {
            const traitsIndent = getIndent(line);
            result.push(line);
            i++;

            // Scan within traits block for `value:`
            while (i < lines.length) {
                const curr        = lines[i];
                const currTrimmed = curr.trim();

                if (!currTrimmed) { result.push(curr); i++; continue; }   // blank

                const currIndent = getIndent(curr);

                // Dedented back to traits level → left the block
                if (currIndent <= traitsIndent && !currTrimmed.startsWith('-')) break;

                // ── Match `value:` ────────────────────────────────────────────
                if (/^\s*value\s*:\s*$/.test(curr)) {
                    const valueIndent = currIndent;
                    result.push(curr);
                    i++;

                    let hasPrimal      = false;
                    let hasMagical     = false;
                    let lastListIndent = null;

                    // Collect list items
                    while (i < lines.length) {
                        const item        = lines[i];
                        const itemTrimmed = item.trim();

                        if (!itemTrimmed) break;                           // blank ends list

                        const itemIndent = getIndent(item);
                        if (itemIndent <= valueIndent) break;              // dedented

                        const m = item.match(/^(\s*)-\s+(\S.*?)\s*$/);
                        if (m) {
                            const tag = m[2].trim();
                            if (tag === 'primal')  hasPrimal  = true;
                            if (tag === 'magical') hasMagical = true;
                            lastListIndent = m[1];
                            result.push(item);
                            i++;
                        } else {
                            break;
                        }
                    }

                    // Insert `- magical` if primal present and magical absent
                    if (hasPrimal && !hasMagical && lastListIndent !== null) {
                        inserted.add(result.length);
                        result.push(`${lastListIndent}- magical`);
                        changed = true;
                    }

                    continue;
                }

                result.push(curr);
                i++;
            }
            continue;
        }

        result.push(line);
        i++;
    }

    if (!changed) return false;

    if (dryRun) {
        console.log(`  [DRY RUN]  ${filepath}`);
        for (const idx of inserted) {
            console.log(`             + ${result[idx]}`);
        }
    } else {
        fs.writeFileSync(filepath, result.join(eol), 'utf8');
        console.log(`  [MODIFIED] ${filepath}`);
    }
    return true;
}

// ── File discovery ────────────────────────────────────────────────────────────
function findYamlFiles(dir, recurse) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && recurse) {
            files.push(...findYamlFiles(full, true));
        } else if (entry.isFile() && /\.(yml|yaml)$/i.test(entry.name)) {
            files.push(full);
        }
    }
    return files;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const files = findYamlFiles(folder, recursive);

console.log(`Scanning: ${folder}`);
if (dryRun) console.log('(dry run — no files will be modified)');
console.log('---');

let modified  = 0;
let unchanged = 0;

for (const file of files) {
    if (processFile(file)) modified++;
    else unchanged++;
}

console.log('---');
console.log(dryRun
    ? `Would modify: ${modified} | Skipped: ${unchanged}`
    : `Modified: ${modified} | Unchanged: ${unchanged}`
);