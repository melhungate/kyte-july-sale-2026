import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import type { WishlistItem } from '../context/WishlistContext';
import { formatPrice } from '../utils/priceUtils';
import { getKytePrintUrl } from '../utils/kyteUrls';
import './WishlistSidebar.css';

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate CSV export content
const generateCsvContent = (items: WishlistItem[]): string => {
  const escapeField = (field: string) => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const header = 'Day,Style,Size,Print,Price,Link';
  const rows = items.map(item => {
    const link = getKytePrintUrl(item.printName, item.itemName);
    return [
      escapeField(item.day.charAt(0).toUpperCase() + item.day.slice(1)),
      escapeField(item.itemName),
      escapeField(item.size),
      escapeField(item.printName),
      escapeField(formatPrice(item.price)),
      escapeField(link)
    ].join(',');
  });

  return [header, ...rows].join('\n');
};

// Download file
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Group items by body style, then by print
interface PrintGroup {
  printName: string;
  itemName: string;
  imageUrl: string | undefined;
  items: WishlistItem[];
  totalPrice: number;
}

interface BodyStyleGroup {
  itemName: string;
  prints: PrintGroup[];
  totalPrice: number;
}

const groupItems = (
  items: WishlistItem[],
  bodyStyleOrder: string[],
  printOrder: Record<string, string[]>
): BodyStyleGroup[] => {
  const bodyStyleMap = new Map<string, Map<string, WishlistItem[]>>();

  // Group by itemName, then by printName
  items.forEach(item => {
    if (!bodyStyleMap.has(item.itemName)) {
      bodyStyleMap.set(item.itemName, new Map());
    }
    const printMap = bodyStyleMap.get(item.itemName)!;
    if (!printMap.has(item.printName)) {
      printMap.set(item.printName, []);
    }
    printMap.get(item.printName)!.push(item);
  });

  // Convert to array structure with ordering
  const result: BodyStyleGroup[] = [];

  // Get all body styles present in items
  const presentBodyStyles = Array.from(bodyStyleMap.keys());

  // Sort by custom order, with unordered items at the end
  const sortedBodyStyles = [...presentBodyStyles].sort((a, b) => {
    const aIndex = bodyStyleOrder.indexOf(a);
    const bIndex = bodyStyleOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  sortedBodyStyles.forEach(itemName => {
    const printMap = bodyStyleMap.get(itemName)!;
    const prints: PrintGroup[] = [];
    let bodyStyleTotal = 0;

    // Get all prints for this body style
    const presentPrints = Array.from(printMap.keys());
    const customPrintOrder = printOrder[itemName] || [];

    // Sort by custom order
    const sortedPrints = [...presentPrints].sort((a, b) => {
      const aIndex = customPrintOrder.indexOf(a);
      const bIndex = customPrintOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    sortedPrints.forEach(printName => {
      const printItems = printMap.get(printName)!;
      const printTotal = printItems.reduce((sum, item) => sum + item.price, 0);
      bodyStyleTotal += printTotal;
      prints.push({
        printName,
        itemName,
        imageUrl: printItems.find(i => i.imageUrl)?.imageUrl,
        items: printItems,
        totalPrice: printTotal,
      });
    });

    result.push({
      itemName,
      prints,
      totalPrice: bodyStyleTotal,
    });
  });

  return result;
};

type DayFilter = 'all' | 'friday' | 'sunday';
type DragType = 'bodyStyle' | 'print' | null;

export const WishlistSidebar: React.FC<WishlistSidebarProps> = ({ isOpen, onClose }) => {
  const {
    items,
    bodyStyleOrder,
    printOrder,
    removeItem,
    reorderBodyStyles,
    reorderPrints,
    clearWishlist
  } = useWishlist();

  const [isExpanded, setIsExpanded] = useState(false);
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');

  // Drag state
  const [dragType, setDragType] = useState<DragType>(null);
  const [draggedBodyStyle, setDraggedBodyStyle] = useState<string | null>(null);
  const [dragOverBodyStyle, setDragOverBodyStyle] = useState<string | null>(null);
  const [draggedPrint, setDraggedPrint] = useState<{ bodyStyle: string; print: string } | null>(null);
  const [dragOverPrint, setDragOverPrint] = useState<{ bodyStyle: string; print: string } | null>(null);

  // Filter items based on selected day
  const filteredItems = dayFilter === 'all'
    ? items
    : items.filter(item => item.day === dayFilter);

  const groupedItems = groupItems(filteredItems, bodyStyleOrder, printOrder);
  const fridayItems = items.filter(item => item.day === 'friday');
  const sundayItems = items.filter(item => item.day === 'sunday');
  const fridayTotal = fridayItems.reduce((sum, item) => sum + item.price, 0);
  const sundayTotal = sundayItems.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = fridayTotal + sundayTotal;

  // Calculate filtered total
  const filteredTotal = filteredItems.reduce((sum, item) => sum + item.price, 0);

  const handleExport = () => {
    const content = generateCsvContent(items);
    downloadFile(content, 'kyte-wishlist.csv', 'text/csv');
  };

  // Body style drag handlers
  const handleBodyStyleDragStart = (e: React.DragEvent, itemName: string) => {
    setDragType('bodyStyle');
    setDraggedBodyStyle(itemName);
    e.dataTransfer.effectAllowed = 'move';
    // Set a drag image
    const target = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(target, 20, 20);
  };

  const handleBodyStyleDragOver = (e: React.DragEvent, itemName: string) => {
    e.preventDefault();
    if (dragType === 'bodyStyle' && draggedBodyStyle !== itemName) {
      setDragOverBodyStyle(itemName);
    }
  };

  const handleBodyStyleDragLeave = () => {
    setDragOverBodyStyle(null);
  };

  const handleBodyStyleDrop = (e: React.DragEvent, targetItemName: string) => {
    e.preventDefault();
    if (dragType === 'bodyStyle' && draggedBodyStyle && draggedBodyStyle !== targetItemName) {
      reorderBodyStyles(draggedBodyStyle, targetItemName);
    }
    resetDragState();
  };

  // Print drag handlers
  const handlePrintDragStart = (e: React.DragEvent, bodyStyle: string, printName: string) => {
    e.stopPropagation();
    setDragType('print');
    setDraggedPrint({ bodyStyle, print: printName });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePrintDragOver = (e: React.DragEvent, bodyStyle: string, printName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragType === 'print' && draggedPrint &&
        draggedPrint.bodyStyle === bodyStyle &&
        draggedPrint.print !== printName) {
      setDragOverPrint({ bodyStyle, print: printName });
    }
  };

  const handlePrintDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverPrint(null);
  };

  const handlePrintDrop = (e: React.DragEvent, bodyStyle: string, targetPrint: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragType === 'print' && draggedPrint &&
        draggedPrint.bodyStyle === bodyStyle &&
        draggedPrint.print !== targetPrint) {
      reorderPrints(bodyStyle, draggedPrint.print, targetPrint);
    }
    resetDragState();
  };

  const resetDragState = () => {
    setDragType(null);
    setDraggedBodyStyle(null);
    setDragOverBodyStyle(null);
    setDraggedPrint(null);
    setDragOverPrint(null);
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  return (
    <>
      <div className={`wishlist-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`wishlist-sidebar ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
        <div className="wishlist-header">
          <h2>Wishlist ({items.length})</h2>
          <div className="header-buttons">
            <button
              className="expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse wishlist' : 'Expand wishlist'}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '→' : '←'}
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close wishlist">
              &times;
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="day-filter">
            <button
              className={`filter-btn ${dayFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDayFilter('all')}
            >
              All ({items.length})
            </button>
            <button
              className={`filter-btn friday ${dayFilter === 'friday' ? 'active' : ''}`}
              onClick={() => setDayFilter('friday')}
            >
              Friday ({fridayItems.length})
            </button>
            <button
              className={`filter-btn sunday ${dayFilter === 'sunday' ? 'active' : ''}`}
              onClick={() => setDayFilter('sunday')}
            >
              Sunday ({sundayItems.length})
            </button>
          </div>
        )}

        <div className="wishlist-content">
          {items.length === 0 ? (
            <div className="wishlist-empty">
              <p>Your wishlist is empty</p>
              <p className="hint">Click the heart icon on any print to add it!</p>
            </div>
          ) : (
            <div className="wishlist-grouped">
              {groupedItems.map((bodyStyle) => (
                <div
                  key={bodyStyle.itemName}
                  className={`body-style-group ${
                    draggedBodyStyle === bodyStyle.itemName ? 'dragging' : ''
                  } ${
                    dragOverBodyStyle === bodyStyle.itemName ? 'drag-over' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleBodyStyleDragStart(e, bodyStyle.itemName)}
                  onDragOver={(e) => handleBodyStyleDragOver(e, bodyStyle.itemName)}
                  onDragLeave={handleBodyStyleDragLeave}
                  onDrop={(e) => handleBodyStyleDrop(e, bodyStyle.itemName)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="body-style-header">
                    <div className="body-style-drag-area">
                      <span className="drag-handle" title="Drag to reorder">⋮⋮</span>
                      <span className="body-style-name">{bodyStyle.itemName}</span>
                    </div>
                    <span className="body-style-total">{formatPrice(bodyStyle.totalPrice)}</span>
                  </div>
                  <div className="prints-list">
                    {bodyStyle.prints.map((print) => (
                      <div
                        key={print.printName}
                        className={`print-group ${
                          draggedPrint?.bodyStyle === bodyStyle.itemName &&
                          draggedPrint?.print === print.printName ? 'dragging' : ''
                        } ${
                          dragOverPrint?.bodyStyle === bodyStyle.itemName &&
                          dragOverPrint?.print === print.printName ? 'drag-over' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handlePrintDragStart(e, bodyStyle.itemName, print.printName)}
                        onDragOver={(e) => handlePrintDragOver(e, bodyStyle.itemName, print.printName)}
                        onDragLeave={handlePrintDragLeave}
                        onDrop={(e) => handlePrintDrop(e, bodyStyle.itemName, print.printName)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="print-group-header">
                          <span className="drag-handle small" title="Drag to reorder">⋮⋮</span>
                          {print.imageUrl && (
                            <div className="item-swatch">
                              <img src={print.imageUrl} alt={print.printName} />
                            </div>
                          )}
                          <div className="print-group-info">
                            <a
                              href={getKytePrintUrl(print.printName, print.itemName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="print-name-link"
                              title={`Search Kyte for ${print.printName} ${print.itemName}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {print.printName}
                            </a>
                            {print.items.length > 1 && (
                              <span className="print-qty">x{print.items.length}</span>
                            )}
                          </div>
                          <span className="print-total">{formatPrice(print.totalPrice)}</span>
                        </div>
                        <div className="size-list">
                          {print.items.map(item => (
                            <div key={item.id} className="size-item">
                              <div className="size-item-info">
                                <span className={`day-badge ${item.day}`}>{item.day}</span>
                                <span className="size-badge">{item.size}</span>
                                <span className="size-price">{formatPrice(item.price)}</span>
                              </div>
                              <button
                                className="remove-btn"
                                onClick={() => removeItem(item.id)}
                                aria-label="Remove from wishlist"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="wishlist-footer">
            <div className="footer-top">
              <div className="day-subtotals">
                {fridayItems.length > 0 && (
                  <span className="subtotal friday">Fri: {formatPrice(fridayTotal)}</span>
                )}
                {sundayItems.length > 0 && (
                  <span className="subtotal sunday">Sun: {formatPrice(sundayTotal)}</span>
                )}
              </div>
              <div className="total-display">
                <span className="total-price">{formatPrice(dayFilter === 'all' ? grandTotal : filteredTotal)}</span>
              </div>
            </div>
            <div className="footer-buttons">
              <button className="export-btn" onClick={handleExport}>
                Export
              </button>
              <button className="clear-btn" onClick={clearWishlist}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
