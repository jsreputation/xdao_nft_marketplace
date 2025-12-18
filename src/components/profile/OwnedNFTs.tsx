'use client';

import Link from 'next/link';
import { useUserOwnedNFTs, useUserListings, useAuctions } from '@/hooks/useSubgraph';
import { Address } from 'viem';
import { IPFSImage } from '@/components/common/IPFSImage';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { useMemo, useState } from 'react';
import { MARKET_ADDRESS } from '@/lib/contracts';
import { Pagination } from '@/components/common/Pagination';

interface OwnedNFTsProps {
  owner: Address;
}

const PAGE_SIZE = 12;

export function OwnedNFTs({ owner }: OwnedNFTsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const { data: ownedData, loading: ownedLoading, error: ownedError } = useUserOwnedNFTs(owner, 1000);
  const { data: listingsData } = useUserListings(owner, 1000);
  
  // Get all active auctions to exclude NFTs in auctions
  const { data: auctionsData } = useAuctions({
    where: {
      active: true,
    },
    first: 1000,
    skipPolling: true,
  });

  // Get all items, listings, and auctions
  const allItems = ownedData?.items || [];
  const allListings = listingsData?.pairs || [];
  const allAuctions = auctionsData?.auctions || [];

  // Create sets for quick lookup
  const listedKeys = useMemo(() => {
    const set = new Set<string>();
    allListings.forEach((pair: any) => {
      if (pair.bValid === true) {
        const key = `${pair.collection?.toLowerCase()}:${pair.tokenId}`;
        set.add(key);
      }
    });
    return set;
  }, [allListings]);

  const auctionKeys = useMemo(() => {
    const set = new Set<string>();
    allAuctions.forEach((auction: any) => {
      if (auction.active === true) {
        const key = `${auction.collection?.toLowerCase()}:${auction.tokenId}`;
        set.add(key);
      }
    });
    return set;
  }, [allAuctions]);

  // Deduplicate and filter owned NFTs
  const uniqueOwnedNFTs = useMemo(() => {
    const seen = new Set<string>();
    const unique: any[] = [];

    allItems.forEach((item: any) => {
      // Create unique key from collection and tokenId
      const key = `${item.collection?.toLowerCase()}:${item.tokenId}`;
      
      // Skip if already seen (duplicate)
      if (seen.has(key)) {
        return;
      }

      // Skip if currently listed
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
      unique.push(item);
    });

    // Sort by timestamp (newest first)
    return unique.sort((a, b) => {
      const timeA = Number(a.timestamp || 0);
      const timeB = Number(b.timestamp || 0);
      return timeB - timeA;
    });
  }, [allItems, listedKeys, auctionKeys, owner]);

  // Paginate the results
  const paginatedNFTs = useMemo(() => {
    const start = skip;
    const end = start + PAGE_SIZE;
    return uniqueOwnedNFTs.slice(start, end);
  }, [uniqueOwnedNFTs, skip]);

  const totalPages = Math.ceil(uniqueOwnedNFTs.length / PAGE_SIZE);

  if (ownedLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl aspect-square" />
        ))}
      </div>
    );
  }

  if (ownedError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">Error loading NFTs: {ownedError.message}</p>
      </div>
    );
  }

  if (uniqueOwnedNFTs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No NFTs owned</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">NFTs that are currently listed or in auctions are shown in their respective tabs</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
        {paginatedNFTs.map((item: any) => {
          const uniqueKey = `${item.collection?.toLowerCase()}:${item.tokenId}`;
          return (
            <OwnedNFTCard key={uniqueKey} item={item} />
          );
        })}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}

function OwnedNFTCard({ item }: { item: any }) {
  const { metadata, getImageUrl } = useIPFSMetadata(item.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <Link
      href={`/nft/${item.collection}/${item.tokenId}`}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-in"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-purple-500/0 to-secondary-500/0 group-hover:from-primary-500/20 group-hover:via-purple-500/20 group-hover:to-secondary-500/20 transition-all duration-500 rounded-2xl -z-10 blur-xl"></div>
      
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 overflow-hidden">
        {imageUrl && metadata?.image ? (
          <>
            <IPFSImage
              src={metadata.image}
              alt={metadata.name || `NFT #${item.tokenId}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Shimmer overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center p-4 animate-pulse-slow">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs sm:text-sm">NFT #{item.tokenId}</p>
            </div>
          </div>
        )}
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <div className="p-3 relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-purple-50/0 group-hover:from-primary-50/50 group-hover:to-purple-50/50 dark:group-hover:from-primary-900/20 dark:group-hover:to-purple-900/20 transition-all duration-500 rounded-b-2xl"></div>
        
        <div className="relative z-10">
          <p className="font-bold text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate">
            {metadata?.name || `NFT #${item.tokenId.toString()}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Token #{item.tokenId.toString()}</p>
        </div>
      </div>
    </Link>
  );
}
