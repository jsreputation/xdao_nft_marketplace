'use client';

import { memo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { NFTFilters, CollectionFilters } from './ExploreFilters';

interface FilterChipsProps {
  activeTab: 'collections' | 'nfts';
  nftFilters: NFTFilters;
  collectionFilters: CollectionFilters;
  onNftFiltersChange: (filters: NFTFilters) => void;
  onCollectionFiltersChange: (filters: CollectionFilters) => void;
}

function FilterChipsComponent({
  activeTab,
  nftFilters,
  collectionFilters,
  onNftFiltersChange,
  onCollectionFiltersChange,
}: FilterChipsProps) {
  const chips: Array<{ label: string; onRemove: () => void }> = [];

  if (activeTab === 'nfts') {
    // Collections
    nftFilters.collections.forEach((collectionId) => {
      chips.push({
        label: `Collection: ${collectionId.slice(0, 6)}...${collectionId.slice(-4)}`,
        onRemove: () => {
          onNftFiltersChange({
            ...nftFilters,
            collections: nftFilters.collections.filter((id) => id !== collectionId),
          });
        },
      });
    });

    // Status
    if (nftFilters.status !== 'all') {
      const statusLabels: Record<string, string> = {
        listed: 'Buy Now',
        auction: 'On Auction',
        new: 'Recently Added',
        hasOffers: 'Has Offers',
        sold: 'Sold',
        priceUpdated: 'Price Updated',
      };
      chips.push({
        label: `Status: ${statusLabels[nftFilters.status] || nftFilters.status}`,
        onRemove: () => {
          onNftFiltersChange({ ...nftFilters, status: 'all' });
        },
      });
    }

    // Price range
    if (nftFilters.minPrice || nftFilters.maxPrice) {
      const min = nftFilters.minPrice || '0';
      const max = nftFilters.maxPrice || '∞';
      chips.push({
        label: `Price: ${min} - ${max} TGR`,
        onRemove: () => {
          onNftFiltersChange({ ...nftFilters, minPrice: '', maxPrice: '' });
        },
      });
    }

    // Offer count
    if (nftFilters.minOfferCount !== undefined && nftFilters.minOfferCount > 0) {
      chips.push({
        label: `Min Offers: ${nftFilters.minOfferCount}`,
        onRemove: () => {
          onNftFiltersChange({ ...nftFilters, minOfferCount: undefined });
        },
      });
    }

    // Time range
    if (nftFilters.timeRange && nftFilters.timeRange !== 'all') {
      const timeLabels: Record<string, string> = {
        '24h': '24 Hours',
        '7d': '7 Days',
        '30d': '30 Days',
      };
      chips.push({
        label: `Time: ${timeLabels[nftFilters.timeRange] || nftFilters.timeRange}`,
        onRemove: () => {
          onNftFiltersChange({ ...nftFilters, timeRange: 'all' });
        },
      });
    }

    // Search
    if (nftFilters.searchQuery) {
      chips.push({
        label: `Search: ${nftFilters.searchQuery}`,
        onRemove: () => {
          onNftFiltersChange({ ...nftFilters, searchQuery: '' });
        },
      });
    }
  } else {
    // Floor price
    if (collectionFilters.minFloorPrice || collectionFilters.maxFloorPrice) {
      const min = collectionFilters.minFloorPrice || '0';
      const max = collectionFilters.maxFloorPrice || '∞';
      chips.push({
        label: `Floor: ${min} - ${max} TGR`,
        onRemove: () => {
          onCollectionFiltersChange({ ...collectionFilters, minFloorPrice: '', maxFloorPrice: '' });
        },
      });
    }

    // Volume 24h
    if (collectionFilters.minVolume24h) {
      chips.push({
        label: `Min Volume 24h: ${collectionFilters.minVolume24h} TGR`,
        onRemove: () => {
          onCollectionFiltersChange({ ...collectionFilters, minVolume24h: '' });
        },
      });
    }

    // Sales 24h
    if (collectionFilters.minSales24h) {
      chips.push({
        label: `Min Sales 24h: ${collectionFilters.minSales24h}`,
        onRemove: () => {
          onCollectionFiltersChange({ ...collectionFilters, minSales24h: '' });
        },
      });
    }

      // Unique owners
      if (collectionFilters.minUniqueOwners !== undefined && collectionFilters.minUniqueOwners > 0) {
        chips.push({
          label: `Min Owners: ${collectionFilters.minUniqueOwners}`,
          onRemove: () => {
            onCollectionFiltersChange({ ...collectionFilters, minUniqueOwners: undefined });
          },
        });
      }

      // Public
      if (collectionFilters.isPublic !== undefined) {
        chips.push({
          label: collectionFilters.isPublic ? 'Public Only' : 'Private Only',
          onRemove: () => {
            onCollectionFiltersChange({ ...collectionFilters, isPublic: undefined });
          },
        });
      }

    // Time range
    if (collectionFilters.timeRange && collectionFilters.timeRange !== 'all') {
      const timeLabels: Record<string, string> = {
        '24h': '24 Hours',
        '7d': '7 Days',
        '30d': '30 Days',
      };
      chips.push({
        label: `Time: ${timeLabels[collectionFilters.timeRange] || collectionFilters.timeRange}`,
        onRemove: () => {
          onCollectionFiltersChange({ ...collectionFilters, timeRange: 'all' });
        },
      });
    }

    // Search
    if (collectionFilters.searchQuery) {
      chips.push({
        label: `Search: ${collectionFilters.searchQuery}`,
        onRemove: () => {
          onCollectionFiltersChange({ ...collectionFilters, searchQuery: '' });
        },
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 rounded-lg text-sm text-white"
        >
          <span>{chip.label}</span>
          <button
            onClick={chip.onRemove}
            className="hover:bg-primary-500/30 rounded p-0.5 transition-colors"
            aria-label="Remove filter"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export const FilterChips = memo(FilterChipsComponent);

