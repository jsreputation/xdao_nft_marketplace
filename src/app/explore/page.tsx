'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FilterChips } from '@/components/explore/FilterChips';
import { NFTCard } from '@/components/explore/NFTCard';
import { ViewToggle } from '@/components/explore/ViewToggle';
import { useNFTs, useCollections, useAuctions } from '@/hooks/useSubgraph';
import { parseEther, formatEther } from 'viem';
import Link from 'next/link';
import { IPFSImage } from '@/components/common/IPFSImage';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { useSearchParams, useRouter } from 'next/navigation';
import { EmptySearchIllustration } from '@/components/common/CartoonIllustrations';
import { NFTFilters, CollectionFilters } from '@/components/explore/ExploreFilters';

// Lazy load heavy filter component
const ExploreFilters = dynamic(() => import('@/components/explore/ExploreFilters').then(mod => ({ default: mod.ExploreFilters })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-800 rounded-lg" />,
});

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab from URL, default to 'nfts'
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'collections' ? 'collections' : 'nfts';
  };
  
  const [activeTab, setActiveTab] = useState<'collections' | 'nfts'>(getInitialTab());
  const [nftFilters, setNftFilters] = useState<NFTFilters>({
    collections: [],
    minPrice: '',
    maxPrice: '',
    status: 'all',
    sortBy: 'recentlyListed',
    sortDirection: 'desc',
    searchQuery: '',
    sold: undefined,
    minOfferCount: undefined,
    timeRange: 'all',
    priceUpdated: undefined,
  });
  const [collectionFilters, setCollectionFilters] = useState<CollectionFilters>({
    minFloorPrice: '',
    maxFloorPrice: '',
    sortBy: 'totalVolume',
    sortDirection: 'desc',
    searchQuery: '',
    timeRange: 'all',
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const itemsPerPage = 24;
  const isInternalUpdate = useRef(false);

  // Sync activeTab with URL parameter when URL changes (from external navigation)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    
    const tabParam = searchParams.get('tab');
    const newTab = tabParam === 'collections' ? 'collections' : 'nfts';
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [searchParams]);

  // Update URL when activeTab changes (from user interaction)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam !== activeTab) {
      isInternalUpdate.current = true;
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', activeTab);
      router.replace(`/explore?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, router, searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [nftFilters, collectionFilters, activeTab]);

  // Calculate time range timestamps
  const getTimeRangeTimestamp = (timeRange?: string): string | undefined => {
    if (!timeRange || timeRange === 'all') return undefined;
    const now = Math.floor(Date.now() / 1000);
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 0;
    return (now - hours * 3600).toString();
  };

  // Fetch active auctions for auction status filtering
  const { data: auctionsData } = useAuctions({
    where: { active: true },
    first: 1000,
    skipPolling: true,
  });
  const activeAuctions = useMemo(() => {
    const auctions = auctionsData?.auctions || [];
    const auctionMap = new Map<string, boolean>();
    auctions.forEach((auction: any) => {
      const key = `${auction.collection?.toLowerCase()}:${auction.tokenId}`;
      auctionMap.set(key, true);
    });
    return auctionMap;
  }, [auctionsData]);

  // Build where clause for NFT GraphQL query
  const nftWhere: any = {};
  
  if (nftFilters.collections.length > 0) {
    // Ensure collection addresses are lowercase for GraphQL query
    nftWhere.collection_in = nftFilters.collections.map((addr: string) => addr.toLowerCase());
  }

  // Search query - filter by tokenId (can be enhanced to search metadata)
  if (nftFilters.searchQuery && nftFilters.searchQuery.trim() !== '') {
    const searchTerm = nftFilters.searchQuery.trim();
    // If search term is a number, search by tokenId
    if (!isNaN(Number(searchTerm))) {
      nftWhere.tokenId = searchTerm;
    }
    // Otherwise, we'd need to search metadata (can be enhanced later)
  }
  
  // Status filters
  if (nftFilters.status === 'listed') {
    nftWhere.bValid = true;
  } else if (nftFilters.status === 'sold') {
    nftWhere.sold = true;
  } else if (nftFilters.status === 'hasOffers') {
    nftWhere.offerCount_gte = '1';
  } else if (nftFilters.status === 'priceUpdated') {
    nftWhere.priceUpdated = true;
  }
  // 'all' and 'auction' and 'new' are handled separately below

  // Time range filter
  const nftTimeRange = getTimeRangeTimestamp(nftFilters.timeRange);
  if (nftTimeRange) {
    if (nftFilters.status === 'new') {
      // Recently added items
      nftWhere.timestamp_gte = nftTimeRange;
    } else if (nftFilters.status === 'priceUpdated') {
      // Price updated within time range
      nftWhere.lastPriceUpdate_gte = nftTimeRange;
    } else if (nftFilters.status === 'sold') {
      // Sold within time range
      nftWhere.saleTimestamp_gte = nftTimeRange;
    } else {
      // General time range for listings
      nftWhere.timestamp_gte = nftTimeRange;
    }
  }

  // Offer count filter
  if (nftFilters.minOfferCount !== undefined && nftFilters.minOfferCount > 0) {
    nftWhere.offerCount_gte = nftFilters.minOfferCount.toString();
  }

  // Price filters
  if (nftFilters.minPrice && nftFilters.minPrice.trim() !== '') {
    try {
      nftWhere.price_gte = parseEther(nftFilters.minPrice).toString();
    } catch (e) {
      console.error('Invalid min price:', e);
    }
  }
  
  if (nftFilters.maxPrice && nftFilters.maxPrice.trim() !== '') {
    try {
      nftWhere.price_lte = parseEther(nftFilters.maxPrice).toString();
    } catch (e) {
      console.error('Invalid max price:', e);
    }
  }

  // Determine NFT sort order
  let nftOrderBy = 'price';
  if (nftFilters.sortBy === 'recentlyListed') {
    nftOrderBy = 'timestamp';
  } else if (nftFilters.sortBy === 'recentlySold') {
    nftOrderBy = 'saleTimestamp';
  } else if (nftFilters.sortBy === 'recentlyUpdated') {
    nftOrderBy = 'lastPriceUpdate';
  } else if (nftFilters.sortBy === 'mostOffers') {
    nftOrderBy = 'offerCount';
  } else if (nftFilters.sortBy === 'highestSale') {
    nftOrderBy = 'salePrice';
  } else if (nftFilters.sortBy === 'oldest') {
    nftOrderBy = 'timestamp';
  }
  
  // Determine sort direction based on sort type
  // 'oldest' = ascending (oldest first)
  // 'recentlyListed', 'recentlySold', 'recentlyUpdated', 'mostOffers', 'highestSale' = descending (newest/highest first)
  // 'price' = use user's selected direction
  let nftOrderDirection = nftFilters.sortDirection;
  if (nftFilters.sortBy === 'oldest') {
    nftOrderDirection = 'asc';
  } else if (nftFilters.sortBy === 'recentlyListed' || nftFilters.sortBy === 'recentlySold' || nftFilters.sortBy === 'recentlyUpdated' || nftFilters.sortBy === 'mostOffers' || nftFilters.sortBy === 'highestSale') {
    nftOrderDirection = 'desc';
  }

  // Build where clause for Collection GraphQL query
  const collectionWhere: any = {
    removed: false, // Always exclude removed collections
  };

  // Search query - filter by collection name
  if (collectionFilters.searchQuery && collectionFilters.searchQuery.trim() !== '') {
    const searchTerm = collectionFilters.searchQuery.trim().toLowerCase();
    collectionWhere.name_contains_nocase = searchTerm;
  }

  // Public/Private filter
  if (collectionFilters.isPublic !== undefined) {
    collectionWhere.isPublic = collectionFilters.isPublic;
  }

  // Floor price filters
  if (collectionFilters.minFloorPrice && collectionFilters.minFloorPrice.trim() !== '') {
    try {
      collectionWhere.floorPrice_gte = parseEther(collectionFilters.minFloorPrice).toString();
    } catch (e) {
      console.error('Invalid min floor price:', e);
    }
  }
  
  if (collectionFilters.maxFloorPrice && collectionFilters.maxFloorPrice.trim() !== '') {
    try {
      collectionWhere.floorPrice_lte = parseEther(collectionFilters.maxFloorPrice).toString();
    } catch (e) {
      console.error('Invalid max floor price:', e);
    }
  }

  // Time range for creation date
  const collectionTimeRange = getTimeRangeTimestamp(collectionFilters.timeRange);
  if (collectionTimeRange) {
    collectionWhere.timestamp_gte = collectionTimeRange;
  }


  // Fetch NFTs - only pass where if it has properties
  const nftQueryVariables: any = {
    orderBy: nftOrderBy,
    orderDirection: nftOrderDirection,
    first: itemsPerPage,
    skip: page * itemsPerPage,
  };
  if (Object.keys(nftWhere).length > 0) {
    nftQueryVariables.where = nftWhere;
  }

  const { data: nftData, loading: nftLoading, error: nftError } = useNFTs(nftQueryVariables);

  // Determine collection sort order - map filter values to GraphQL field names
  let collectionOrderBy = 'totalVolume';
  const sortByMap: Record<string, string> = {
    totalVolume: 'totalVolume',
    volume24h: 'volume24h',
    volume7d: 'volume7d',
    volume30d: 'volume30d',
    floorPrice: 'floorPrice',
    totalItems: 'totalItems',
    totalSales: 'totalSales',
    sales24h: 'sales24h',
    sales7d: 'sales7d',
    sales30d: 'sales30d',
    uniqueOwners: 'uniqueOwners',
    recentlyCreated: 'timestamp',
  };
  collectionOrderBy = sortByMap[collectionFilters.sortBy] || 'totalVolume';

  // Fetch Collections - only pass where if it has properties
  const collectionQueryVariables: any = {
    first: itemsPerPage,
    skip: page * itemsPerPage,
    orderBy: collectionOrderBy,
    orderDirection: collectionFilters.sortDirection,
  };
  if (Object.keys(collectionWhere).length > 0) {
    collectionQueryVariables.where = collectionWhere;
  }

  const { data: collectionsData, loading: collectionsLoading, error: collectionsError } = useCollections(collectionQueryVariables);

  // Apply client-side filtering for search (if needed)
  let nfts = nftData?.pairs || [];
  let collections = collectionsData?.collections || [];

  // Additional client-side filtering for NFT search (by tokenId if not already filtered)
  if (activeTab === 'nfts' && nftFilters.searchQuery && nftFilters.searchQuery.trim() !== '') {
    const searchTerm = nftFilters.searchQuery.trim().toLowerCase();
    // If it's not a number, we can't filter by GraphQL, so filter client-side by tokenId string match
    if (isNaN(Number(searchTerm))) {
      nfts = nfts.filter((pair: any) => 
        pair.tokenId?.toString().toLowerCase().includes(searchTerm)
      );
    }
  }

  // Filter auctions client-side (merge with pairs)
  // Note: This is done client-side because auction status requires checking active auctions
  if (activeTab === 'nfts' && nftFilters.status === 'auction') {
    nfts = nfts.filter((pair: any) => {
      const key = `${pair.collection?.toLowerCase()}:${pair.tokenId}`;
      return activeAuctions.has(key);
    });
  }

  // Additional client-side filtering for sold items with time range
  if (activeTab === 'nfts' && nftFilters.status === 'sold' && nftTimeRange) {
    nfts = nfts.filter((pair: any) => {
      if (!pair.saleTimestamp) return false;
      return parseInt(pair.saleTimestamp) >= parseInt(nftTimeRange);
    });
  }

  const loading = activeTab === 'nfts' ? nftLoading : collectionsLoading;
  const error = activeTab === 'nfts' ? nftError : collectionsError;

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Explore</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Discover collections and unique digital assets</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('collections');
                setPage(0);
              }}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'collections'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => {
                setActiveTab('nfts');
                setPage(0);
              }}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'nfts'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              NFTs
            </button>
          </div>
        </div>

        {/* Filters - Top Section */}
        <div className="mb-6">
          <ExploreFilters
            activeTab={activeTab}
            nftFilters={nftFilters}
            collectionFilters={collectionFilters}
            onNftFiltersChange={setNftFilters}
            onCollectionFiltersChange={setCollectionFilters}
          />
        </div>

        {/* Filter Chips */}
        <FilterChips
          activeTab={activeTab}
          nftFilters={nftFilters}
          collectionFilters={collectionFilters}
          onNftFiltersChange={setNftFilters}
          onCollectionFiltersChange={setCollectionFilters}
        />

        {/* Main Content */}
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {loading
                  ? 'Loading...'
                  : activeTab === 'collections'
                  ? `${collections.length} Collections found`
                  : `${nfts.length} NFTs found`}
              </p>
              {activeTab === 'nfts' && <ViewToggle view={view} onViewChange={setView} />}
            </div>

            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl aspect-square" />
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">
                  Error loading {activeTab === 'collections' ? 'collections' : 'NFTs'}: {error.message}
                </p>
              </div>
            )}

            {!loading && !error && activeTab === 'collections' && collections.length === 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-64 h-64 flex items-center justify-center">
                    <EmptySearchIllustration />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">No Collections Found</h3>
                    <p className="text-gray-400 max-w-md">
                      We couldn't find any collections matching your filters. Try adjusting your search criteria or clearing some filters.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && activeTab === 'nfts' && nfts.length === 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-64 h-64 flex items-center justify-center">
                    <EmptySearchIllustration />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">No NFTs Found</h3>
                    <p className="text-gray-400 max-w-md">
                      We couldn't find any NFTs matching your filters. Try adjusting your search criteria or clearing some filters.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Collections View */}
            {!loading && !error && activeTab === 'collections' && collections.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {collections.map((collection: any) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-gray-800 border border-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300 transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400">Page {page + 1}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={collections.length < itemsPerPage}
                    className="px-4 py-2 bg-gray-800 border border-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300 transition-all"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* NFTs View */}
            {!loading && !error && activeTab === 'nfts' && nfts.length > 0 && (
              <>
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
                      : 'space-y-4'
                  }
                >
                  {nfts.map((pair: any) => (
                    <NFTCard key={pair.id} pair={pair} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-gray-800 border border-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300 transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400">Page {page + 1}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={nfts.length < itemsPerPage}
                    className="px-4 py-2 bg-gray-800 border border-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300 transition-all"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

// Collection Card Component
function CollectionCard({ collection }: { collection: any }) {
  const { metadata, getImageUrl } = useIPFSMetadata(collection.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <Link
      href={`/collection/${collection.address}`}
      className="group bg-gray-800 border border-gray-700/50 rounded-xl shadow-md overflow-hidden card-hover"
    >
      <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
        {imageUrl && metadata?.image && (
          <IPFSImage
            src={metadata.image}
            alt={metadata.name || collection.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        {collection.verified && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-primary-400 transition-colors truncate">
          {metadata?.name || collection.name}
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Items</span>
            <span className="font-semibold text-gray-200">{collection.totalItems || 0}</span>
          </div>
          {collection.floorPrice && (
            <div className="flex justify-between">
              <span className="text-gray-400">Floor</span>
              <span className="font-semibold text-primary-400">
                {formatEther(collection.floorPrice)} TGR
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

