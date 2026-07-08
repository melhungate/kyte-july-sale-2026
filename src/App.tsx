import { useState, useMemo, useEffect } from 'react'
import './App.css'
import { saleEntries } from './data/saleData'
import type { SaleEntry, EnrichedPrint } from './data/saleData'
import { GroupedMasonryView } from './components/GroupedMasonryView'
import { PhotoGridView } from './components/PhotoGridView'
import { PrintGallery } from './components/PrintGallery'
import { WishlistProvider, useWishlist } from './context/WishlistContext'
import { WishlistSidebar } from './components/WishlistSidebar'
import { AddToWishlistModal } from './components/AddToWishlistModal'
import { MultiSelectDropdown } from './components/MultiSelectDropdown'
import { sortSizes } from './utils/priceUtils'
import { useIncrementalRender } from './hooks/useIncrementalRender'
import { tokenizeSearch, textMatchesTokens } from './utils/searchFilter'

const GROUPED_PAGE_SIZE = 20

type ViewMode = 'photos' | 'grouped'

interface SelectedPrint {
  print: EnrichedPrint;
  itemName: string;
}

interface WishlistModalData {
  itemId: string;
  itemName: string;
  print: EnrichedPrint;
  day: 'friday' | 'sunday';
}

type SaleDay = 'all' | 'friday' | 'sunday';

