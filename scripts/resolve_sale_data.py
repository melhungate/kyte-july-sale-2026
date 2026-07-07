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


TITLE_PREFIX_ALIASES = {
    # Same product line, phrased differently at different points in Kyte's catalog.
    "Long-Sleeved Women's Pajama Set": "Women's Long Sleeve Pajama Set",
}


# Kyte's own catalog drops the brand name from these licensed-collab prints
# (option1 is just "Hufflepuff™"/"Fast and Fierce"), but shoppers searching
# for the collab naturally type the brand — restore it for display (keyed by
# the already-normalized, brand-stripped print name so casing/™ don't matter).
BRAND_DISPLAY_NAMES = {
    "hufflepuff": "Harry Potter™ Hufflepuff",
    "gryffindor": "Harry Potter™ Gryffindor",
    "ravenclaw": "Harry Potter™ Ravenclaw",
    "slytherin": "Harry Potter™ Slytherin",
    "icon": "Harry Potter™ Icon",
    "journey": "Harry Potter™ Journey",
    "midnight icon": "Harry Potter™ Midnight Icon",
    "fast and fierce": "Hot Wheels™ Fast and Fierce",
    "sparkles and speed": "Hot Wheels™ Sparkles and Speed",
}


def derive_title_prefix(title):
    """Predictions product titles are "{Product Line} in {Print}[ {tog}]" —
    the part before " in " is the actual distinct product (e.g. "3-Pack Bows",
    "Knotted Bow Headband"), which is finer-grained than Kyte's own
    product_type bucket (e.g. "Baby Bows" lumps 4 different physical products
    together)."""
    idx = title.find(" in ")
    prefix = title[:idx].strip() if idx != -1 else title.strip()
    prefix = normalize_apostrophes(prefix)
    return TITLE_PREFIX_ALIASES.get(prefix, prefix)


GENERIC_PRODUCT_TYPES = {
    # Shopify catch-all types that don't describe the physical product at all
    # (e.g. "Accessory" for "Adult Bows in Mulberry") — always prefer the
    # title prefix for these even when only one product uses the type, unlike
    # the >1-prefix bundling case below.
    "accessory",
    # Blank product_type in Kyte's own catalog (e.g. "Drawstring Short in
    # Vintage Truck" has product_type: "") — same treatment, defer to title.
    "",
}


def find_product_types_needing_split(products):
    """A product_type "needs splitting" when it bundles more than one distinct
    title prefix — i.e. Kyte's product_type is too coarse to be a useful
    category on its own — or when it's a known generic catch-all type."""
    prefixes_by_type = {}
    for p in products:
        if not p.get("variants"):
            continue
        prefixes_by_type.setdefault(p["product_type"], set()).add(derive_title_prefix(p["title"]))
    return {
        pt for pt, prefixes in prefixes_by_type.items()
        if len(prefixes) > 1 or pt.strip().lower() in GENERIC_PRODUCT_TYPES
    }


TOG_SUFFIX_RE = re.compile(r"(\d+\.\d+)$")


def find_bare_type_tog_suffixes(products):
    """Some product_types have no TOG level in their own name (e.g. "Adult
    Blanket") even though a sibling type explicitly does ("Adult Blanket
    1.0") — the bare one is a *different*, undocumented TOG level, not a
    duplicate. When every title in a bare type ends in the same TOG number,
    return {product_type: tog} so its display name can be disambiguated."""
    suffixes_by_type = {}
    for p in products:
        if not p.get("variants") or re.search(r"\d", p["product_type"]):
            continue  # already has a digit in its own name, e.g. "Sleep Bag 1.0 Tog"
        m = TOG_SUFFIX_RE.search(p["title"].strip())
        suffixes_by_type.setdefault(p["product_type"], set()).add(m.group(1) if m else None)

    result = {}
    for pt, sufs in suffixes_by_type.items():
        real = sufs - {None}
        if len(real) == 1:
            result[pt] = next(iter(real))
    return result


def find_swapped_option_types(products):
    """A handful of Kyte listings have Color/Size backwards (e.g. "Crib Sheet
    in Crawl" stores option1="Crib Sheet" (a size) and option2="Crawl" (the
    real print)). Detect it per product_type: the real "size vocabulary" is
    whatever option2 value recurs across >=3 sibling products; any product
    whose option1 (not option2) matches that vocabulary has its options
    swapped. Returns {product_type: {size_vocab_values}}."""
    from collections import Counter, defaultdict
    option2_counts_by_type = defaultdict(Counter)
    for p in products:
        for v in p.get("variants", []):
            if v.get("option2"):
                option2_counts_by_type[p["product_type"]][v["option2"]] += 1

    result = {}
    for pt, counts in option2_counts_by_type.items():
        vocab = {val for val, cnt in counts.items() if cnt >= 3}
        if vocab:
            result[pt] = vocab
    return result


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


