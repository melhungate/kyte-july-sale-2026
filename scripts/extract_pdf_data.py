#!/usr/bin/env python3
"""
Extract structured Friday/Sunday sale data from the Anniversary Sale Look Book PDF.

Layout, per product page (confirmed by inspecting word bounding boxes):
  - Header zone (top < 120pt): "Friday |" or "Sunday |", then the category/body-style name.
  - Grid zone (120 <= top < ~585pt): a 4-column grid of print/colorway names, each
    row ~128pt apart. A print name that wraps to a second line sits ~11pt below
    its first line, with an overlapping x-range (e.g. "Small Magnolia" / "on Midnight").
  - Optional callout badge: an ALL-CAPS repeat of one featured print name, ~23pt
    below the last grid row, followed ~35pt later by "Starting at $X". Only present
    on one page per category (continuation pages have no callout/price).
  - Footer disclaimer (top >= 585pt): constant boilerplate text on every page, ignored.

Usage: python3 scripts/extract_pdf_data.py
Outputs:
  data/pdf_sale_data.json       - [{day, category, starting_price, prints[], pages[]}]
  data/pdf_extraction_log.md    - human-readable per-page dump for manual spot-checking
  data/print_day_map.json       - normalized print name -> {days: [...], categories: {day: [category,...]}}
  data/category_day_price_map.json - "category|day" -> starting_price
"""
import json
import re
import sys
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("pdfplumber is required. Install with: pip install pdfplumber", file=sys.stderr)
    print("(or: source .venv/bin/activate && pip install pdfplumber)", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / "Anniversary_Sale_Look_Book.pdf"
DATA_DIR = ROOT / "data"

HEADER_MAX_TOP = 120.0
FOOTER_MIN_TOP = 585.0
ROW_GAP_THRESHOLD = 18.0   # gap > this starts a new row-band; wraps are ~11pt, grid rows ~128pt apart
CELL_GAP_THRESHOLD = 6.0  # x-gap > this starts a new cell within a row (words in the
                          # same print name sit ~2-3pt apart; even tightly-packed
                          # adjacent print names sit at least ~8pt apart)


def cluster_by_gap(values_with_items, key, threshold):
    """Sort items by `key`, split into groups whenever the gap between
    consecutive values exceeds `threshold`. Returns list of groups (lists of items)."""
    items = sorted(values_with_items, key=key)
    groups = []
    current = []
    prev = None
    for item in items:
        v = key(item)
        if prev is not None and (v - prev) > threshold:
            groups.append(current)
            current = []
        current.append(item)
        prev = v
    if current:
        groups.append(current)
    return groups


def split_by_visual_gap(words_sorted_by_x0, threshold):
    """Split words (already sorted by x0) into groups using the true visual gap
    (previous word's x1 to next word's x0), not a gap between x0 values directly —
    a two-word cell like "Ecru Roar" has an x0-to-x0 delta of ~24pt (bigger than
    the ~3pt true gap) simply because "Ecru" itself is ~22pt wide."""
    groups = []
    current = []
    prev_x1 = None
    for w in words_sorted_by_x0:
        if prev_x1 is not None and (w["x0"] - prev_x1) > threshold:
            groups.append(current)
            current = []
        current.append(w)
        prev_x1 = w["x1"]
    if current:
        groups.append(current)
    return groups


def band_to_cells(band_words):
    """Group a row-band's words into cells (print names), handling 2-line wraps
    by overlapping x-range with the topmost sub-line's cells."""
    sublines = cluster_by_gap(band_words, key=lambda w: w["top"], threshold=2.0)
    sublines.sort(key=lambda words: min(w["top"] for w in words))

    cells = []  # each: {"x0": min, "x1": max, "words": [(top, x0, text), ...]}
    for i, subline in enumerate(sublines):
        subline_sorted = sorted(subline, key=lambda w: w["x0"])
        subgroups = split_by_visual_gap(subline_sorted, CELL_GAP_THRESHOLD)
        for group in subgroups:
            x0 = min(w["x0"] for w in group)
            x1 = max(w["x1"] for w in group)
            text = " ".join(w["text"] for w in sorted(group, key=lambda w: w["x0"]))
            if i == 0:
                cells.append({"x0": x0, "x1": x1, "lines": [(min(w['top'] for w in group), text)]})
            else:
                # find an existing cell whose x-range overlaps this group's x-range
                best = None
                for c in cells:
                    overlap = min(c["x1"], x1) - max(c["x0"], x0)
                    if overlap > 0:
                        best = c
                        break
                if best is not None:
                    best["lines"].append((min(w['top'] for w in group), text))
                    best["x0"] = min(best["x0"], x0)
                    best["x1"] = max(best["x1"], x1)
                else:
                    cells.append({"x0": x0, "x1": x1, "lines": [(min(w['top'] for w in group), text)]})

    result = []
    for c in cells:
        lines_sorted = sorted(c["lines"], key=lambda l: l[0])
        result.append(" ".join(text for _, text in lines_sorted))
    return result


def parse_page(page, page_number):
    words = page.extract_words(keep_blank_chars=False)
    if not words:
        return None

    # Product pages have title-case "Friday"/"Sunday" immediately followed by "|".
    # The table-of-contents page instead has all-caps "FRIDAY SUNDAY" as a section
    # header with no pipe, so an exact-case match here also filters out the TOC.
    day_word = next((w for w in words if w["text"] in ("Friday", "Sunday")), None)
    if day_word is None:
        return None  # title page, TOC, disclaimer page

    day = day_word["text"].lower()

    header_words = [w for w in words if w["top"] < HEADER_MAX_TOP and w["text"] not in ("|",)
                     and w["text"] not in ("Friday", "Sunday")]
    header_words.sort(key=lambda w: (round(w["top"]), w["x0"]))
    category = " ".join(w["text"] for w in header_words).strip()
    # collapse accidental double spaces from multi-line titles
    category = re.sub(r"\s+", " ", category)

    zone_words = [w for w in words if HEADER_MAX_TOP <= w["top"] < FOOTER_MIN_TOP]
    bands = cluster_by_gap(zone_words, key=lambda w: w["top"], threshold=ROW_GAP_THRESHOLD)
    bands.sort(key=lambda band: min(w["top"] for w in band))

    price_band_idx = None
    starting_price = None
    for i, band in enumerate(bands):
        band_text = " ".join(w["text"] for w in band)
        m = re.search(r"Starting at \$(\d+(?:\.\d+)?)", band_text)
        if m:
            price_band_idx = i
            starting_price = float(m.group(1))
            if starting_price.is_integer():
                starting_price = int(starting_price)
            break

    callout_band_idx = None
    featured_print = None
    if price_band_idx is not None:
        # the callout (all-caps featured print) is the band immediately before the price band
        callout_band_idx = price_band_idx - 1 if price_band_idx > 0 else None
        if callout_band_idx is not None:
            featured_print = " ".join(w["text"] for w in bands[callout_band_idx]).title()

    grid_bands = [
        band for i, band in enumerate(bands)
        if i != price_band_idx and i != callout_band_idx
    ]

    # A few pages have a decorative background/ribbon graphic with duplicated text
    # rendered at a slight offset from real content, which pdfplumber extracts as
    # garbled, overlapping words (e.g. "RARINUSBTO RWA IONNBO"). Every legitimate
    # grid print name is Title Case; these artifacts are ALL-CAPS or bare digits,
    # so filter them out rather than let corrupted strings into the data.
    dropped_artifacts = []
    cleaned_grid_bands = []
    for band in grid_bands:
        kept = [w for w in band if not (w["text"].isupper() or w["text"].isdigit())]
        dropped = [w["text"] for w in band if w["text"].isupper() or w["text"].isdigit()]
        if dropped:
            dropped_artifacts.extend(dropped)
        if kept:
            cleaned_grid_bands.append(kept)
    grid_bands = cleaned_grid_bands

    prints = []
    for band in grid_bands:
        prints.extend(band_to_cells(band))

    return {
        "page": page_number,
        "day": day,
        "category": category,
        "starting_price": starting_price,
        "featured_print": featured_print,
        "prints": prints,
        "dropped_artifacts": dropped_artifacts,
    }


def normalize_apostrophes(name):
    # The PDF (and Kyte's own product_type strings) mix curly (') and
    # straight (') apostrophes inconsistently for the same word (e.g.
    # "Boy's Briefs" vs "Boy's Briefs") — unify so alias lookups match.
    return name.replace("’", "'")


def normalize_category(name):
    return normalize_apostrophes(re.sub(r"\s+", " ", name.strip()).lower())


BRAND_PREFIXES = ["harry potter ", "hot wheels "]


def strip_brand_prefix(lowered_name):
    # The PDF names licensed-collab prints with their brand prefix
    # ("Harry Potter™ Hufflepuff", "Hot Wheels™ Fast and Fierce"), but Kyte's
    # own product data drops it (option1 is just "Hufflepuff™"/"Fast and
    # Fierce") — strip it so print_day_map lookups agree with resolve_sale_data.py.
    for prefix in BRAND_PREFIXES:
        if lowered_name.startswith(prefix):
            return lowered_name[len(prefix):]
    return lowered_name


def normalize_print(name, print_aliases=None):
    n = name.strip()
    if print_aliases:
        n = print_aliases.get(n, n)
    n = n.rstrip("*")
    n = re.sub(r"\s+", " ", n)
    n = normalize_apostrophes(n.lower())
    return strip_brand_prefix(n)


def main():
    DATA_DIR.mkdir(exist_ok=True)

    aliases_path = ROOT / "scripts" / "aliases.json"
    print_aliases = json.loads(aliases_path.read_text()).get("print_aliases", {}) if aliases_path.exists() else {}

    with pdfplumber.open(PDF_PATH) as pdf:
        total_pages = len(pdf.pages)
        page_results = []
        for i, page in enumerate(pdf.pages):
            page_number = i + 1
            parsed = parse_page(page, page_number)
            if parsed:
                page_results.append(parsed)

    # merge multi-page categories (same day + normalized category, consecutive or not)
    merged = {}
    order = []
    for pr in page_results:
        key = (pr["day"], normalize_category(pr["category"]))
        if key not in merged:
            merged[key] = {
                "day": pr["day"],
                "category": pr["category"],
                "starting_price": pr["starting_price"],
                "prints": [],
                "pages": [],
            }
            order.append(key)
        entry = merged[key]
        if entry["starting_price"] is None and pr["starting_price"] is not None:
            entry["starting_price"] = pr["starting_price"]
        entry["pages"].append(pr["page"])
        for p in pr["prints"]:
            if p not in entry["prints"]:
                entry["prints"].append(p)

    entries = [merged[k] for k in order]

    # build print_day_map: normalized print -> {days: [...], categories: {day: [categories]}}
    print_day_map = {}
    for e in entries:
        for p in e["prints"]:
            np = normalize_print(p, print_aliases)
            slot = print_day_map.setdefault(np, {"display_name": p, "days": [], "categories": {}})
            if e["day"] not in slot["days"]:
                slot["days"].append(e["day"])
            slot["categories"].setdefault(e["day"], [])
            if e["category"] not in slot["categories"][e["day"]]:
                slot["categories"][e["day"]].append(e["category"])

    # build category_day_price_map
    category_day_price_map = {}
    for e in entries:
        if e["starting_price"] is not None:
            key = f"{normalize_category(e['category'])}|{e['day']}"
            category_day_price_map[key] = e["starting_price"]

    (DATA_DIR / "pdf_sale_data.json").write_text(json.dumps({
        "source_pdf": PDF_PATH.name,
        "total_pages": total_pages,
        "entries": entries,
    }, indent=2))

    (DATA_DIR / "print_day_map.json").write_text(json.dumps(print_day_map, indent=2, sort_keys=True))
    (DATA_DIR / "category_day_price_map.json").write_text(json.dumps(category_day_price_map, indent=2, sort_keys=True))

    dual_day_prints = {k: v for k, v in print_day_map.items() if len(v["days"]) > 1}

    # human-readable log
    lines = [f"# PDF Extraction Log — {PDF_PATH.name} ({total_pages} pages)\n"]
    lines.append(f"Parsed {len(page_results)} product pages into {len(entries)} merged (day, category) entries.\n")
    if dual_day_prints:
        lines.append(f"## ⚠️ Dual-day prints ({len(dual_day_prints)}) — appear under both Friday and Sunday for different categories\n")
        for np, info in sorted(dual_day_prints.items()):
            lines.append(f"- **{info['display_name']}** — Friday: {', '.join(info['categories'].get('friday', []))} | Sunday: {', '.join(info['categories'].get('sunday', []))}")
        lines.append("")

    all_dropped = [(pr["page"], pr["dropped_artifacts"]) for pr in page_results if pr["dropped_artifacts"]]
    if all_dropped:
        lines.append(f"## ⚠️ Dropped rendering artifacts ({sum(len(d) for _, d in all_dropped)} tokens on {len(all_dropped)} pages)\n")
        lines.append("Some pages have a decorative background/ribbon graphic whose text overlaps real content and extracts as garbled ALL-CAPS tokens (not real print names). These were dropped rather than left corrupted — cross-check the affected page visually in case a real print name was only present in that decorative text.\n")
        for page_num, tokens in all_dropped:
            lines.append(f"- Page {page_num}: {' '.join(tokens)}")
        lines.append("")

    lines.append("## Per-page raw extraction\n")
    for pr in page_results:
        lines.append(f"### Page {pr['page']} — {pr['day'].upper()} — {pr['category']}")
        if pr["starting_price"] is not None:
            lines.append(f"- Starting price: ${pr['starting_price']}")
        if pr["featured_print"]:
            lines.append(f"- Featured print callout: {pr['featured_print']}")
        lines.append(f"- Prints ({len(pr['prints'])}): {', '.join(pr['prints'])}")
        lines.append("")

    lines.append("## Merged (day, category) entries\n")
    for e in entries:
        lines.append(f"### {e['day'].upper()} — {e['category']} (pages {e['pages']})")
        lines.append(f"- Starting price: ${e['starting_price']}" if e["starting_price"] is not None else "- Starting price: **NOT FOUND**")
        lines.append(f"- Prints ({len(e['prints'])}): {', '.join(e['prints'])}")
        lines.append("")

    (DATA_DIR / "pdf_extraction_log.md").write_text("\n".join(lines))

    print(f"Parsed {len(page_results)} product pages -> {len(entries)} merged entries")
    print(f"Dual-day prints flagged: {len(dual_day_prints)}")
    entries_missing_price = [e for e in entries if e["starting_price"] is None]
    print(f"Entries missing a price: {len(entries_missing_price)}")
    for e in entries_missing_price:
        print(f"  - {e['day']} / {e['category']} (pages {e['pages']})")
    print(f"\nWrote data/pdf_sale_data.json, data/print_day_map.json, data/category_day_price_map.json, data/pdf_extraction_log.md")


if __name__ == "__main__":
    main()
