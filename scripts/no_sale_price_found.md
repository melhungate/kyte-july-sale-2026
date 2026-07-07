# No Sale Price Found

5 product types (8 print entries) have NO sale-price evidence anywhere — not from the predictions scrape (no compare_at_price/discount detected) and not from the PDF look book. The price currently shown for these is just Kyte's regular retail price.

To fix one, add its Kyte `product_type` (the heading below) and a flat historical sale price to `manual_price_overrides` in `scripts/aliases.json`, then rerun the pipeline. The UI also shows a small "no sale price found" indicator on these until then.

### Burp Cloth
- Jurassic

### Cozy Playsuits 1.0 TOG
- Ski

### Drawstring Short
- Ecru Roar
- Hot Wheels™ Fast and Fierce
- Vintage Truck

### Men's Long Sleeve Pajama Set
- Ski

### Take Me Home Set with Bow
- Disco Cowgirl
- Small Love Bow
