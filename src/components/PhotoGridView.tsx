import React from 'react';
import type { SaleEntry, EnrichedPrint } from '../data/saleData';
import { resolveImage } from '../utils/resolveImage';
import { getKytePrintUrl } from '../utils/kyteUrls';
import { filterPrintsBySearch } from '../utils/searchFilter';
import { useIncrementalRender } from '../hooks/useIncrementalRender';
import { sortSizes } from '../utils/priceUtils';
import './PhotoGridView.css';

const PAGE_SIZE = 200;

type SaleDay = 'all' | 'friday' | 'sunday';

interface PhotoGridViewProps {
  items: SaleEntry[];
  filterDay: SaleDay;
  searchTerm?: string;
  onWishlistClick?: (itemName: string, itemId: string, print: EnrichedPrint, day: 'friday' | 'sunday') => void;
}

interface FlatCard {
  key: string;
  itemId: string;
  itemName: string;
  print: EnrichedPrint;
}

function formatPrice(print: EnrichedPrint): string {
  if (!print.price) return '';
  const { min, max } = print.price;
  const suffix = print.priceSource === 'pdf-starting-only' || print.priceSource === 'inferred-from-siblings' ? '+' : '';
  return min === max ? `$${min.toFixed(0)}${suffix}` : `$${min.toFixed(0)}–$${max.toFixed(0)}${suffix}`;
}

function priceTitle(print: EnrichedPrint): string | undefined {
  if (print.priceSource === 'pdf-starting-only') return 'Starting price only — larger sizes may cost more';
  if (print.priceSource === 'inferred-from-siblings') return "Price based on this product's other prints — not confirmed for this specific print";
  return undefined;
}

export const PhotoGridView: React.FC<PhotoGridViewProps> = ({ items, filterDay, searchTerm, onWishlistClick }) => {
  const cards: FlatCard[] = [];
  items.forEach(item => {
    const dayPrints = filterDay === 'friday' ? item.fridayPrints
      : filterDay === 'sunday' ? item.sundayPrints
      : [...item.fridayPrints, ...item.sundayPrints];
    const prints = filterPrintsBySearch(dayPrints, item.name, searchTerm);
    prints.forEach((print, idx) => {
      cards.push({ key: `${item.id}-${print.day}-${idx}`, itemId: item.id, itemName: item.name, print });
    });
  });

  const { visibleCount, sentinelRef } = useIncrementalRender(cards.length, PAGE_SIZE);

  if (cards.length === 0) {
    return (
      <div className="no-results">
        <p>No items found matching your search.</p>
      </div>
    );
  }

  const visibleCards = cards.slice(0, visibleCount);

  return (
    <div className="photo-grid">
      {visibleCards.map(({ key, itemId, itemName, print }) => {
        const imageUrl = resolveImage(print);
        const sizesHistorical = !print.productMatch && !!print.historicalSizes?.length;
        const sizesInferred = !print.productMatch && !sizesHistorical && !!print.inferredSizes?.length;
        const sizeChip = print.productMatch
          ? sortSizes(Array.from(new Set(print.productMatch.variants.map(v => v.size)))).join(', ')
          : sizesHistorical
            ? sortSizes(print.historicalSizes!).join(', ')
            : sizesInferred
              ? sortSizes(print.inferredSizes!).join(', ')
              : undefined;
        return (
          <div className="photo-card" key={key}>
            <span className={`photo-card-day-badge ${print.day}`}>{print.day === 'friday' ? 'Friday' : 'Sunday'}</span>
            <button
              className="photo-card-wishlist-btn"
              onClick={() => onWishlistClick?.(itemName, itemId, print, print.day)}
              title="Add to wishlist — pick a size there"
              aria-label={`Add ${print.name} to wishlist`}
            >
              ♡
            </button>
            <a
              href={getKytePrintUrl(print.name, itemName)}
              target="_blank"
              rel="noopener noreferrer"
              className="photo-card-image-link"
            >
              {imageUrl ? (
                <img src={imageUrl} alt={print.name} className="photo-card-image" loading="lazy" />
              ) : (
                <div className="photo-card-image photo-card-no-image">{print.name}</div>
              )}
            </a>
            <div className="photo-card-body">
              <div className="photo-card-item-name">{itemName}</div>
              <div className="photo-card-print-name">{print.name}</div>
              <div className="photo-card-meta">
                {print.price && (
                  <span
                    className="photo-card-price"
                    title={priceTitle(print)}
                  >
                    {formatPrice(print)}
                  </span>
                )}
                {print.noSalePriceFound && (
                  <span className="no-sale-price-flag" title="Regular price shown — no comparable sale price found">
                    ⓘ
                  </span>
                )}
                {sizeChip && (
                  <span
                    className="photo-card-sizes"
                    title={
                      sizesHistorical
                        ? `From a ${print.historicalSnapshotDate} snapshot before this print was removed — current availability unconfirmed`
                        : sizesInferred
                          ? "Based on this product's other prints — exact stock for this print unknown"
                          : 'Sizes currently in stock'
                    }
                  >
                    {sizeChip}{sizesHistorical || sizesInferred ? ' ⓘ' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {visibleCount < cards.length && <div ref={sentinelRef} className="photo-grid-sentinel" />}
    </div>
  );
};
