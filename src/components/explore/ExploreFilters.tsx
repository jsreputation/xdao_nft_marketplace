'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCollections } from '@/hooks/useSubgraph';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon,
  TagIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export interface NFTFilters {
  collections: string[];
  minPrice: string;
  maxPrice: string;
  status: 'all' | 'listed' | 'auction' | 'new' | 'hasOffers' | 'sold' | 'priceUpdated';
  sortBy: 'price' | 'recentlyListed' | 'recentlySold' | 'recentlyUpdated' | 'oldest' | 'mostOffers' | 'highestSale';
  sortDirection: 'asc' | 'desc';
  searchQuery?: string;
  sold?: boolean;
  minOfferCount?: number;
  timeRange?: 'all' | '24h' | '7d' | '30d';
  priceUpdated?: boolean;
}

export interface CollectionFilters {
  minFloorPrice: string;
  maxFloorPrice: string;
  sortBy: 'totalVolume' | 'volume24h' | 'volume7d' | 'volume30d' | 'floorPrice' | 'totalItems' | 'totalSales' | 'sales24h' | 'sales7d' | 'sales30d' | 'uniqueOwners' | 'recentlyCreated';
  sortDirection: 'asc' | 'desc';
  searchQuery?: string;
  minVolume24h?: string;
  minSales24h?: string;
  minUniqueOwners?: number;
  isPublic?: boolean;
  timeRange?: 'all' | '24h' | '7d' | '30d';
}

interface ExploreFiltersProps {
  activeTab: 'collections' | 'nfts';
  nftFilters: NFTFilters;
  collectionFilters: CollectionFilters;
  onNftFiltersChange: (filters: NFTFilters) => void;
  onCollectionFiltersChange: (filters: CollectionFilters) => void;
}

// Price Range Slider Component
function PriceRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const [localMin, setLocalMin] = useState(minValue || min);
  const [localMax, setLocalMax] = useState(maxValue || max);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (minValue !== undefined && minValue !== null) {
      setLocalMin(minValue);
    }
    if (maxValue !== undefined && maxValue !== null) {
      setLocalMax(maxValue);
    }
  }, [minValue, maxValue]);

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || min;
    const clampedVal = Math.min(Math.max(val, min), localMax - 0.01);
    setLocalMin(clampedVal);
    onMinChange(clampedVal);
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || max;
    const clampedVal = Math.max(Math.min(val, max), localMin + 0.01);
    setLocalMax(clampedVal);
    onMaxChange(clampedVal);
  };

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return min;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return min + percent * (max - min);
  };

  const handleMouseDown = (e: React.MouseEvent, handle: 'min' | 'max') => {
    e.preventDefault();
    setDragging(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !sliderRef.current) return;

    const newValue = getValueFromPosition(e.clientX);
    const roundedValue = Math.round(newValue * 100) / 100;

    if (dragging === 'min') {
      const clampedVal = Math.min(Math.max(roundedValue, min), localMax - 0.01);
      setLocalMin(clampedVal);
      onMinChange(clampedVal);
    } else {
      const clampedVal = Math.max(Math.min(roundedValue, max), localMin + 0.01);
      setLocalMax(clampedVal);
      onMaxChange(clampedVal);
    }
  }, [dragging, min, max, localMin, localMax, onMinChange, onMaxChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const handleSliderClick = (e: React.MouseEvent) => {
    if (!sliderRef.current || dragging) return;
    
    const newValue = getValueFromPosition(e.clientX);
    const roundedValue = Math.round(newValue * 100) / 100;
    const minPercent = ((localMin - min) / (max - min)) * 100;
    const maxPercent = ((localMax - min) / (max - min)) * 100;
    const clickPercent = ((newValue - min) / (max - min)) * 100;

    // Determine which handle is closer
    const distToMin = Math.abs(clickPercent - minPercent);
    const distToMax = Math.abs(clickPercent - maxPercent);

    if (distToMin < distToMax) {
      const clampedVal = Math.min(Math.max(roundedValue, min), localMax - 0.01);
      setLocalMin(clampedVal);
      onMinChange(clampedVal);
    } else {
      const clampedVal = Math.max(Math.min(roundedValue, max), localMin + 0.01);
      setLocalMax(clampedVal);
      onMaxChange(clampedVal);
    }
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div 
        ref={sliderRef}
        className="relative h-2.5 bg-gray-700 rounded-full mb-3 cursor-pointer"
        onClick={handleSliderClick}
      >
        <div
          className="absolute h-2.5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        <div
          className={`absolute w-5 h-5 bg-primary-500 rounded-full border-2 border-gray-900 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-transform ${dragging === 'min' ? 'scale-125 z-30' : 'z-20'}`}
          style={{ left: `calc(${minPercent}% - 10px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'min')}
        />
        <div
          className={`absolute w-5 h-5 bg-purple-500 rounded-full border-2 border-gray-900 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-transform ${dragging === 'max' ? 'scale-125 z-30' : 'z-20'}`}
          style={{ left: `calc(${maxPercent}% - 10px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'max')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Min</label>
          <input
            type="number"
            step="0.01"
            placeholder="0"
            value={localMin === min ? '' : localMin}
            onChange={handleMinInput}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Max</label>
          <input
            type="number"
            step="0.01"
            placeholder="1000"
            value={localMax === max ? '' : localMax}
            onChange={handleMaxInput}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

// Sort By Dropdown Component
function SortByDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current && isOpen) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-gray-800 border border-gray-600/50 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
      }}
    >
      <div className="py-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              value === option.value
                ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-primary-300 border-l-2 border-primary-500'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="relative w-full" ref={containerRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-3 py-2.5 cursor-pointer focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all flex items-center justify-between gap-2"
        >
          <span className="text-sm text-white">{selectedOption.label}</span>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {/* Render dropdown using portal to escape scrollable container */}
      {typeof window !== 'undefined' && isOpen && createPortal(dropdownContent, document.body)}
    </>
  );
}