function AppContent() {
  const [items] = useState<SaleEntry[]>(saleEntries)
  const [viewMode, setViewMode] = useState<ViewMode>('photos')
  const [selectedPrint, setSelectedPrint] = useState<SelectedPrint | undefined>()
  const [filterDay, setFilterDay] = useState<SaleDay>('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtering ~3000 prints on every keystroke made typing feel laggy —
  // debounce the value that actually drives filtering, while the input
  // itself stays instantly responsive.
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(searchInput), 200)
    return () => clearTimeout(id)
  }, [searchInput])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedPrintNames, setSelectedPrintNames] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [firstTimeOnly, setFirstTimeOnly] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [wishlistModal, setWishlistModal] = useState<WishlistModalData | null>(null)
  const { items: wishlistItems } = useWishlist()

  const handleWishlistClick = (itemId: string, itemName: string, print: EnrichedPrint, day: 'friday' | 'sunday') => {
    setWishlistModal({
      itemId,
      itemName,
      print,
      day,
    });
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedPrintNames([]);
    setSelectedSizes([]);
    setFirstTimeOnly(false);
  };

  const typeOptions = useMemo(
    () => Array.from(new Set(items.map(item => item.name))).sort(),
    [items]
  );

  const printOptions = useMemo(() => {
    const names = new Set<string>();
    items.forEach(item => {
      [...item.fridayPrints, ...item.sundayPrints].forEach(p => names.add(p.name));
    });
    return Array.from(names).sort();
  }, [items]);

  const sizeOptions = useMemo(() => {
    const sizes = new Set<string>();
    items.forEach(item => {
      [...item.fridayPrints, ...item.sundayPrints].forEach(p => {
        p.productMatch?.variants.forEach(v => sizes.add(v.size));
      });
    });
    return sortSizes(Array.from(sizes));
  }, [items]);

  const printMatchesFilters = (print: EnrichedPrint): boolean => {
    if (selectedPrintNames.length > 0 && !selectedPrintNames.includes(print.name)) return false;
    if (selectedSizes.length > 0) {
      const hasSelectedSize = print.productMatch?.variants.some(v => selectedSizes.includes(v.size));
      if (!hasSelectedSize) return false;
    }
    if (firstTimeOnly && !print.isFirstTimeOnClearance) return false;
    return true;
  };

  const anyPrintFilterActive = selectedPrintNames.length > 0 || selectedSizes.length > 0 || firstTimeOnly;

  // Filter items
  const filteredItems = useMemo(() => {
    const searchTokens = tokenizeSearch(searchTerm)
    return items
      .filter(item => selectedTypes.length === 0 || selectedTypes.includes(item.name))
      .map(item => {
        if (!anyPrintFilterActive) return item;
        return {
          ...item,
          fridayPrints: item.fridayPrints.filter(printMatchesFilters),
          sundayPrints: item.sundayPrints.filter(printMatchesFilters),
        };
      })
      .filter(item => {
        const allPrints = [...item.fridayPrints, ...item.sundayPrints];
        const matchSearch = searchTokens.length === 0 ||
          textMatchesTokens(item.name, searchTokens) ||
          allPrints.some(p => textMatchesTokens(p.name, searchTokens))
        // Also filter out items that have no prints for the selected day
        const hasPrintsForDay = filterDay === 'all'
          ? allPrints.length > 0
          : (filterDay === 'friday' ? item.fridayPrints.length > 0 : item.sundayPrints.length > 0)
        return matchSearch && hasPrintsForDay
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, selectedTypes, anyPrintFilterActive, selectedPrintNames, selectedSizes, firstTimeOnly, searchTerm, filterDay])

  const { visibleCount: visibleGroupedCount, sentinelRef: groupedSentinelRef } = useIncrementalRender(filteredItems.length, GROUPED_PAGE_SIZE)
  const visibleGroupedItems = filteredItems.slice(0, visibleGroupedCount)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kyte Anniversary Sale - July 2026</h1>
        <p className="subtitle">Friday vs Sunday Visual Browser</p>
      </header>

      <div className="assumptions-banner">
        ⚠️ This site assumes previously-unsold clearance inventory will still be available for this sale, and that every leftover product carrying a print shown in the official Look Book will be included, not just the specific items pictured there. Please watch Kyte's Instagram Live on Wednesday, July 8th for official confirmation of what's actually included and up to date prices for items not shown in the{' '}
        <a href="https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Anniversary_Sale_Look_Book.pdf" target="_blank" rel="noopener noreferrer">
          look book
        </a>.
      </div>

      <div className="controls">
        <div className="top-controls-row">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-button ${viewMode === 'photos' ? 'active' : ''}`}
              onClick={() => setViewMode('photos')}
            >
              Photo Grid
            </button>
            <button
              className={`view-mode-button ${viewMode === 'grouped' ? 'active' : ''}`}
              onClick={() => setViewMode('grouped')}
            >
              Grouped by Category
            </button>
          </div>

          <div className="day-filter">
            <span className="filter-label">Sale Day:</span>
            <button
              className={`day-button ${filterDay === 'all' ? 'active' : ''}`}
              onClick={() => setFilterDay('all')}
            >
              All Days
            </button>
            <button
              className={`day-button friday ${filterDay === 'friday' ? 'active' : ''}`}
              onClick={() => setFilterDay('friday')}
            >
              Friday
            </button>
            <button
              className={`day-button sunday ${filterDay === 'sunday' ? 'active' : ''}`}
              onClick={() => setFilterDay('sunday')}
            >
              Sunday
            </button>
          </div>
        </div>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search items or prints..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <MultiSelectDropdown
            label="Type"
            options={typeOptions}
            selected={selectedTypes}
            onChange={setSelectedTypes}
          />
          <MultiSelectDropdown
            label="Color / Print"
            options={printOptions}
            selected={selectedPrintNames}
            onChange={setSelectedPrintNames}
          />
          <MultiSelectDropdown
            label="Size"
            options={sizeOptions}
            selected={selectedSizes}
            onChange={setSelectedSizes}
          />
          <label className="first-time-toggle">
            <input
              type="checkbox"
              checked={firstTimeOnly}
              onChange={(e) => setFirstTimeOnly(e.target.checked)}
            />
            First time on clearance
          </label>
          <button type="button" className="clear-all-btn" onClick={handleClearAllFilters}>
            Clear all filters
          </button>
        </div>
        {selectedSizes.length > 0 && (
          <p className="filter-disclaimer">
            Size filtering only applies to prints with confirmed live inventory data — prints without pulled stock info are hidden while a size filter is active.
          </p>
        )}
      </div>

      {viewMode === 'photos' ? (
        <PhotoGridView
          items={filteredItems}
          filterDay={filterDay}
          searchTerm={searchTerm}
          onWishlistClick={(itemName, itemId, print, day) => handleWishlistClick(itemId, itemName, print, day)}
        />
      ) : (
        <GroupedMasonryView
          items={visibleGroupedItems}
          filterDay={filterDay}
          searchTerm={searchTerm}
          onPrintClick={(item, print) => setSelectedPrint({ print, itemName: item.name })}
          onWishlistClick={(item, print, day) => handleWishlistClick(item.id, item.name, print, day)}
          sentinelRef={groupedSentinelRef}
          showSentinel={visibleGroupedCount < filteredItems.length}
        />
      )}

      <PrintGallery
        print={selectedPrint?.print}
        itemName={selectedPrint?.itemName}
        onClose={() => setSelectedPrint(undefined)}
      />

      {/* Wishlist toggle button */}
      <button className="wishlist-toggle" onClick={() => setWishlistOpen(true)}>
        <span className="heart">&#9825;</span>
        <span className="label">Wishlist</span>
        {wishlistItems.length > 0 && (
          <span className="count">{wishlistItems.length}</span>
        )}
      </button>

      {/* Wishlist sidebar */}
      <WishlistSidebar isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />

      {/* Add to wishlist modal */}
      {wishlistModal && (
        <AddToWishlistModal
          isOpen={true}
          onClose={() => setWishlistModal(null)}
          itemId={wishlistModal.itemId}
          itemName={wishlistModal.itemName}
          print={wishlistModal.print}
          day={wishlistModal.day}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <WishlistProvider>
      <AppContent />
    </WishlistProvider>
  )
}

export default App
