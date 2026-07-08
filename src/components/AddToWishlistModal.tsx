import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice, sortSizes } from '../utils/priceUtils';
import { resolveImage } from '../utils/resolveImage';
import type { EnrichedPrint } from '../data/saleData';
import './AddToWishlistModal.css';

interface AddToWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  print: EnrichedPrint;
  day: 'friday' | 'sunday';
}

export const AddToWishlistModal: React.FC<AddToWishlistModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  print,
  day,
}) => {
  const { addItem, isInWishlist } = useWishlist();
  const sizesAreHistorical = !print.productMatch && !!print.historicalSizes?.length;
  const sizesAreInferred = !print.productMatch && !sizesAreHistorical && !!print.inferredSizes?.length;
  const availableSizes = print.productMatch
    ? sortSizes(Array.from(new Set(print.productMatch.variants.map(v => v.size))))
    : sizesAreHistorical
      ? sortSizes(print.historicalSizes!)
      : sizesAreInferred
        ? sortSizes(print.inferredSizes!)
        : ['One Size'];
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);

  const alreadyInWishlist = isInWishlist(itemId, print.name);
  const imageUrl = resolveImage(print);

  // Trust the variant's own per-size price when it's backed by a live product
  // ('predictions') or a confirmed price ladder ('pdf-confirmed'); when the
  // PDF price is only confirmed for the smallest size ('pdf-starting-only'),
  // fall back to that flat number for every size instead of guessing.
  const matchingVariant = print.productMatch?.variants.find(v => v.size === selectedSize);
  const trustsPerSizePrice = print.priceSource === 'predictions' || print.priceSource === 'pdf-confirmed';
  const currentPrice = trustsPerSizePrice && matchingVariant?.price != null
    ? matchingVariant.price
    : (print.price?.min ?? 0);

  const handleAdd = () => {
    addItem({
      itemId,
      itemName,
      printName: print.name,
      size: selectedSize,
      price: currentPrice,
      day,
      imageUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-wishlist-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h3>Add to Wishlist</h3>

        <div className="modal-item-info">
          <span className="modal-item-name">{itemName}</span>
          <span className="modal-print-name">{print.name}</span>
          <span className={`modal-day ${day}`}>{day}</span>
        </div>

        {alreadyInWishlist && (
          <div className="already-added-notice">
            This print is already in your wishlist. Adding again will create a duplicate.
          </div>
        )}

        <div className="size-selection">
          <label>Select Size:</label>
          <div className="size-buttons">
            {availableSizes.map(size => (
              <button
                key={size}
                className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
          {sizesAreHistorical && (
            <p className="size-inferred-note">
              ⓘ Sizes shown are from a {print.historicalSnapshotDate} snapshot taken before this print was removed from the site — current availability isn't confirmed.
            </p>
          )}
          {sizesAreInferred && (
            <p className="size-inferred-note">
              ⓘ Sizes shown are based on this product's other prints — exact stock for {print.name} isn't confirmed.
            </p>
          )}
        </div>

        <div className="modal-price">
          <span>Price:</span>
          <span
            className="price-value"
            title={print.priceSource === 'pdf-starting-only' ? 'Starting price only — larger sizes may cost more' : undefined}
          >
            {formatPrice(currentPrice)}{print.priceSource === 'pdf-starting-only' ? '+' : ''}
          </span>
        </div>

        <button className="add-btn" onClick={handleAdd}>
          Add to Wishlist
        </button>
      </div>
    </div>
  );
};
