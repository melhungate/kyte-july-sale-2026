// Parse price strings from clearance data
// Examples: "$45", "S-L $35 | XL $40", "XS-L $35 | XL $40", "NB-18/24M $X"

export interface PriceOption {
  sizes: string[];
  price: number;
  label: string;
}

// All known individual sizes in order (comprehensive list)
const ALL_SIZES_ORDERED = [
  'Preemie',
  'NB',
  '0-3M',
  '0-6M',
  '3-6M',
  '6-12M',
  '6-18M',
  '6-24M',
  '12-18M',
  '12-24M',
  '18-24M',
  '18-36M',
  '1-2T',
  '1-4T',
  '2T',
  '2T-4T',
  '2T-6T',
  '2-6T',
  '3T',
  '4T',
  '5T',
  '6T',
  '7',
  '7T',
  '8',
  '9',
  '10',
  'XS',
  'XS/S',
  'S',
  'S/M',
  'M',
  'M/L',
  'L',
  'L/XL',
  'XL',
  'XL/XXL',
  'XXL',
  '2XL',
  '3XL',
  '4XL',
];

// Define specific size sequences for different product lines
const SIZE_SEQUENCES: { [key: string]: string[] } = {
  // Baby month sizes
  'preemie-to-baby': ['Preemie', 'NB', '0-3M', '3-6M', '6-12M', '12-18M', '18-24M'],
  'nb-to-baby': ['NB', '0-3M', '3-6M', '6-12M', '12-18M', '18-24M'],
  'nb-to-6-12m': ['NB', '0-3M', '3-6M', '6-12M'],

  // NB to toddler
  'nb-to-toddler-4t': ['NB', '0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T'],
  'nb-to-toddler-7': ['NB', '0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5T', '6T', '7'],
  'nb-to-toddler-7t': ['NB', '0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5T', '6T', '7T'],

  // Baby to toddler (starting from 0-3M)
  'baby-to-toddler-4t': ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T'],
  'baby-to-toddler-7': ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5T', '6T', '7'],
  'baby-to-toddler-7t': ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5T', '6T', '7T'],
  '12m-to-7': ['12-18M', '18-24M', '2T', '3T', '4T', '5T', '6T', '7'],
  '12m-to-7t': ['12-18M', '18-24M', '2T', '3T', '4T', '5T', '6T', '7T'],
  '12m-to-10': ['12-18M', '18-24M', '2T', '3T', '4T', '5T', '6T', '7', '8', '9', '10'],
  '18m-to-7t': ['18-24M', '2T', '3T', '4T', '5T', '6T', '7T'],
  '18m-to-10': ['18-24M', '2T', '3T', '4T', '5T', '6T', '7', '8', '9', '10'],

  // Toddler to kids
  'toddler-to-10': ['2T', '3T', '4T', '5T', '6T', '7', '8', '9', '10'],
  'toddler-only': ['2T', '3T', '4T'],

  // Adult sizes
  'adult-combo': ['S/M', 'L/XL'],
  'adult-combo-extended': ['XS/S', 'S/M', 'M/L', 'L/XL', 'XL/XXL'],
  'adult-xs-xxl': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'adult-s-xxl': ['S', 'M', 'L', 'XL', 'XXL'],
  'adult-xs-3xl': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  'adult-standard': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  'adult-s-xl': ['S', 'M', 'L', 'XL'],

  // NB to adult
  'nb-to-adult': ['NB', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],

  // Alternate baby sizes (0-6M line)
  '0-6m-to-7': ['0-6M', '6-12M', '12-24M', '2T', '3T', '4T', '5T', '6T', '7'],
  '0-6m-to-7t': ['0-6M', '6-12M', '12-24M', '2T', '3T', '4T', '5T', '6T', '7T'],
  '0-6m-to-2t-6t': ['0-6M', '6-24M', '2T-6T'],

  // Special combo sizes
  'baby-combo-1-4t': ['0-3M', '3-6M', '6-12M', '1-4T'],
  'baby-combo-2t-4t': ['0-3M', '3-6M', '6-12M', '12-24M', '2T-4T'],
  'baby-combo-2-6t': ['0-3M', '3-6M', '6-12M', '1-2T', '2-6T'],
  '6-18m-to-4t': ['6-18M', '18-36M', '4T'],

  // Adult combo sizes
  'adult-combo-3': ['XS/S', 'M/L', 'XL/XXL'],
};

