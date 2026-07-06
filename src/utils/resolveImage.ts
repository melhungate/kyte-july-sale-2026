import { getPrintImageUrl } from '../data/printImages';
import type { EnrichedPrint, PriceRange, PriceSource } from '../data/saleData';

// public/ assets (product photos, local swatches) are generated as base-relative
// paths (e.g. "product-photos/x.jpg", "swatches/hufflepuff.jpg") since this app
// is served under a /kyte-july-sale-2026/ subpath — prepend BASE_URL for those,
// but pass remote CDN URLs (printDatabase) through untouched.
function withBase(path: string): string {
  return path.startsWith('http') ? path : `${import.meta.env.BASE_URL}${path}`;
}

// Centralizes the fallback order so ItemCard / WishlistSidebar / PrintGallery
// don't each reimplement it: real product photo -> swatch -> undefined (caller
// renders a text-only placeholder).
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

// "pdf-starting-only" means larger sizes' pricing couldn't be confirmed
// against a live product, so a flat price is shown with a "+" to signal it may
// not hold for every size (e.g. "$25+"). "pdf-confirmed"/"predictions" have a
// real (possibly ranged) price we trust across sizes, e.g. "$25–$28".
export function formatPriceRange(price: PriceRange | null, priceSource?: PriceSource): string {
  if (!price) return '';
  if (price.min === price.max) {
    const suffix = priceSource === 'pdf-starting-only' ? '+' : '';
    return `$${price.min.toFixed(0)}${suffix}`;
  }
  return `$${price.min.toFixed(0)}–$${price.max.toFixed(0)}`;
}
