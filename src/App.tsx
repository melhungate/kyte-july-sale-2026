import { useState } from 'react'
import './App.css'
import { saleEntries } from './data/saleData'
import type { SaleEntry, EnrichedPrint } from './data/saleData'
import { ItemCard } from './components/ItemCard'
import { PrintGallery } from './components/PrintGallery'
import { WishlistProvider, useWishlist } from './context/WishlistContext'
import { WishlistSidebar } from './components/WishlistSidebar'
import { AddToWishlistModal } from './components/AddToWishlistModal'

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
  const [selectedPrint, setSelectedPrint] = useState<SelectedPrint | undefined>()
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDay, setFilterDay] = useState<SaleDay>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [wishlistModal, setWishlistModal] = useState<WishlistModalData | null>(null)
  const { items: wishlistItems } = useWishlist()

  const handleWishlistClick = (item: SaleEntry, print: EnrichedPrint, day: 'friday' | 'sunday') => {
    setWishlistModal({
      itemId: item.id,
      itemName: item.name,
      print,
      day,
    });
  };

  // Get unique sections (broader category groupings)
  const categories = ['all', ...Array.from(new Set(items.map(item => item.section)))]

  // Filter items
  const filteredItems = items.filter(item => {
    const matchCategory = filterCategory === 'all' || item.section === filterCategory
    const allPrints = [...item.fridayPrints, ...item.sundayPrints];
    const matchSearch = searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allPrints.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    // Also filter out items that have no prints for the selected day
    const hasPrintsForDay = filterDay === 'all'
      ? allPrints.length > 0
      : (filterDay === 'friday' ? item.fridayPrints.length > 0 : item.sundayPrints.length > 0)
    return matchCategory && matchSearch && hasPrintsForDay
  })

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kyte Anniversary Sale - July 2026</h1>
        <p className="subtitle">Friday vs Sunday Visual Browser</p>
      </header>

      <div className="controls">
        <input
          type="text"
          placeholder="Search items or prints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

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

        <div className="filter-buttons">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-button ${filterCategory === category ? 'active' : ''}`}
              onClick={() => setFilterCategory(category)}
            >
              {category === 'all' ? 'All Items' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="items-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              filterDay={filterDay}
              searchTerm={searchTerm}
              onPrintClick={(print) => setSelectedPrint({ print, itemName: item.name })}
              onWishlistClick={(print, day) => handleWishlistClick(item, print, day)}
            />
          ))
        ) : (
          <div className="no-results">
            <p>No items found matching your search.</p>
          </div>
        )}
      </div>

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
