#!/usr/bin/env python3
"""
Extract the embedded `inventoryData` JS object literal out of
kyte_july_sale_predictions/index.html into a standalone JSON file, so later
pipeline steps don't need to re-parse a 5MB HTML file every run.

A naive `content.find('</script>')` truncates early: the JSON payload itself
contains text that looks like a script-closing tag further down, so this scans
forward from the assignment, string/escape-aware, counting brace depth until
it returns to zero.

Usage: python3 scripts/extract_predictions_data.py
Output: data/predictions_data.json (same shape as inventoryData: metadata + products[])
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PREDICTIONS_HTML = Path("/Users/melaniehungate/kyte_july_sale_predictions/index.html")
DATA_DIR = ROOT / "data"

ASSIGNMENT = "const inventoryData = "


def extract_object_literal(text, start_offset):
    """Scan forward from the first '{' after start_offset, tracking string/escape
    state and brace depth, and return the matching closing brace's index (inclusive)."""
    i = text.index("{", start_offset)
    depth = 0
    in_string = False
    escape = False
    for j in range(i, len(text)):
        ch = text[j]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
        else:
            if ch == '"':
                in_string = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return i, j + 1
    raise ValueError("Unbalanced braces — could not find end of inventoryData object literal")


def main():
    DATA_DIR.mkdir(exist_ok=True)
    text = PREDICTIONS_HTML.read_text()
    assign_idx = text.index(ASSIGNMENT)
    start, end = extract_object_literal(text, assign_idx + len(ASSIGNMENT))
    raw = text[start:end]
    data = json.loads(raw)

    (DATA_DIR / "predictions_data.json").write_text(json.dumps(data))

    meta = data.get("metadata", {})
    print(f"Extracted {len(data.get('products', []))} products "
          f"(metadata reports {meta.get('total_products')} products, {meta.get('total_variants')} variants)")
    print(f"fetched_at: {meta.get('fetched_at')}")
    print("Wrote data/predictions_data.json")


if __name__ == "__main__":
    main()
