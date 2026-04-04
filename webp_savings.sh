#!/usr/bin/env bash
# ============================================================
# webp-savings.sh
# Scans for ORIG_* files and their WebP counterparts, then
# reports file count, total savings, and average savings.
#
# Naming convention assumed:
#   Original  →  ORIG_photo.jpg   (in any subdirectory)
#   Converted →  photo.webp       (same directory, .webp ext)
#                photo.jpg        (fallback: same name, no ORIG_ prefix)
# ============================================================

# ─── Helpers ─────────────────────────────────────────────────

get_size() {
    # GNU stat (Linux) first, then BSD/macOS stat
    stat -c%s "$1" 2>/dev/null || stat -f%z "$1" 2>/dev/null || echo 0
}

human() {
    awk -v b="$1" 'BEGIN {
        if      (b >= 1073741824) printf "%.2f GB", b / 1073741824
        else if (b >= 1048576)    printf "%.2f MB", b / 1048576
        else if (b >= 1024)       printf "%.2f KB", b / 1024
        else                      printf "%d B",    b
    }'
}

pct() {   # pct <orig_bytes> <new_bytes>
    awk -v o="$1" -v n="$2" 'BEGIN {
        if (o > 0) printf "%.1f%%", (1 - n / o) * 100
        else       print "N/A"
    }'
}

trunc() {   # trunc <string> <max_len>
    local s="$1" max="$2"
    if [ ${#s} -gt "$max" ]; then
        echo "…${s: -$(( max - 1 ))}"
    else
        echo "$s"
    fi
}

# ─── Scan ────────────────────────────────────────────────────

total_orig=0
total_webp=0
count=0
missing=0

# Collect rows: orig_size|webp_size|saved|orig_path|webp_path
rows=()

while IFS= read -r -d '' orig_file; do
    dir=$(dirname "$orig_file")
    base=$(basename "$orig_file")
    stripped="${base#ORIG_}"
    name_no_ext="${stripped%.*}"

    # Prefer <name>.webp, fall back to stripped filename as-is
    webp_file=""
    if   [[ -f "$dir/${name_no_ext}.webp" ]]; then
        webp_file="$dir/${name_no_ext}.webp"
    elif [[ -f "$dir/$stripped" ]]; then
        webp_file="$dir/$stripped"
    fi

    if [[ -n "$webp_file" ]]; then
        orig_size=$(get_size "$orig_file")
        webp_size=$(get_size "$webp_file")
        saved=$(( orig_size - webp_size ))

        total_orig=$(( total_orig + orig_size ))
        total_webp=$(( total_webp + webp_size ))
        count=$(( count + 1 ))

        rows+=("${orig_size}|${webp_size}|${saved}|${orig_file#./}|${webp_file#./}")
    else
        missing=$(( missing + 1 ))
    fi

done < <(find . -name "ORIG_*" -type f -print0 | sort -z)

# ─── Print ───────────────────────────────────────────────────

DIV="$(printf '─%.0s' {1..96})"
FMT="  %-44s  %10s  %10s  %10s  %7s\n"

printf '\n'
printf '  ╔══════════════════════════════════════╗\n'
printf '  ║   WebP Conversion Savings Report     ║\n'
printf '  ╚══════════════════════════════════════╝\n\n'

if (( count == 0 && missing == 0 )); then
    printf '  No ORIG_* files found in this directory tree.\n\n'
    exit 0
fi

# Per-file detail table
printf "$FMT" "ORIG file" "Original" "WebP" "Saved" "Ratio"
printf '  %s\n' "$DIV"

for row in "${rows[@]}"; do
    IFS='|' read -r os ws sv orig webp <<< "$row"
    label="$(trunc "$orig" 44)"
    printf "$FMT" \
        "$label" \
        "$(human "$os")" \
        "$(human "$ws")" \
        "$(human "$sv")" \
        "$(pct "$os" "$ws")"
done

printf '  %s\n\n' "$DIV"

# Summary block
total_saved=$(( total_orig - total_webp ))

if (( count > 0 )); then
    avg_orig=$(( total_orig / count ))
    avg_webp=$(( total_webp / count ))
    avg_saved=$(( total_saved / count ))

    SFMT="  %-32s %s\n"

    printf '  Files converted:                  %d\n' "$count"
    if (( missing > 0 )); then
        printf '  ORIG files without counterpart:   %d\n' "$missing"
    fi
    printf '\n'
    printf "$SFMT"  "Total original size:"     "$(human "$total_orig")"
    printf "$SFMT"  "Total WebP size:"          "$(human "$total_webp")"
    printf "$SFMT"  "Total space saved:"        "$(human "$total_saved") ($(pct "$total_orig" "$total_webp"))"
    printf '\n'
    printf "$SFMT"  "Avg original file size:"  "$(human "$avg_orig")"
    printf "$SFMT"  "Avg WebP file size:"       "$(human "$avg_webp")"
    printf "$SFMT"  "Avg savings per file:"     "$(human "$avg_saved")"
else
    printf '  No matching WebP counterparts found (%d ORIG_* files missing conversions).\n' "$missing"
fi

printf '\n'