// Normalize size string (handle slashes, convert to standard format)
function normalizeSize(size: string): string {
  let normalized = size.trim().toUpperCase();

  // Convert slashes to dashes for month sizes: "0/3M" -> "0-3M", "18/24M" -> "18-24M"
  // But keep slashes for combo sizes like "S/M" and "L/XL"
  if (/^\d+\/\d+M$/i.test(normalized)) {
    normalized = normalized.replace('/', '-');
  }

  // Handle toddler sizes with slashes: "1/4T" -> "1-4T", "2/6T" -> "2-6T"
  if (/^\d+\/\d+T$/i.test(normalized)) {
    normalized = normalized.replace('/', '-');
  }

  // Find matching size in our known list (case-insensitive)
  for (const knownSize of ALL_SIZES_ORDERED) {
    if (knownSize.toUpperCase() === normalized) {
      return knownSize;
    }
  }

  return normalized;
}

// Get all sizes between start and end in a sequence
function getSizesInRange(start: string, end: string, sequence: string[]): string[] | null {
  const startIdx = sequence.findIndex(s => s.toUpperCase() === start.toUpperCase());
  const endIdx = sequence.findIndex(s => s.toUpperCase() === end.toUpperCase());

  if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
    return sequence.slice(startIdx, endIdx + 1);
  }
  return null;
}

// Try to expand a size range using our defined sequences
function expandSizeRange(range: string): string[] {
  // Check if it's a single size (no dash, or dash is part of size name)
  const normalizedRange = range.trim();

  // Single sizes that contain dashes
  const singleSizePatterns = [
    /^\d+-\d+M$/i,      // 0-3M, 6-12M, etc.
    /^\d+-\d+T$/i,      // 1-2T, 2-6T, etc.
    /^[SML]\/[SML]?X?L?$/i,  // S/M, L/XL
    /^\d+T-\d+T$/i,     // 2T-4T
  ];

  for (const pattern of singleSizePatterns) {
    if (pattern.test(normalizedRange)) {
      return [normalizeSize(normalizedRange)];
    }
  }

  // Not a range if no dash
  if (!normalizedRange.includes('-')) {
    return [normalizeSize(normalizedRange)];
  }

  // Parse the range - find the separating dash
  // Need to be careful with sizes like "0-3M" in "0-3M - 4T"
  let start: string;
  let end: string;

  // Try to find " - " first (with spaces)
  if (normalizedRange.includes(' - ')) {
    const parts = normalizedRange.split(' - ');
    start = parts[0].trim();
    end = parts[1].trim();
  } else {
    // Find the dash that separates the range
    // Look for dash not preceded by a digit or followed by a digit+M/T pattern
    const matches = normalizedRange.match(/^(.+?)-([^-].*)$/);
    if (matches) {
      start = matches[1].trim();
      end = matches[2].trim();

      // If end starts with a digit and matches a month size pattern, it might be wrong split
      // e.g., "0-3M" split as start="0" end="3M"
      // Check if start+"-"+end is a known single size
      const combined = `${start}-${end}`;
      if (ALL_SIZES_ORDERED.some(s => s.toUpperCase() === combined.toUpperCase())) {
        return [normalizeSize(combined)];
      }
    } else {
      return [normalizeSize(normalizedRange)];
    }
  }

  // Normalize start and end
  start = normalizeSize(start);
  end = normalizeSize(end);

  // Try each sequence to find one that contains both start and end
  for (const sequence of Object.values(SIZE_SEQUENCES)) {
    const result = getSizesInRange(start, end, sequence);
    if (result) {
      return result;
    }
  }

  // If no sequence matched, return the range as-is
  return [normalizedRange];
}

