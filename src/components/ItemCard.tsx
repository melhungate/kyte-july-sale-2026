import React from 'react';
import type { SaleEntry, EnrichedPrint } from '../data/saleData';
import { getKyteUrl, getKytePrintUrl } from '../utils/kyteUrls';
import { resolveSwatchOnly } from '../utils/resolveImage';
import { sortSizes } from '../utils/priceUtils';
import { filterPrintsBySearch } from '../utils/searchFilter';
import './ItemCard.css';

type SaleDay = 'all' | 'friday' | 'sunday';

interface ItemCardProps {
  item: SaleEntry;
  filterDay: SaleDay;
  searchTerm?: string;
  onPrintClick?: (print: EnrichedPrint) => void;
  onWishlistClick?: (print: EnrichedPrint, day: 'friday' | 'sunday') => void;
}

function summarizePrints(prints: EnrichedPrint[]): { priceLabel: string; sizesLabel: string; hasNoSalePrice: boolean } | null {
  if (prints.length === 0) return null;

  const withPrice = prints.filter(p => p.price);
  let priceLabel = '';
  if (withPrice.length > 0) {
    const min = Math.min(...withPrice.map(p => p.price!.min));
    const max = Math.max(...withPrice.map(p => p.price!.max));
    const hasUncertain = withPrice.some(p => p.priceSource === 'pdf-starting-only');
    priceLabel = min === max ? `$${min.toFixed(0)}` : `$${min.toFixed(0)}–$${max.toFixed(0)}`;
    if (hasUncertain) priceLabel += '+';
  }

  const allSizes = new Set<string>();
  prints.forEach(p => p.productMatch?.variants.forEach(v => allSizes.add(v.size)));
  const sizesLabel = allSizes.size > 0 ? sortSizes(Array.from(allSizes)).join(', ') : '';

  const hasNoSalePrice = prints.some(p => p.noSalePriceFound);

  return { priceLabel, sizesLabel, hasNoSalePrice };
}

const PrintButton: React.FC<{
  print: EnrichedPrint;
  itemName: string;
  dayLabel?: string;
  onClick?: () => void;
  onWishlistClick?: () => void;
}> = ({ print, itemName, dayLabel, onClick, onWishlistClick }) => {
  const imageUrl = resolveSwatchOnly(print);

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
          </div>
        ) : (
          <span className="print-name-only">{print.name}</span>
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
        title="Add to wishlist — pick a size there"
        aria-label={`Add ${print.name} to wishlist`}
      >
        ♡
      </button>
    </div>
  );
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, filterDay, searchTerm, onPrintClick, onWishlistClick }) => {
  const filteredFridayPrints = filterPrintsBySearch(item.fridayPrints, item.name, searchTerm);
  const filteredSundayPrints = filterPrintsBySearch(item.sundayPrints, item.name, searchTerm);

  const summaryPrints = filterDay === 'friday' ? filteredFridayPrints
    : filterDay === 'sunday' ? filteredSundayPrints
    : [...filteredFridayPrints, ...filteredSundayPrints];
  const summary = summarizePrints(summaryPrints);

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
      </div>

      {summary && (summary.priceLabel || summary.sizesLabel) && (
        <div className="item-meta">
          {summary.priceLabel && (
            <span
              className="price"
              title={summary.priceLabel.endsWith('+') ? 'Some prints show a starting price only — larger sizes may cost more' : undefined}
            >
              {summary.priceLabel}
            </span>
          )}
          {summary.sizesLabel && <span className="sizes">Sizes: {summary.sizesLabel}</span>}
          {summary.hasNoSalePrice && (
            <span className="no-sale-price-flag" title="Regular price shown — no comparable sale price found">
              ⓘ
            </span>
          )}
        </div>
      )}

      {renderPrintsSection()}
    </div>
  );
};
