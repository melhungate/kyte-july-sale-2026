#!/usr/bin/env python3
"""
Resolve day + price for every product in the predictions dataset, using the
PDF-derived print_day_map / category_day_price_map where they cover something,
falling back to sensible defaults elsewhere. Also creates supplementary entries
for PDF (category, print) combos that have no matching predictions product at
all (brand-new prints not yet live on Kyte's site).

Two-directional logic (see PLAN in repo root / README for the full rationale):
  (a) Every predictions product gets a day (from print_day_map, else Friday-default)
      and a price (from category_day_price_map for its (category, day), else its
      own predictions min-max price range).
  (b) Every PDF (category, print, day) entry not covered by any predictions
      product becomes a supplementary swatch/placeholder entry.

Usage: python3 scripts/resolve_sale_data.py
Outputs:
  data/resolved_sale_data.json   - final SaleEntry[] structure (see build_sale_entries)
  public/product-photos/*        - copied real photos for matched-product prints
  MISSING_SWATCHES.md            - prints with no image anywhere (repo root)
  scripts/day_conflicts_defaulted.md
  scripts/carryover_defaulted.md
  scripts/near_miss_review.md
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
SCRIPTS_DIR = ROOT / "scripts"
PREDICTIONS_IMAGES_DIR = Path("/Users/melaniehungate/kyte_july_sale_predictions/images")
PRODUCT_PHOTOS_DIR = ROOT / "public" / "product-photos"
PRINT_IMAGES_TS = ROOT / "src" / "data" / "printImages.ts"
LOCAL_SWATCHES_DIR = ROOT / "public" / "swatches"


def normalize_apostrophes(name):
    # The PDF (and Kyte's own product_type strings) mix curly (') and
    # straight (') apostrophes inconsistently for the same word (e.g.
    # "Boy's Briefs" vs "Boy's Briefs") — unify so alias lookups and id
    # slugs agree instead of silently producing two separate entries.
    return name.replace("’", "'")


def normalize_category(name):
    return normalize_apostrophes(re.sub(r"\s+", " ", name.strip()).lower())


BRAND_PREFIXES = ["harry potter ", "hot wheels "]


def strip_brand_prefix(lowered_name):
    # The PDF names licensed-collab prints with their brand prefix
    # ("Harry Potter™ Hufflepuff", "Hot Wheels™ Fast and Fierce"), but Kyte's
    # own product data drops it (option1 is just "Hufflepuff™"/"Fast and
    # Fierce") — strip it so the two sides compare equal.
    for prefix in BRAND_PREFIXES:
        if lowered_name.startswith(prefix):
            return lowered_name[len(prefix):]
    return lowered_name


def normalize_print(name, print_aliases):
    n = name.strip()
    n = print_aliases.get(n, n)
    n = n.rstrip("*")
    n = n.replace("™", "").replace("®", "").replace("©", "")
    n = re.sub(r"\s+", " ", n).strip()
    n = normalize_apostrophes(n.lower())
    return strip_brand_prefix(n)


def load_swatch_database():
    """Extract name -> remote URL from kyte_coding's printDatabase (a plain JS
    object literal: "Print Name": "https://...") without needing a JS parser."""
    text = PRINT_IMAGES_TS.read_text()
    db = {}
    for m in re.finditer(r'"([^"]+)":\s*"(https?://[^"]+)"', text):
        db[m.group(1)] = m.group(2)
    return db


def load_local_swatch_files():
    """slug (filename stem) -> relative path under public/, e.g. "hufflepuff" ->
    "swatches/hufflepuff.jpg". No leading slash: the app must prepend
    import.meta.env.BASE_URL, same reasoning as the product-photo paths."""
    if not LOCAL_SWATCHES_DIR.exists():
        return {}
    return {
        p.stem: f"swatches/{p.name}"
        for p in LOCAL_SWATCHES_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")
    }


def slugify(name):
    name = name.replace("&", " and ")
    return re.sub(r"\s+", "-", re.sub(r"[^\w\s-]", "", name.strip().lower()))


def build_category_matchers(category_aliases):
    """Returns list of (pdf_category_normalized, [(product_type, title_prefix_or_None), ...])"""
    matchers = []
    for pdf_category, specs in category_aliases.items():
        conditions = [(s["product_type"], s.get("title_prefix")) for s in specs]
        matchers.append((pdf_category, conditions))
    return matchers


def match_product_category(product, matchers):
    for pdf_category, conditions in matchers:
        for product_type, title_prefix in conditions:
            if product["product_type"] != product_type:
                continue
            if title_prefix and not product["title"].startswith(title_prefix):
                continue
            return pdf_category
    return None


def main():
    aliases = json.loads((SCRIPTS_DIR / "aliases.json").read_text())
    category_aliases = aliases["category_aliases"]
    print_aliases = aliases.get("print_aliases", {})

    pdf_data = json.loads((DATA_DIR / "pdf_sale_data.json").read_text())
    print_day_map = json.loads((DATA_DIR / "print_day_map.json").read_text())
    category_day_price_map = json.loads((DATA_DIR / "category_day_price_map.json").read_text())
    predictions = json.loads((DATA_DIR / "predictions_data.json").read_text())

    swatch_database = load_swatch_database()
    swatch_database_lower = {n.lower(): url for n, url in swatch_database.items()}
    local_swatch_files = load_local_swatch_files()  # slug -> "swatches/xxx.jpg"

    matchers = build_category_matchers(category_aliases)

    # normalized PDF category -> original display text (e.g. "0.5 tog sleep bag" -> "0.5 TOG Sleep Bag")
    category_display_names = {}
    for pdf_entry in pdf_data["entries"]:
        category_display_names.setdefault(normalize_category(pdf_entry["category"]), pdf_entry["category"])

    PRODUCT_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

    # entries keyed by category_normalized -> {name, section, prints: []} (each
    # print carries its own resolved `day`; fridayPrints/sundayPrints are split
    # out of this single flat list at TS-codegen time)
    entries = {}
    covered_category_print_pairs = set()  # (pdf_category_normalized, normalized_print)
    carryover_defaulted = []
    conflict_defaulted = []
    copied_photos = 0

    def get_entry(day, category_display, category_norm):
        key = category_norm
        if key not in entries:
            entries[key] = {
                "id": slugify(category_display),
                "name": category_display,
                "section": derive_section(category_display),
                "prints": [],
            }
        return entries[key]

    def derive_section(category_display):
        c = category_display.lower()
        if "sleep bag" in c or "swaddle" in c:
            return "Sleep Bags & Swaddles"
        if "pajama" in c:
            return "Pajamas"
        if "bodysuit" in c:
            return "Bodysuits"
        if "romper" in c or "footie" in c:
            return "Rompers & Footies"
        if "dress" in c:
            return "Dresses"
        if "tee" in c or "shirt" in c:
            return "Tees"
        if "brief" in c or "undies" in c or "shorties" in c or "underwear" in c:
            return "Underwear"
        if "bib" in c:
            return "Bibs"
        return "Other"

    # (a) every predictions product
    for product in predictions["products"]:
        variants = product.get("variants", [])
        if not variants:
            continue
        print_name_raw = variants[0].get("option1") or ""
        if not print_name_raw:
            continue
        normalized_print = normalize_print(print_name_raw, print_aliases)

        matched_category = match_product_category(product, matchers)

        day_info = print_day_map.get(normalized_print)
        if day_info is None:
            day = "friday"
            day_source = "default-carryover"
            carryover_defaulted.append((print_name_raw, product["product_type"]))
        elif len(day_info["days"]) == 1:
            day = day_info["days"][0]
            day_source = "pdf"
        else:
            day = "friday"
            day_source = "default-conflict"
            conflict_defaulted.append((print_name_raw, product["product_type"], day_info["days"]))

        price_source = "predictions"
        price = {"min": product["min_price"], "max": product["max_price"]}
        price_override = None  # set to a flat number when the PDF price can't be trusted beyond the smallest size
        if matched_category is not None:
            covered_category_print_pairs.add((matched_category, normalized_print))
            pdf_price = category_day_price_map.get(f"{matched_category}|{day}")
            if pdf_price is not None:
                if abs(product["min_price"] - pdf_price) < 0.01:
                    # The PDF's "starting at" price matches this product's own
                    # smallest-size price exactly, so its real per-size price
                    # ladder (e.g. $25/$26/$28 for bigger toddler sizes) is
                    # presumably still accurate through the sale — keep it
                    # instead of flattening away real size-based variation.
                    price = {"min": product["min_price"], "max": product["max_price"]}
                    price_source = "pdf-confirmed"
                else:
                    # PDF price doesn't match this product's live starting
                    # price at all — something changed (a promo price that
                    # doesn't follow the normal size ladder). Don't guess at
                    # what bigger sizes cost; show a flat "starting at" price.
                    price = {"min": pdf_price, "max": pdf_price}
                    price_source = "pdf-starting-only"
                    price_override = pdf_price

        # copy the real photo into this repo, if not already copied
        local_image = product.get("local_image")
        photo_path = None
        if local_image:
            src = PREDICTIONS_IMAGES_DIR / Path(local_image).name
            dst = PRODUCT_PHOTOS_DIR / Path(local_image).name
            if src.exists():
                if not dst.exists():
                    shutil.copy2(src, dst)
                    copied_photos += 1
                # No leading slash: Vite serves this repo under a /kyte-july-sale-2026/
                # base path, so the app must prepend import.meta.env.BASE_URL at
                # render time rather than hardcoding a root-relative path here.
                photo_path = f"product-photos/{Path(local_image).name}"

        variant_sizes = []
        for v in variants:
            size = v.get("option2") or "One Size"
            variant_price = price_override if price_override is not None else v.get("price")
            variant_sizes.append({"size": size, "sku": v.get("sku"), "price": variant_price})

        enriched_print = {
            "name": print_name_raw,
            "day": day,
            "daySource": day_source,
            "source": "predictions-product",
            "imageUrl": photo_path,
            "price": price,
            "priceSource": price_source,
            "productMatch": {
                "productId": product["id"],
                "productTitle": product["title"],
                "productUrl": product["url"],
                "localImage": photo_path,
                "variants": variant_sizes,
            },
        }

        if matched_category is not None:
            category_display = category_display_names.get(matched_category, matched_category)
            category_norm = matched_category
        else:
            category_display = product["product_type"]
            category_norm = normalize_category(product["product_type"])
        entry = get_entry(day, category_display, category_norm)
        entry["prints"].append(enriched_print)

    # (b) PDF-only entries: (category, print, day) not covered by any predictions product
    missing_swatches = []  # (day, category, print)
    pdf_only_swatch_count = 0
    for pdf_entry in pdf_data["entries"]:
        day = pdf_entry["day"]
        category_display = pdf_entry["category"]
        category_norm = normalize_category(category_display)
        price = pdf_entry["starting_price"]
        for print_name in pdf_entry["prints"]:
            normalized_print = normalize_print(print_name, print_aliases)
            if (category_norm, normalized_print) in covered_category_print_pairs:
                continue  # already represented by a real predictions product

            # try swatch fallback: remote printDatabase URL first (exact, then
            # case-insensitive), then a local public/swatches/ file, trying
            # both the raw print name's slug and the normalized (brand-prefix
            # stripped, alias-applied) slug so e.g. "Harry Potter™ Hufflepuff"
            # finds a file saved simply as "hufflepuff.jpg".
            image_url = None
            source = "pdf-only-missing"
            if print_name in swatch_database:
                image_url = swatch_database[print_name]
                source = "pdf-only-swatch"
            elif print_name.lower() in swatch_database_lower:
                image_url = swatch_database_lower[print_name.lower()]
                source = "pdf-only-swatch"
            else:
                for candidate in (slugify(print_name), slugify(normalized_print)):
                    if candidate in local_swatch_files:
                        image_url = local_swatch_files[candidate]
                        source = "pdf-only-swatch"
                        break

            if source == "pdf-only-swatch":
                pdf_only_swatch_count += 1
            else:
                missing_swatches.append((day, category_display, print_name))

            enriched_print = {
                "name": print_name,
                "day": day,
                "daySource": "pdf",
                "source": source,
                "imageUrl": image_url,
                "price": {"min": price, "max": price} if price is not None else None,
                # No live product to compare against, so we can't confirm the
                # PDF's "starting at" price holds for larger sizes either.
                "priceSource": "pdf-starting-only",
                "productMatch": None,
            }
            entry = get_entry(day, category_display, category_norm)
            entry["prints"].append(enriched_print)

    sale_entries = list(entries.values())
    (DATA_DIR / "resolved_sale_data.json").write_text(json.dumps(sale_entries, indent=2))

    # MISSING_SWATCHES.md
    unique_prints = {}  # lowercase -> first-seen display casing
    for _, _, print_name in missing_swatches:
        unique_prints.setdefault(print_name.lower(), print_name)

    lines = [f"# Missing Swatches\n", f"Total prints with no image anywhere (no product match, no swatch): {len(missing_swatches)} occurrences, {len(unique_prints)} unique prints\n"]
    lines.append("Regenerate via `python3 scripts/resolve_sale_data.py` after adding new swatch images to `public/swatches/` or updating `src/data/printImages.ts`.\n")

    lines.append(f"## Master list ({len(unique_prints)} unique prints — pull swatches for these)\n")
    for p in sorted(unique_prints.values(), key=str.lower):
        lines.append(f"- {p}")
    lines.append("")

    lines.append("## By category / day (for context — same prints as above, grouped by where they're needed)\n")
    by_category = {}
    for day, category, print_name in missing_swatches:
        by_category.setdefault((day, category), []).append(print_name)
    for (day, category), prints in sorted(by_category.items()):
        lines.append(f"### {category} ({day.title()})")
        for p in prints:
            lines.append(f"- {p}")
        lines.append("")
    (ROOT / "MISSING_SWATCHES.md").write_text("\n".join(lines))

    # carryover_defaulted.md
    lines = [f"# Carryover-Defaulted Prints (Friday)\n",
             f"{len(carryover_defaulted)} predictions products carry a print never mentioned anywhere in the PDF — defaulted to Friday as ordinary carryover stock. Informational only.\n"]
    seen = set()
    for print_name, product_type in sorted(set(carryover_defaulted)):
        lines.append(f"- {print_name} ({product_type})")
    (SCRIPTS_DIR / "carryover_defaulted.md").write_text("\n".join(lines))

    # day_conflicts_defaulted.md
    lines = [f"# Dual-Day Conflicts Defaulted to Friday\n",
             f"{len(conflict_defaulted)} predictions products carry a print that appears under BOTH Friday and Sunday in the PDF (for different categories) — defaulted to Friday per your decision. Review if any should be Sunday instead.\n"]
    for print_name, product_type, days in sorted(set((p, t, tuple(d)) for p, t, d in conflict_defaulted)):
        lines.append(f"- {print_name} ({product_type}) — PDF has this under: {', '.join(days)}")
    (SCRIPTS_DIR / "day_conflicts_defaulted.md").write_text("\n".join(lines))

    print(f"Sale entries: {len(sale_entries)}")
    print(f"Predictions products processed: {sum(1 for p in predictions['products'] if p.get('variants'))}")
    print(f"Photos copied to public/product-photos: {copied_photos}")
    print(f"PDF-only prints matched to a swatch: {pdf_only_swatch_count}")
    print(f"PDF-only prints with NO image (see MISSING_SWATCHES.md): {len(missing_swatches)}")
    print(f"Carryover-defaulted prints (see scripts/carryover_defaulted.md): {len(set(carryover_defaulted))}")
    print(f"Dual-day-conflict-defaulted prints (see scripts/day_conflicts_defaulted.md): {len(set((p,t) for p,t,d in conflict_defaulted))}")


if __name__ == "__main__":
    main()