export function parsePriceString(priceStr: string | undefined): PriceOption[] {
  if (!priceStr) {
    return [{ sizes: ['One Size'], price: 0, label: 'Price not listed' }];
  }

  // Simple price like "$45"
  if (/^\$\d+$/.test(priceStr.trim())) {
    const price = parseInt(priceStr.replace('$', ''), 10);
    return [{ sizes: ['All'], price, label: priceStr }];
  }

  // Complex price like "S-L $35 | XL $40" or "0/3M-18/24M $25 | 2T-4T $26"
  const options: PriceOption[] = [];
  const parts = priceStr.split('|').map(p => p.trim());

  for (const part of parts) {
    // Match patterns like "S-L $35" or "0/3M-18/24M $25"
    const match = part.match(/^(.+?)\s*\$(\d+)$/i);
    if (match) {
      const sizeRange = match[1].trim();
      const price = parseInt(match[2], 10);
      const sizes = expandSizeRange(sizeRange);
      options.push({ sizes, price, label: `${sizeRange} - $${price}` });
    }
  }

  return options.length > 0 ? options : [{ sizes: ['All'], price: 0, label: priceStr }];
}

export function getPriceForSize(priceStr: string | undefined, size: string): number {
  const options = parsePriceString(priceStr);
  const normalizedSize = normalizeSize(size);

  for (const option of options) {
    if (option.sizes.includes('All') ||
        option.sizes.some(s => s.toUpperCase() === normalizedSize.toUpperCase())) {
      return option.price;
    }
  }

  // Default to first option if no match
  return options[0]?.price || 0;
}

export function getAvailableSizes(sizesStr: string | undefined): string[] {
  if (!sizesStr) return ['One Size'];

  // Normalize the input
  const normalized = sizesStr.trim();

  // Expand the size range
  return expandSizeRange(normalized);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`;
}

// Real per-size labels pulled from live inventory are messier than the
// hand-written size strings above (e.g. "18-24 months" vs "18-24M", plus
// gendered prefixes like "Men's L"), so this is a separate, more forgiving
// heuristic sort used only for the aggregated size-range display and the
// size filter dropdown — not for price-range parsing.
const SIZE_ORDER_HINTS = [
  'preemie', 'newborn', 'nb',
  '0-3', '0-6', '3-6', '6-12', '6-18', '6-24', '12-18', '12-24', '18-24', '18-36',
  '1-2t', '2t-4t', '4t-6t', '1-4t', '2-6t', '2t', '3t', '4t', '5t', '6t', '7t',
  'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', '2x', '2xl', '3xl', '4xl',
];

function sizeSortRank(size: string): [number, number, string] {
  let s = size.toLowerCase().trim();
  s = s.replace(/^(men's|women's|women’s)\s*/, '');
  s = s.replace(/\(.*?\)/g, '').trim();
  s = s.replace(/\s*months?$/, '');

  for (let i = 0; i < SIZE_ORDER_HINTS.length; i++) {
    const hint = SIZE_ORDER_HINTS[i];
    if (s === hint || s.startsWith(`${hint}/`) || s.startsWith(`${hint} `)) {
      return [0, i, size];
    }
  }
  if (/^\d+$/.test(s)) {
    return [1, parseInt(s, 10), size];
  }
  return [2, 0, size]; // unrecognized labels (e.g. "One Size", "Youth", data anomalies) — alphabetical, last
}

export function sortSizes(sizes: string[]): string[] {
  const unique = Array.from(new Set(sizes));
  return unique.sort((a, b) => {
    const ra = sizeSortRank(a);
    const rb = sizeSortRank(b);
    if (ra[0] !== rb[0]) return ra[0] - rb[0];
    if (ra[1] !== rb[1]) return ra[1] - rb[1];
    return ra[2].localeCompare(rb[2]);
  });
}
