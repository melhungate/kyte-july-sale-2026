import React, { useEffect, useState } from 'react';
import type { SaleEntry, EnrichedPrint } from '../data/saleData';
import { ItemCard } from './ItemCard';
import './GroupedMasonryView.css';

type SaleDay = 'all' | 'friday' | 'sunday';

interface GroupedMasonryViewProps {
  items: SaleEntry[];
  filterDay: SaleDay;
  searchTerm: string;
  onPrintClick: (item: SaleEntry, print: EnrichedPrint) => void;
  onWishlistClick: (item: SaleEntry, print: EnrichedPrint, day: 'friday' | 'sunday') => void;
  sentinelRef?: (node: HTMLDivElement | null) => void;
  showSentinel: boolean;
}

const MIN_COLUMN_WIDTH = 280;
const GAP = 20;

function computeColumnCount(): number {
  if (typeof window === 'undefined') return 4;
  return Math.max(1, Math.floor((window.innerWidth - GAP * 2) / (MIN_COLUMN_WIDTH + GAP)));
}

function useColumnCount() {
  const [count, setCount] = useState(computeColumnCount);
  useEffect(() => {
    const onResize = () => setCount(computeColumnCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return count;
}

// CSS's `columns` (multi-column) property gets dramatically slower to lay
// out as more items are appended — its column-balancing algorithm
// effectively recomputes the whole container on every change, which made
// scrolling through the grouped view (which loads more categories as you
// scroll) grind to a multi-second freeze. Instead, greedily assign each
// category to whichever column currently has the least estimated content
// weight (print count is a good-enough proxy for a card's rendered height)
// and render each column as a plain vertical flex stack — appending to one
// is cheap regardless of how much content already exists elsewhere.
export const GroupedMasonryView: React.FC<GroupedMasonryViewProps> = ({
  items, filterDay, searchTerm, onPrintClick, onWishlistClick, sentinelRef, showSentinel,
}) => {
  const columnCount = useColumnCount();

  if (items.length === 0) {
    return (
      <div className="no-results">
        <p>No items found matching your search.</p>
      </div>
    );
  }

  const columns: SaleEntry[][] = Array.from({ length: columnCount }, () => []);
  const columnWeights = new Array(columnCount).fill(0);
  items.forEach(item => {
    const weight = 4 + item.fridayPrints.length + item.sundayPrints.length;
    let minIdx = 0;
    for (let i = 1; i < columnCount; i++) {
      if (columnWeights[i] < columnWeights[minIdx]) minIdx = i;
    }
    columns[minIdx].push(item);
    columnWeights[minIdx] += weight;
  });

  return (
    <>
      <div className="masonry-columns">
        {columns.map((colItems, colIdx) => (
          <div className="masonry-column" key={colIdx}>
            {colItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                filterDay={filterDay}
                searchTerm={searchTerm}
                onPrintClick={(print) => onPrintClick(item, print)}
                onWishlistClick={(print, day) => onWishlistClick(item, print, day)}
              />
            ))}
          </div>
        ))}
      </div>
      {showSentinel && <div ref={sentinelRef} className="grouped-view-sentinel" />}
    </>
  );
};
