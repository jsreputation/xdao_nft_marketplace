'use client';

import { formatEther } from 'viem';
import { useUserOwnedNFTs, useUserListings, useAuctions, useUserCollections } from '@/hooks/useSubgraph';
import { Address } from 'viem';
import { useMemo } from 'react';
import { MARKET_ADDRESS } from '@/lib/contracts';

interface ProfileStatsProps {
  user: {
    totalVolume: bigint;
    totalSales: bigint;
    totalPurchases: bigint;
    totalListings: bigint;
    totalCollections: bigint;
  };
  owner: Address;
}

export function ProfileStats({ user, owner }: ProfileStatsProps) {
  // Fetch actual data to calculate accurate statistics
  const { data: ownedData } = useUserOwnedNFTs(owner, 1000);
  const { data: listingsData } = useUserListings(owner, 1000);
  const { data: auctionsData } = useAuctions({
    where: { active: true },
    first: 1000,
    skipPolling: true,
  });
  const { data: collectionsData } = useUserCollections(owner, 100, 0, true);

  // Calculate actual counts from data
  const actualStats = useMemo(() => {
    const allItems = ownedData?.items || [];
    const allListings = listingsData?.pairs || [];
    const allAuctions = auctionsData?.auctions || [];
    const allCollections = collectionsData?.collections || [];

    // Create sets for quick lookup
    const listedKeys = new Set<string>();
    allListings.forEach((pair: any) => {
      if (pair.bValid === true) {
        const key = `${pair.collection?.toLowerCase()}:${pair.tokenId}`;
        listedKeys.add(key);
      }
    });

    const auctionKeys = new Set<string>();
    allAuctions.forEach((auction: any) => {
      if (auction.active === true) {
        const key = `${auction.collection?.toLowerCase()}:${auction.tokenId}`;
        auctionKeys.add(key);
      }
    });

    // Deduplicate and count owned NFTs (matching OwnedNFTs component logic)
    const seen = new Set<string>();
    let uniqueOwnedCount = 0;

    allItems.forEach((item: any) => {
      const key = `${item.collection?.toLowerCase()}:${item.tokenId}`;
      
      // Skip duplicates
      if (seen.has(key)) {
        return;
      }

      // Skip if listed
      if (listedKeys.has(key)) {
        return;
      }

      // Skip if in active auction
      if (auctionKeys.has(key)) {
        return;
      }

      // Skip if owned by market address
      if (item.owner?.toLowerCase() === MARKET_ADDRESS.toLowerCase()) {
        return;
      }

      // Only include if actually owned by the user
      if (item.owner?.toLowerCase() !== owner.toLowerCase()) {
        return;
      }

      seen.add(key);
      uniqueOwnedCount++;
    });

    // Count active listings (deduplicated)
    const seenListings = new Set<string>();
    let activeListingsCount = 0;
    allListings.forEach((pair: any) => {
      if (pair.bValid === true && pair.owner?.toLowerCase() === owner.toLowerCase()) {
        const key = `${pair.collection?.toLowerCase()}:${pair.tokenId}`;
        if (!seenListings.has(key)) {
          seenListings.add(key);
          activeListingsCount++;
        }
      }
    });

    // Count collections CREATED by the user (matching UserCollections component logic)
    const seenCollections = new Set<string>();
    let uniqueCollectionsCount = 0;
    allCollections.forEach((collection: any) => {
      // Skip if removed
      if (collection.removed === true) {
        return;
      }

      // Ensure owner matches
      if (collection.owner?.toLowerCase() !== owner.toLowerCase()) {
        return;
      }

      // Create unique key from address
      const key = collection.address?.toLowerCase() || collection.id?.toLowerCase();
      
      // Skip if already seen (duplicate)
      if (seenCollections.has(key)) {
        return;
      }

      seenCollections.add(key);
      uniqueCollectionsCount++;
    });

    return {
      ownedNFTs: uniqueOwnedCount,
      listings: activeListingsCount,
      collections: uniqueCollectionsCount,
    };
  }, [ownedData, listingsData, auctionsData, collectionsData, owner]);

  const stats = [
    {
      label: 'Total Volume',
      value: user.totalVolume ? `${formatEther(user.totalVolume)} TGR` : '0 TGR',
      icon: '💰',
    },
    {
      label: 'Owned NFTs',
      value: actualStats.ownedNFTs.toString(),
      icon: '🎨',
    },
    {
      label: 'Active Listings',
      value: actualStats.listings.toString(),
      icon: '📋',
    },
    {
      label: 'Sales',
      value: user.totalSales ? user.totalSales.toString() : '0',
      icon: '💸',
    },
    {
      label: 'Purchases',
      value: user.totalPurchases ? user.totalPurchases.toString() : '0',
      icon: '🛒',
    },
    {
      label: 'Collections',
      value: actualStats.collections.toString(),
      icon: '📚',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-6 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Statistics
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">{stat.icon}</div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
