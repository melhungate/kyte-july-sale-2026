import React, { useState } from 'react';
import type { EnrichedPrint } from '../data/saleData';
import { resolveImage } from '../utils/resolveImage';
import './PrintGallery.css';

interface PrintGalleryProps {
  print?: EnrichedPrint;
  itemName?: string;
  onClose?: () => void;
}

export const PrintGallery: React.FC<PrintGalleryProps> = ({ print, itemName, onClose }) => {
  const [imageError, setImageError] = useState(false);

  if (!print) return null;

  const imageUrl = resolveImage(print);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{print.name}</h2>
        {itemName && <p className="item-context">for {itemName}</p>}

        <div className="print-details">
          {imageUrl && !imageError ? (
            <div className="print-image-container">
              <img
                src={imageUrl}
                alt={print.name}
                className="print-full-image"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="no-image">
              <p className="print-instruction">
                {imageError ? 'Image failed to load.' : 'No image available for this print.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
