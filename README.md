# Kyte July 2026 Anniversary Sale Browser

A visual browser for Kyte Baby's Anniversary Sale, split by release day (Friday / Sunday), with a per-day wishlist.

Forked from [kyte_coding](https://github.com/melhungate/kyte_coding) (the January 2026 clearance sale browser). Product photos, sizes, and stock signal are sourced from a live scrape of Kyte's storefront; Friday/Sunday assignment and pricing are sourced from Kyte's official Anniversary Sale Look Book PDF where it covers an item, falling back to scraped data otherwise. See `data/` and `scripts/` for the data pipeline.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.
