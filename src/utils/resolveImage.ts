import { getPrintImageUrl } from '../data/printImages';
import type { EnrichedPrint } from '../data/saleData';

// public/ assets (product photos, local swatches) are generated as base-relative
// paths (e.g. "product-photos/x.jpg", "swatches/hufflepuff.jpg") since this app
// is served under a /kyte-july-sale-2026/ subpath — prepend BASE_URL for those,
// but pass remote CDN URLs (printDatabase) through untouched.
function withBase(path: string): string {
  return path.startsWith('http') ? path : `${import.meta.env.BASE_URL}${path}`;
}

// Centralizes the fallback order so PhotoGridView / WishlistSidebar /
// PrintGallery don't each reimplement it: real product photo -> swatch ->
// undefined (caller renders a text-only placeholder).
export function resolveImage(print: EnrichedPrint): string | undefined {
  if (print.source === 'predictions-product' && print.imageUrl) {
    return withBase(print.imageUrl);
  }
  if (print.source === 'pdf-only-swatch') {
    // Resolved at pipeline time (remote printDatabase URL or a local
    // public/swatches/ file); getPrintImageUrl is a defensive fallback only.
    return print.imageUrl ? withBase(print.imageUrl) : getPrintImageUrl(print.name);
  }
  return undefined;
}

// The grouped view's small per-print tiles show a plain color swatch when one
// exists (resolved at pipeline time into `swatchImageUrl`). When no swatch
// exists, fall back to this specific product's own real photo via
// resolveImage — NOT a generic print-name lookup, which could pick a
// different product's photo that happens to share the same print name.
export function resolveSwatchOnly(print: EnrichedPrint): string | undefined {
  if (print.swatchImageUrl) {
    return withBase(print.swatchImageUrl);
  }
  return resolveImage(print);
}