def kyte_print_page_url(name):
    """Best-guess link to Kyte's dedicated print page, e.g. "Palm Tree" ->
    https://kytebaby.com/en-ca/pages/palm-tree. Multi-color combo names
    (bow packs, trim combos) likely won't resolve to a real page, but this
    gives a starting point for manual swatch-sourcing either way."""
    slug = re.sub(r"[^\w]+", "-", name.strip().lower()).strip("-")
    return f"https://kytebaby.com/en-ca/pages/{slug}"


def find_local_swatch(print_name, normalized_print, local_swatch_files):
    """Local public/swatches/ file only — no remote printDatabase lookup. Used
    for the grouped view's small-tile swatch on real-photo-backed prints: the
    remote DB was built for an unrelated site and can hold a stale/wrong
    image (e.g. "Nutmeg"), whereas public/swatches/ is curated directly by
    hand. Removing a file here should mean "no swatch, fall back to the real
    product photo" — it shouldn't silently revert to a remote guess."""
    for candidate in (slugify(print_name), slugify(normalized_print)):
        if candidate in local_swatch_files:
            return local_swatch_files[candidate]
    trim_match = re.match(r"^(.+?)\s+with\s+.+\s+trim$", print_name, re.IGNORECASE)
    if trim_match:
        base_slug = slugify(trim_match.group(1).strip())
        if base_slug in local_swatch_files:
            return local_swatch_files[base_slug]
    return None


