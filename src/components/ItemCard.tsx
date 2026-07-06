import React from 'react';
import type { SaleEntry, EnrichedPrint } from '../data/saleData';
import { getKyteUrl, getKytePrintUrl } from '../utils/kyteUrls';
import { resolveImage, formatPriceRange } from '../utils/resolveImage';
import './ItemCard.css';

type SaleDay = 'all' | 'friday' | 'sunday';

interface ItemCardProps {
  item: SaleEntry;
  filterDay: SaleDay;
  searchTerm?: string;
  onPrintClick?: (print: EnrichedPrint) => void;
  onWishlistClick?: (print: EnrichedPrint, day: 'friday' | 'sunday') => void;
}

const PrintButton: React.FC<{
  print: EnrichedPrint;
  itemName: string;
  dayLabel?: string;
  onClick?: () => void;
  onWishlistClick?: () => void;
}> = ({ print, itemName, dayLabel, onClick, onWishlistClick }) => {
  const imageUrl = resolveImage(print);
  const sizeChip = print.productMatch
    ? Array.from(new Set(print.productMatch.variants.map(v => v.size))).join(', ')
    : undefined;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistClick?.();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="print-tag-wrapper">
      <button
        className="print-tag"
        onClick={onClick}
        title={`Click to view ${print.name}${dayLabel ? ` - ${dayLabel}` : ''}`}
      >
        {imageUrl ? (
          <div className="print-thumbnail-wrapper">
            <img
              src={imageUrl}
              alt={print.name}
              className="print-thumbnail"
              loading="lazy"
            />
            <span className="print-name">{print.name}</span>
            {print.price && (
              <span
                className="print-price-chip"
                title={print.priceSource === 'pdf-starting-only' ? 'Starting price only — larger sizes may cost more' : undefined}
              >
                {formatPriceRange(print.price, print.priceSource)}
              </span>
            )}
            {sizeChip && <span className="print-size-chip" title="Sizes currently in stock">{sizeChip}</span>}
          </div>
        ) : (
          <span className="print-name-only">
            {print.name}
            {print.price && (
              <span
                className="print-price-chip"
                title={print.priceSource === 'pdf-starting-only' ? 'Starting price only — larger sizes may cost more' : undefined}
              >
                {formatPriceRange(print.price, print.priceSource)}
              </span>
            )}
          </span>
        )}
      </button>
      <a
        href={getKytePrintUrl(print.name, itemName)}
        target="_blank"
        rel="noopener noreferrer"
        className="kyte-link-btn"
        onClick={handleLinkClick}
        title={`Search Kyte for ${print.name} ${itemName}`}
        aria-label={`Search Kyte for ${print.name} ${itemName}`}
      >
        ↗
      </a>
      <button
        className="wishlist-btn"
        onClick={handleWishlistClick}
        title="Add to wishlist"
        aria-label={`Add ${print.name} to wishlist`}
      >
        ♡
      </button>
    </div>
  );
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, filterDay, searchTerm, onPrintClick, onWishlistClick }) => {
  // Filter prints based on search term
  const filterPrints = (prints: EnrichedPrint[]) => {
    if (!searchTerm) return prints;
    const searchLower = searchTerm.toLowerCase();
    // Only filter prints if the search term doesn't match the item name
    if (item.name.toLowerCase().includes(searchLower)) return prints;
    return prints.filter(print => print.name.toLowerCase().includes(searchLower));
  };

  const filteredFridayPrints = filterPrints(item.fridayPrints);
  const filteredSundayPrints = filterPrints(item.sundayPrints);

  const renderPrintsSection = () => {
    if (filterDay === 'friday') {
      return (
        <div className="prints-section">
          <h4>Friday Prints ({filteredFridayPrints.length}):</h4>
          <div className="prints-grid">
            {filteredFridayPrints.map((print, index) => (
              <PrintButton
                key={`fri-${index}`}
                print={print}
                itemName={item.name}
                onClick={() => onPrintClick?.(print)}
                onWishlistClick={() => onWishlistClick?.(print, 'friday')}
              />
            ))}
          </div>
        </div>
      );
    }

    if (filterDay === 'sunday') {
      return (
        <div className="prints-section">
          <h4>Sunday Prints ({filteredSundayPrints.length}):</h4>
          <div className="prints-grid">
            {filteredSundayPrints.map((print, index) => (
              <PrintButton
                key={`sun-${index}`}
                print={print}
                itemName={item.name}
                onClick={() => onPrintClick?.(print)}
                onWishlistClick={() => onWishlistClick?.(print, 'sunday')}
              />
            ))}
          </div>
        </div>
      );
    }

    // Show all prints organized by day
    return (
      <>
        {filteredFridayPrints.length > 0 && (
          <div className="prints-section friday-section">
            <h4 className="day-header friday-header">Friday ({filteredFridayPrints.length})</h4>
            <div className="prints-grid">
              {filteredFridayPrints.map((print, index) => (
                <PrintButton
                  key={`fri-${index}`}
                  print={print}
                  itemName={item.name}
                  dayLabel="Friday"
                  onClick={() => onPrintClick?.(print)}
                  onWishlistClick={() => onWishlistClick?.(print, 'friday')}
                />
              ))}
            </div>
          </div>
        )}
        {filteredSundayPrints.length > 0 && (
          <div className="prints-section sunday-section">
            <h4 className="day-header sunday-header">Sunday ({filteredSundayPrints.length})</h4>
            <div className="prints-grid">
              {filteredSundayPrints.map((print, index) => (
                <PrintButton
                  key={`sun-${index}`}
                  print={print}
                  itemName={item.name}
                  dayLabel="Sunday"
                  onClick={() => onPrintClick?.(print)}
                  onWishlistClick={() => onWishlistClick?.(print, 'sunday')}
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="item-card">
      <div className="item-header">
        <h3>
          <a href={getKyteUrl(item.name)} target="_blank" rel="noopener noreferrer" className="item-link">
            {item.name}
          </a>
        </h3>
        <span className="category-badge">{item.section}</span>
      </div>

      {renderPrintsSection()}
    </div>
  );
};
