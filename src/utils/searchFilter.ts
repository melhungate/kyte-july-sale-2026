import type { EnrichedPrint } from '../data/saleData';

// Splitting on whitespace (rather than matching the whole phrase as one
// contiguous substring) lets a multi-word search like "Women's Short" match
// "Women's Biker Short Set" — each word just has to appear somewhere, in any
// order, instead of "short" needing to immediately follow "women's".
export function tokenizeSearch(searchTerm: string): string[] {
  return searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
}

export function textMatchesTokens(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const lower = text.toLowerCase();
  return tokens.every(token => lower.includes(token));
}

// Shared between ItemCard (grouped view) and PhotoGridView so a search match
// behaves the same in both: if the item name itself matches, keep all its
// prints; otherwise narrow down to just the prints whose own name matches
// (a print matching doesn't mean every other print in that item should show).
export function filterPrintsBySearch(prints: EnrichedPrint[], itemName: string, searchTerm?: string): EnrichedPrint[] {
  if (!searchTerm) return prints;
  const tokens = tokenizeSearch(searchTerm);
  if (textMatchesTokens(itemName, tokens)) return prints;
  return prints.filter(print => textMatchesTokens(print.name, tokens));
}