def find_swatch_url(print_name, normalized_print, swatch_database, swatch_database_lower, local_swatch_files):
    """Remote printDatabase URL first (exact, then case-insensitive), then a
    local public/swatches/ file, trying both the raw print name's slug and
    the normalized (brand-prefix stripped, alias-applied) slug so e.g. "Harry
    Potter™ Hufflepuff" finds a file saved simply as "hufflepuff.jpg". Returns
    None if nothing matches."""
    if print_name in swatch_database:
        return swatch_database[print_name]
    if print_name.lower() in swatch_database_lower:
        return swatch_database_lower[print_name.lower()]
    for candidate in (slugify(print_name), slugify(normalized_print)):
        if candidate in local_swatch_files:
            return local_swatch_files[candidate]
    # "Storm with Cloud Trim" -> fall back to the base colour "Storm" swatch
    # when nothing matches the full trim-combo name.
    trim_match = re.match(r"^(.+?)\s+with\s+.+\s+trim$", print_name, re.IGNORECASE)
    if trim_match:
        base_name = trim_match.group(1).strip()
        if base_name in swatch_database:
            return swatch_database[base_name]
        if base_name.lower() in swatch_database_lower:
            return swatch_database_lower[base_name.lower()]
        base_slug = slugify(base_name)
        if base_slug in local_swatch_files:
            return local_swatch_files[base_slug]
    return None


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
    manual_price_overrides = aliases.get("manual_price_overrides", {})
    pdf_category_aliases = aliases.get("pdf_category_aliases", {})

    pdf_data = json.loads((DATA_DIR / "pdf_sale_data.json").read_text())
    print_day_map = json.loads((DATA_DIR / "print_day_map.json").read_text())
    category_day_price_map = json.loads((DATA_DIR / "category_day_price_map.json").read_text())
    predictions = json.loads((DATA_DIR / "predictions_data.json").read_text())

    swatch_database = load_swatch_database()
    swatch_database_lower = {n.lower(): url for n, url in swatch_database.items()}
    local_swatch_files = load_local_swatch_files()  # slug -> "swatches/xxx.jpg"

    matchers = build_category_matchers(category_aliases)
    product_types_needing_split = find_product_types_needing_split(predictions["products"])
    bare_type_tog_suffixes = find_bare_type_tog_suffixes(predictions["products"])
    swapped_option_vocab = find_swapped_option_types(predictions["products"])

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
    predictions_products_no_swatch = set()  # real-photo-backed prints with no swatch (grouped small-tile view only)
    no_sale_price_found = []  # (category_display, print_name) with zero sale-price evidence anywhere

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

        # A handful of listings (Crib Sheet, Change Pad Cover) have Color/Size
        # backwards in Kyte's own catalog — option1 holds a size-like value
        # ("Crib Sheet", "One Size") and option2 holds the real print.
        is_swapped = (
            product["product_type"] in swapped_option_vocab
            and variants[0].get("option1") in swapped_option_vocab[product["product_type"]]
        )

        def variant_print(v):
            return (v.get("option2") if is_swapped else v.get("option1")) or ""

        def variant_size(v):
            return (v.get("option1") if is_swapped else v.get("option2")) or "One Size"

        print_name_raw = variant_print(variants[0])
        if not print_name_raw:
            continue
        normalized_print = normalize_print(print_name_raw, print_aliases)
        if normalized_print in BRAND_DISPLAY_NAMES:
            print_name_raw = BRAND_DISPLAY_NAMES[normalized_print]

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

        # price_confidence == "no_baseline_match" means the predictions
        # scraper found no compare_at_price/discount at all for this product
        # (see kyte_july_sale_predictions's own scoring) — i.e. `price` above
        # is just Kyte's regular retail price, not a sale price. If the PDF
        # didn't override it either, check for a manually-entered historical
        # sale price (aliases.json:manual_price_overrides) before giving up
        # and flagging it for the UI.
        is_no_sale_price = False
        if price_source == "predictions" and product.get("price_confidence") == "no_baseline_match":
            # Blank/generic raw product_types (see GENERIC_PRODUCT_TYPES) are
            # displayed under their derived title-prefix category (e.g. the
            # blank-type "Drawstring Short in Vintage Truck" shows as
            # "Drawstring Short") — key the override lookup the same way so a
            # single override covers the whole category the user actually sees.
            override_key = product["product_type"]
            if override_key.strip().lower() in GENERIC_PRODUCT_TYPES:
                override_key = derive_title_prefix(product["title"])
            manual_price = manual_price_overrides.get(override_key)
            if manual_price is not None:
                price = {"min": manual_price, "max": manual_price}
                price_source = "manual-override"
                price_override = manual_price
            else:
                is_no_sale_price = True
                no_sale_price_found.append((override_key, print_name_raw))

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
            size = variant_size(v)
            variant_price = price_override if price_override is not None else v.get("price")
            variant_sizes.append({"size": size, "sku": v.get("sku"), "price": variant_price})

        # Precomputed once here (rather than at runtime in the app) so the
        # grouped view's small tiles — which show a plain swatch even for
        # prints that have a real product photo — don't need their own
        # print-name -> local-file lookup logic in the frontend.
        swatch_url = find_local_swatch(print_name_raw, normalized_print, local_swatch_files)
        if swatch_url is None:
            predictions_products_no_swatch.add(print_name_raw)

        enriched_print = {
            "name": print_name_raw,
            "day": day,
            "daySource": day_source,
            "source": "predictions-product",
            "imageUrl": photo_path,
            "swatchImageUrl": swatch_url,
            "price": price,
            "priceSource": price_source,
            "noSalePriceFound": is_no_sale_price,
            "productMatch": {
                "productId": product["id"],
                "productTitle": product["title"],
                "productUrl": product["url"],
                "localImage": photo_path,
                "variants": variant_sizes,
                # predictions data tags each product "Carryover" (seen in a
                # prior sale) or "Confirmed: <print>" (newly confirmed for
                # this sale) — mirrors the predictions site's own "first time
                # on clearance" toggle (source.py:kyte_july_sale_predictions).
                "isFirstTimeOnClearance": product.get("source") != "Carryover",
            },
        }

        if matched_category is not None:
            category_display = category_display_names.get(matched_category, matched_category)
            category_norm = matched_category
        elif product["product_type"] in product_types_needing_split:
            category_display = derive_title_prefix(product["title"])
            category_norm = normalize_category(category_display)
        elif product["product_type"] in bare_type_tog_suffixes:
            category_display = f"{product['product_type']} {bare_type_tog_suffixes[product['product_type']]}"
            category_norm = normalize_category(category_display)
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
        # Canonicalize so a variant-phrased category header (see
        # pdf_category_aliases) resolves to the exact same category identity
        # a real predictions product already uses — otherwise this loop can't
        # tell the print is already covered and creates a redundant, orphaned
        # duplicate category for it.
        category_norm = pdf_category_aliases.get(normalize_category(pdf_entry["category"]), normalize_category(pdf_entry["category"]))
        category_display = category_display_names.get(category_norm, pdf_entry["category"])
        price = pdf_entry["starting_price"]
        for print_name in pdf_entry["prints"]:
            normalized_print = normalize_print(print_name, print_aliases)
            if (category_norm, normalized_print) in covered_category_print_pairs:
                continue  # already represented by a real predictions product

            image_url = find_swatch_url(print_name, normalized_print, swatch_database, swatch_database_lower, local_swatch_files)
            source = "pdf-only-swatch" if image_url is not None else "pdf-only-missing"

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
                "swatchImageUrl": image_url,
                "price": {"min": price, "max": price} if price is not None else None,
                # No live product to compare against, so we can't confirm the
                # PDF's "starting at" price holds for larger sizes either.
                "priceSource": "pdf-starting-only",
                "noSalePriceFound": False,
                "productMatch": None,
            }
            entry = get_entry(day, category_display, category_norm)
            entry["prints"].append(enriched_print)

    # PDF-only prints (no live Kyte product, so no real variant data) — infer
    # an exhaustive size list from sibling prints of the SAME product that DO
    # have real data. A single print's own live listing only shows whatever
    # sizes happened to still be in stock when scraped, so unioning sizes
    # across every print in the category gives the fullest picture of what
    # sizes this product normally comes in. Left unset (falls back to "One
    # Size" in the UI) when the category has no real size data at all.
    for entry in entries.values():
        real_sizes = []
        seen_sizes = set()
        for p in entry["prints"]:
            if p.get("productMatch"):
                for v in p["productMatch"]["variants"]:
                    # Kyte's own size labels are inconsistently cased across
                    # different prints of the same product (e.g. "12-18
                    # months" vs "12-18 Months") — dedupe case-insensitively
                    # so the union doesn't show near-duplicate entries.
                    size_key = v["size"].lower()
                    if size_key not in seen_sizes:
                        seen_sizes.add(size_key)
                        real_sizes.append(v["size"])
        if real_sizes:
            for p in entry["prints"]:
                if not p.get("productMatch"):
                    p["inferredSizes"] = real_sizes

    sale_entries = list(entries.values())
    (DATA_DIR / "resolved_sale_data.json").write_text(json.dumps(sale_entries, indent=2))

    # MISSING_SWATCHES.md
    unique_prints = {}  # lowercase -> first-seen display casing
    for _, _, print_name in missing_swatches:
        unique_prints.setdefault(print_name.lower(), print_name)

    lines = [f"# Missing Swatches\n", f"Total prints with no image anywhere (no product match, no swatch): {len(missing_swatches)} occurrences, {len(unique_prints)} unique prints\n"]
    lines.append("Regenerate via `python3 scripts/resolve_sale_data.py` after adding new swatch images to `public/swatches/` or updating `src/data/printImages.ts`.\n")

    lines.append(f"## Master list ({len(unique_prints)} unique prints — pull swatches for these)\n")
    lines.append("Links are a best guess at Kyte's print page (e.g. \"Palm Tree\" -> kytebaby.com/en-ca/pages/palm-tree) — multi-color combo names likely won't resolve, but it's a starting point.\n")
    for p in sorted(unique_prints.values(), key=str.lower):
        lines.append(f"- [{p}]({kyte_print_page_url(p)})")
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

    lines.append(f"## Real-photo prints with no swatch ({len(predictions_products_no_swatch)} unique prints)\n")
    lines.append("These already show a real product photo everywhere in the app (item cards, wishlist, photo-grid view) — a swatch is only needed for the grouped view's small per-print tiles, which show swatches instead of full photos. Lower priority than the master list above. Links are the same best-guess Kyte print-page format.\n")
    for p in sorted(predictions_products_no_swatch, key=str.lower):
        lines.append(f"- [{p}]({kyte_print_page_url(p)})")
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

    # no_sale_price_found.md
    by_type = {}
    for product_type, print_name in no_sale_price_found:
        by_type.setdefault(product_type, set()).add(print_name)
    lines = [
        "# No Sale Price Found\n",
        f"{len(by_type)} product types ({len(no_sale_price_found)} print entries) have NO sale-price evidence anywhere — not from the predictions scrape (no compare_at_price/discount detected) and not from the PDF look book. The price currently shown for these is just Kyte's regular retail price.\n",
        "To fix one, add its Kyte `product_type` (the heading below) and a flat historical sale price to `manual_price_overrides` in `scripts/aliases.json`, then rerun the pipeline. The UI also shows a small \"no sale price found\" indicator on these until then.\n",
    ]
    for product_type, prints in sorted(by_type.items()):
        lines.append(f"### {product_type}")
        for p in sorted(prints, key=str.lower):
            lines.append(f"- {p}")
        lines.append("")
    (SCRIPTS_DIR / "no_sale_price_found.md").write_text("\n".join(lines))

    print(f"Sale entries: {len(sale_entries)}")
    print(f"Predictions products processed: {sum(1 for p in predictions['products'] if p.get('variants'))}")
    print(f"Photos copied to public/product-photos: {copied_photos}")
    print(f"PDF-only prints matched to a swatch: {pdf_only_swatch_count}")
    print(f"PDF-only prints with NO image (see MISSING_SWATCHES.md): {len(missing_swatches)}")
    print(f"Carryover-defaulted prints (see scripts/carryover_defaulted.md): {len(set(carryover_defaulted))}")
    print(f"Dual-day-conflict-defaulted prints (see scripts/day_conflicts_defaulted.md): {len(set((p,t) for p,t,d in conflict_defaulted))}")
    print(f"Real-photo prints with no swatch (grouped small-tile view only, see MISSING_SWATCHES.md): {len(predictions_products_no_swatch)}")
    print(f"Product types with NO sale price found anywhere (see scripts/no_sale_price_found.md): {len(set(pt for pt, _ in no_sale_price_found))}")


if __name__ == "__main__":
    main()
