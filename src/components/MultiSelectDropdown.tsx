import React, { useEffect, useRef, useState } from 'react';
import './MultiSelectDropdown.css';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(o => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const filteredOptions = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="multiselect" ref={containerRef}>
      <button
        type="button"
        className={`multiselect-trigger ${selected.length > 0 ? 'active' : ''}`}
        onClick={() => setOpen(prev => !prev)}
      >
        {label}
        {selected.length > 0 && <span className="multiselect-count">{selected.length}</span>}
        <span className="multiselect-caret">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="multiselect-panel">
          {options.length > 8 && (
            <input
              type="text"
              className="multiselect-search"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          )}
          <div className="multiselect-actions">
            <button type="button" onClick={() => onChange([])}>Clear</button>
            <span>{selected.length} selected</span>
          </div>
          <div className="multiselect-options">
            {filteredOptions.map(option => (
              <label key={option} className="multiselect-option">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div className="multiselect-empty">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