// Collection Multi-Select Component
function CollectionMultiSelect({
  collections,
  selected,
  onSelectionChange,
}: {
  collections: any[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current && isOpen) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleCollection = (collectionAddr: string) => {
    const normalizedAddr = collectionAddr.toLowerCase();
    const normalizedSelected = selected.map(id => id.toLowerCase());
    
    if (normalizedSelected.includes(normalizedAddr)) {
      onSelectionChange(selected.filter(id => id.toLowerCase() !== normalizedAddr));
    } else {
      onSelectionChange([...selected, collectionAddr]);
    }
  };

  const removeCollection = (collectionAddr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const normalizedAddr = collectionAddr.toLowerCase();
    onSelectionChange(selected.filter(id => id.toLowerCase() !== normalizedAddr));
  };

  const getCollectionName = (collectionAddr: string) => {
    const collection = collections.find(
      (c: any) => (c.address || c.id).toLowerCase() === collectionAddr.toLowerCase()
    );
    if (collection) {
      return collection.name || `${collectionAddr.slice(0, 6)}...${collectionAddr.slice(-4)}`;
    }
    return `${collectionAddr.slice(0, 6)}...${collectionAddr.slice(-4)}`;
  };

  const isSelected = (collectionAddr: string) => {
    return selected.some(id => id.toLowerCase() === collectionAddr.toLowerCase());
  };

  const selectedCollections = selected.map(addr => ({
    addr,
    name: getCollectionName(addr),
  }));

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-gray-800 border border-gray-600/50 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
      }}
    >
      {collections.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-400">No collections available</div>
      ) : (
        <div className="py-1">
          {collections.map((collection: any) => {
            const collectionAddr = collection.address || collection.id;
            const displayName = collection.name || `${collectionAddr.slice(0, 6)}...${collectionAddr.slice(-4)}`;
            const checked = isSelected(collectionAddr);
            
            return (
              <label
                key={collection.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={(e) => {
                  // Prevent the dropdown from closing when clicking on a label
                  e.stopPropagation();
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleCollection(collectionAddr);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:ring-offset-gray-800 cursor-pointer transition-all"
                />
                <span className="text-sm text-gray-300 flex-1">{displayName}</span>
                {collection.verified && (
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="relative w-full" ref={containerRef}>
        {/* Selected Collections Display */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-3 py-2.5 min-h-[40px] cursor-pointer focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all flex items-center justify-between gap-2"
        >
          <div className="flex-1 flex flex-wrap gap-1.5 min-h-[20px]">
            {selectedCollections.length === 0 ? (
              <span className="text-sm text-gray-500">Select collections...</span>
            ) : (
              selectedCollections.map(({ addr, name }) => (
                <span
                  key={addr}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-md border border-primary-500/30"
                >
                  <span className="truncate max-w-[120px]">{name}</span>
                  <button
                    type="button"
                    onClick={(e) => removeCollection(addr, e)}
                    className="hover:text-primary-100 transition-colors flex-shrink-0"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {/* Render dropdown using portal to escape scrollable container */}
      {typeof window !== 'undefined' && isOpen && createPortal(dropdownContent, document.body)}
    </>
  );
}

// Filter Presets Component
function FilterPresets({
  activeTab,
  onPresetClick,
}: {
  activeTab: 'collections' | 'nfts';
  onPresetClick: (preset: string) => void;
}) {
  const presets = useMemo(() => {
    if (activeTab === 'nfts') {
      return [
        { id: 'last24h', label: 'Last 24h', icon: ClockIcon },
        { id: 'last7d', label: 'Last 7d', icon: ClockIcon },
        { id: 'trending', label: 'Trending', icon: SparklesIcon },
        { id: 'newListings', label: 'New Listings', icon: TagIcon },
      ];
    } else {
      return [
        { id: 'last24h', label: 'Last 24h', icon: ClockIcon },
        { id: 'last7d', label: 'Last 7d', icon: ClockIcon },
        { id: 'trending', label: 'Trending', icon: SparklesIcon },
      ];
    }
  }, [activeTab]);

  return (
        <div className="flex flex-wrap gap-1.5">
      {presets.map((preset) => {
        const Icon = preset.icon;
        return (
          <button
            key={preset.id}
            onClick={() => onPresetClick(preset.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
          >
            <Icon className="w-4 h-4" />
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}

export function ExploreFilters({
  activeTab,
  nftFilters,
  collectionFilters,
  onNftFiltersChange,
  onCollectionFiltersChange,
}: ExploreFiltersProps) {
  const { data: collectionsData } = useCollections({ first: 100, skipPolling: true });
  const collections = collectionsData?.collections || [];

  const updateNftFilter = useCallback((key: keyof NFTFilters, value: any) => {
    onNftFiltersChange({ ...nftFilters, [key]: value });
  }, [nftFilters, onNftFiltersChange]);

  const updateCollectionFilter = useCallback((key: keyof CollectionFilters, value: any) => {
    onCollectionFiltersChange({ ...collectionFilters, [key]: value });
  }, [collectionFilters, onCollectionFiltersChange]);

  const priceMin = 0;
  const priceMax = 1000;

  const getPriceValue = () => {
    if (activeTab === 'nfts') {
      const min = nftFilters.minPrice ? parseFloat(nftFilters.minPrice) : priceMin;
      const max = nftFilters.maxPrice ? parseFloat(nftFilters.maxPrice) : priceMax;
      return {
        min: isNaN(min) ? priceMin : min,
        max: isNaN(max) ? priceMax : max,
      };
    } else {
      const min = collectionFilters.minFloorPrice ? parseFloat(collectionFilters.minFloorPrice) : priceMin;
      const max = collectionFilters.maxFloorPrice ? parseFloat(collectionFilters.maxFloorPrice) : priceMax;
      return {
        min: isNaN(min) ? priceMin : min,
        max: isNaN(max) ? priceMax : max,
      };
    }
  };

  const priceRange = getPriceValue();

  const toggleCollection = useCallback((collectionId: string) => {
    const normalizedId = collectionId.toLowerCase();
    const normalizedFilters = nftFilters.collections.map((id) => id.toLowerCase());
    
    const newCollections = normalizedFilters.includes(normalizedId)
      ? nftFilters.collections.filter((id) => id.toLowerCase() !== normalizedId)
      : [...nftFilters.collections, collectionId];
    updateNftFilter('collections', newCollections);
  }, [nftFilters.collections, updateNftFilter]);

  const handlePreset = useCallback((presetId: string) => {
    if (activeTab === 'nfts') {
      switch (presetId) {
        case 'last24h':
          updateNftFilter('timeRange', '24h');
          updateNftFilter('status', 'new');
          break;
        case 'last7d':
          updateNftFilter('timeRange', '7d');
          updateNftFilter('status', 'new');
          break;
        case 'trending':
          updateNftFilter('sortBy', 'mostOffers');
          updateNftFilter('status', 'hasOffers');
          break;
        case 'newListings':
          updateNftFilter('status', 'new');
          updateNftFilter('timeRange', '7d');
          break;
      }
    } else {
      switch (presetId) {
        case 'last24h':
          updateCollectionFilter('timeRange', '24h');
          updateCollectionFilter('sortBy', 'volume24h');
          break;
        case 'last7d':
          updateCollectionFilter('timeRange', '7d');
          updateCollectionFilter('sortBy', 'volume7d');
          break;
        case 'trending':
          updateCollectionFilter('sortBy', 'volume24h');
          break;
      }
    }
  }, [activeTab, updateNftFilter, updateCollectionFilter]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab === 'nfts') {
      if (nftFilters.collections.length > 0) count += nftFilters.collections.length;
      if (nftFilters.minPrice || nftFilters.maxPrice) count++;
      if (nftFilters.status !== 'all') count++;
      if (nftFilters.minOfferCount) count++;
      if (nftFilters.timeRange && nftFilters.timeRange !== 'all') count++;
      if (nftFilters.priceUpdated) count++;
      if (nftFilters.sold !== undefined) count++;
      if (nftFilters.searchQuery) count++;
    } else {
      if (collectionFilters.minFloorPrice || collectionFilters.maxFloorPrice) count++;
      if (collectionFilters.timeRange && collectionFilters.timeRange !== 'all') count++;
      if (collectionFilters.searchQuery) count++;
    }
    return count;
  }, [nftFilters, collectionFilters, activeTab]);

  return (
    <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
      {/* Header with active filter count */}
      <div className="p-3 border-b border-gray-700/50 bg-gradient-to-r from-primary-900/20 to-purple-900/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-primary-400" />
            <h3 className="font-bold text-white text-sm">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-semibold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                if (activeTab === 'nfts') {
                  onNftFiltersChange({
                    collections: [],
                    minPrice: '',
                    maxPrice: '',
                    status: 'all',
                    sortBy: 'recentlyListed',
                    sortDirection: 'desc',
                    searchQuery: '',
                    timeRange: 'all',
                  });
                } else {
                  onCollectionFiltersChange({
                    minFloorPrice: '',
                    maxFloorPrice: '',
                    sortBy: 'totalVolume',
                    sortDirection: 'desc',
                    searchQuery: '',
                    timeRange: 'all',
                  });
                }
              }}
              className="text-xs text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
        <FilterPresets activeTab={activeTab} onPresetClick={handlePreset} />
      </div>

      <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        {activeTab === 'nfts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - NFTs */}
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <MagnifyingGlassIcon className="w-4 h-4 text-primary-400" />
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search NFTs..."
                    value={nftFilters.searchQuery || ''}
                    onChange={(e) => updateNftFilter('searchQuery', e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Collections */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <TagIcon className="w-4 h-4 text-primary-400" />
                  Collections
                </label>
                <CollectionMultiSelect
                  collections={collections}
                  selected={nftFilters.collections}
                  onSelectionChange={(selected) => updateNftFilter('collections', selected)}
                />
              </div>

              {/* Offers */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <TagIcon className="w-4 h-4 text-primary-400" />
                  Offers
                </label>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Minimum Offer Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={nftFilters.minOfferCount || ''}
                    onChange={(e) => updateNftFilter('minOfferCount', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - NFTs */}
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <TagIcon className="w-4 h-4 text-primary-400" />
                  Status
                </label>
                <div className="inline-flex rounded-lg overflow-hidden border border-gray-600/50 bg-gray-700/50 p-0.5">
                  {([
                    { value: 'all', label: 'All Items' },
                    { value: 'listed', label: 'Buy Now' },
                    { value: 'auction', label: 'On Auction' },
                    { value: 'new', label: 'Recently Added' },
                    { value: 'hasOffers', label: 'Has Offers' },
                    { value: 'sold', label: 'Sold' },
                    { value: 'priceUpdated', label: 'Price Updated' },
                  ] as const).map(({ value, label }, index, array) => (
                    <button
                      key={value}
                      onClick={() => updateNftFilter('status', value)}
                      className={`px-3 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                        index === 0 ? 'rounded-l-md' : ''
                      } ${
                        index === array.length - 1 ? 'rounded-r-md' : ''
                      } ${
                        nftFilters.status === value
                          ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/40'
                          : 'bg-transparent text-gray-300 hover:bg-gray-600/50 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-primary-400" />
                  Time Range
                </label>
                <div className="inline-flex rounded-lg overflow-hidden border border-gray-600/50 bg-gray-700/50 p-0.5">
                  {(['all', '24h', '7d', '30d'] as const).map((range, index, array) => (
                    <button
                      key={range}
                      onClick={() => updateNftFilter('timeRange', range)}
                      className={`px-4 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                        index === 0 ? 'rounded-l-md' : ''
                      } ${
                        index === array.length - 1 ? 'rounded-r-md' : ''
                      } ${
                        nftFilters.timeRange === range
                          ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/40'
                          : 'bg-transparent text-gray-300 hover:bg-gray-600/50 hover:text-white'
                      }`}
                    >
                      {range === 'all' ? 'All Time' : range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <CurrencyDollarIcon className="w-4 h-4 text-primary-400" />
                  Price Range (TGR)
                </label>
                <PriceRangeSlider
                  min={priceMin}
                  max={priceMax}
                  minValue={priceRange.min}
                  maxValue={priceRange.max}
                  onMinChange={(val) => updateNftFilter('minPrice', val.toString())}
                  onMaxChange={(val) => updateNftFilter('maxPrice', val.toString())}
                />
              </div>

              {/* Sort/Order Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <FunnelIcon className="w-4 h-4 text-primary-400" />
                  Sort By
                </label>
                <SortByDropdown
                  value={nftFilters.sortBy}
                  options={[
                    { value: 'recentlyListed', label: 'Recently Listed' },
                    { value: 'price', label: 'Price: Low to High' },
                    { value: 'recentlySold', label: 'Recently Sold' },
                    { value: 'recentlyUpdated', label: 'Recently Updated' },
                    { value: 'mostOffers', label: 'Most Offers' },
                    { value: 'highestSale', label: 'Highest Sale Price' },
                    { value: 'oldest', label: 'Oldest First' },
                  ]}
                  onChange={(value) => updateNftFilter('sortBy', value as any)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Collections */}
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <MagnifyingGlassIcon className="w-4 h-4 text-primary-400" />
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search collections..."
                    value={collectionFilters.searchQuery || ''}
                    onChange={(e) => updateCollectionFilter('searchQuery', e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Time Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-primary-400" />
                  Time Range
                </label>
                <div className="inline-flex rounded-lg overflow-hidden border border-gray-600/50 bg-gray-700/50 p-0.5">
                  {(['all', '24h', '7d', '30d'] as const).map((range, index, array) => (
                    <button
                      key={range}
                      onClick={() => updateCollectionFilter('timeRange', range)}
                      className={`px-4 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                        index === 0 ? 'rounded-l-md' : ''
                      } ${
                        index === array.length - 1 ? 'rounded-r-md' : ''
                      } ${
                        collectionFilters.timeRange === range
                          ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/40'
                          : 'bg-transparent text-gray-300 hover:bg-gray-600/50 hover:text-white'
                      }`}
                    >
                      {range === 'all' ? 'All Time' : range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Collections */}
            <div className="space-y-4">
              {/* Floor Price Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <CurrencyDollarIcon className="w-4 h-4 text-primary-400" />
                  Floor Price Range (TGR)
                </label>
                <PriceRangeSlider
                  min={priceMin}
                  max={priceMax}
                  minValue={priceRange.min}
                  maxValue={priceRange.max}
                  onMinChange={(val) => updateCollectionFilter('minFloorPrice', val.toString())}
                  onMaxChange={(val) => updateCollectionFilter('maxFloorPrice', val.toString())}
                />
              </div>

              {/* Sort/Order Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <FunnelIcon className="w-4 h-4 text-primary-400" />
                  Sort By
                </label>
                <SortByDropdown
                  value={collectionFilters.sortBy}
                  options={[
                    { value: 'totalVolume', label: 'Total Volume' },
                    { value: 'volume24h', label: 'Volume (24h)' },
                    { value: 'volume7d', label: 'Volume (7d)' },
                    { value: 'volume30d', label: 'Volume (30d)' },
                    { value: 'floorPrice', label: 'Floor Price' },
                    { value: 'totalItems', label: 'Total Items' },
                    { value: 'totalSales', label: 'Total Sales' },
                    { value: 'sales24h', label: 'Sales (24h)' },
                    { value: 'sales7d', label: 'Sales (7d)' },
                    { value: 'sales30d', label: 'Sales (30d)' },
                    { value: 'uniqueOwners', label: 'Unique Owners' },
                    { value: 'recentlyCreated', label: 'Recently Created' },
                  ]}
                  onChange={(value) => updateCollectionFilter('sortBy', value as any)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
