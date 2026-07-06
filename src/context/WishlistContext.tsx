import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface WishlistItem {
  id: string;
  itemId: string;
  itemName: string;
  printName: string;
  size: string;
  price: number;
  day: 'friday' | 'sunday';
  imageUrl?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  bodyStyleOrder: string[];
  printOrder: Record<string, string[]>;
  addItem: (item: Omit<WishlistItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItemSize: (id: string, size: string, price: number) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  reorderBodyStyles: (fromName: string, toName: string) => void;
  reorderPrints: (bodyStyle: string, fromName: string, toName: string) => void;
  clearWishlist: () => void;
  totalPrice: number;
  isInWishlist: (itemId: string, printName: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'kyte-clearance-wishlist';
const ORDER_STORAGE_KEY = 'kyte-clearance-wishlist-order';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track custom ordering for body styles and prints
  const [bodyStyleOrder, setBodyStyleOrder] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(ORDER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.bodyStyleOrder || [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [printOrder, setPrintOrder] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem(ORDER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.printOrder || {};
      }
      return {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify({ bodyStyleOrder, printOrder }));
  }, [bodyStyleOrder, printOrder]);

  // Sync order arrays with existing items (for items added before ordering feature)
  useEffect(() => {
    // Get all unique body styles from items
    const bodyStylesInItems = [...new Set(items.map(item => item.itemName))];

    // Add any missing body styles to the order
    setBodyStyleOrder(prev => {
      const missing = bodyStylesInItems.filter(bs => !prev.includes(bs));
      if (missing.length > 0) {
        return [...prev, ...missing];
      }
      return prev;
    });

    // Build print order for each body style
    const printsPerBodyStyle: Record<string, string[]> = {};
    items.forEach(item => {
      if (!printsPerBodyStyle[item.itemName]) {
        printsPerBodyStyle[item.itemName] = [];
      }
      if (!printsPerBodyStyle[item.itemName].includes(item.printName)) {
        printsPerBodyStyle[item.itemName].push(item.printName);
      }
    });

    // Add any missing prints to the order
    setPrintOrder(prev => {
      const newOrder = { ...prev };
      let changed = false;
      Object.entries(printsPerBodyStyle).forEach(([bodyStyle, prints]) => {
        const existingPrints = newOrder[bodyStyle] || [];
        const missing = prints.filter(p => !existingPrints.includes(p));
        if (missing.length > 0) {
          newOrder[bodyStyle] = [...existingPrints, ...missing];
          changed = true;
        }
      });
      return changed ? newOrder : prev;
    });
  }, [items]);

  const addItem = useCallback((item: Omit<WishlistItem, 'id'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: `${item.itemId}-${item.printName}-${Date.now()}`,
    };
    setItems(prev => [...prev, newItem]);

    // Add body style to order if not present
    setBodyStyleOrder(prev => {
      if (!prev.includes(item.itemName)) {
        return [...prev, item.itemName];
      }
      return prev;
    });

    // Add print to order for this body style if not present
    setPrintOrder(prev => {
      const currentPrints = prev[item.itemName] || [];
      if (!currentPrints.includes(item.printName)) {
        return { ...prev, [item.itemName]: [...currentPrints, item.printName] };
      }
      return prev;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItemSize = useCallback((id: string, size: string, price: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, size, price } : item
    ));
  }, []);

  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, []);

  const reorderBodyStyles = useCallback((fromName: string, toName: string) => {
    setBodyStyleOrder(prev => {
      const newOrder = [...prev];
      const fromIndex = newOrder.indexOf(fromName);
      const toIndex = newOrder.indexOf(toName);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return newOrder;
    });
  }, []);

  const reorderPrints = useCallback((bodyStyle: string, fromName: string, toName: string) => {
    setPrintOrder(prev => {
      const currentPrints = prev[bodyStyle] || [];
      const newPrints = [...currentPrints];
      const fromIndex = newPrints.indexOf(fromName);
      const toIndex = newPrints.indexOf(toName);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = newPrints.splice(fromIndex, 1);
      newPrints.splice(toIndex, 0, moved);
      return { ...prev, [bodyStyle]: newPrints };
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
    setBodyStyleOrder([]);
    setPrintOrder({});
  }, []);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const isInWishlist = useCallback((itemId: string, printName: string) => {
    return items.some(item => item.itemId === itemId && item.printName === printName);
  }, [items]);

  return (
    <WishlistContext.Provider value={{
      items,
      bodyStyleOrder,
      printOrder,
      addItem,
      removeItem,
      updateItemSize,
      reorderItems,
      reorderBodyStyles,
      reorderPrints,
      clearWishlist,
      totalPrice,
      isInWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
