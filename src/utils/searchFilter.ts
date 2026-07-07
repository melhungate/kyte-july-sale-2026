import type { EnrichedPrint } from '../data/saleData';

// Shared between ItemCard (grouped view) and PhotoGridView so a search match
// behaves the same in both: if the item name itself matches, keep all its
// prints; otherwise narrow down to just the prints whose own name matches
// (a print matching doesn't mean every other print in that item should show).
export function filterPrintsBySearch(prints: EnrichedPrint[], itemName: string, searchTerm?: string): EnrichedPrint[] {
  if (!searchTerm) return prints;
  const searchLower = searchTerm.toLowerCase();
  if (itemName.toLowerCase().includes(searchLower)) return prints;
  return prints.filter(print => print.name.toLowerCase().includes(searchLower));
}
