// Generate Kyte Baby search URLs from item names and prints

const BASE_URL = 'https://kytebaby.com/en-ca/search';

// Get search URL for a body style (item name)
export function getKyteUrl(itemName: string): string {
  const query = encodeURIComponent(itemName.toLowerCase());
  return `${BASE_URL}?q=${query}`;
}

// Get search URL for a specific print + body style combination
export function getKytePrintUrl(printName: string, itemName: string): string {
  const query = encodeURIComponent(`${printName.toLowerCase()} ${itemName.toLowerCase()}`);
  return `${BASE_URL}?q=${query}`;
}
