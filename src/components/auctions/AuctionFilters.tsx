'use client';

import { useState } from 'react';
import { useCollections } from '@/hooks/useSubgraph';

interface AuctionFiltersProps {
  onFilterChange: (filters: AuctionFilters) => void;
}

export interface AuctionFilters {
  sortBy: 'endTime' | 'currentBid' | 'bidCount' | 'startTime';
  sortDirection: 'asc' | 'desc';
  collection?: string;
  minPrice?: string;
  maxPrice?: string;
  endingSoon?: boolean;
}

export function AuctionFilters({ onFilterChange }: AuctionFiltersProps) {
  const [filters, setFilters] = useState<AuctionFilters>({
    sortBy: 'endTime',
    sortDirection: 'asc',
    endingSoon: false,
  });

  const { data: collectionsData } = useCollections({ first: 100, skipPolling: true });
  const collections = collectionsData?.collections || [];

  const handleFilterChange = (newFilters: Partial<AuctionFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
      <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Filter & Sort
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="endTime">Ending Soon</option>
            <option value="currentBid">Highest Bid</option>
            <option value="bidCount">Most Bids</option>
            <option value="startTime">Newest</option>
          </select>
        </div>

        {/* Sort Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Order
          </label>
          <select
            value={filters.sortDirection}
            onChange={(e) => handleFilterChange({ sortDirection: e.target.value as 'asc' | 'desc' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Collection Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Collection
          </label>
          <select
            value={filters.collection || ''}
            onChange={(e) => handleFilterChange({ collection: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Collections</option>
            {collections.map((collection: any) => (
              <option key={collection.id} value={collection.address}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ending Soon Filter */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.endingSoon || false}
              onChange={(e) => handleFilterChange({ endingSoon: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ending Soon
            </span>
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Price (TGR)
          </label>
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Price (TGR)
          </label>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
            placeholder="No limit"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

