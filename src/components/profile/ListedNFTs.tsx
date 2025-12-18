'use client';

import Link from 'next/link';
import { useUserListings } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { useMemo, useState } from 'react';
import { IPFSImage } from '@/components/common/IPFSImage';
import { useNFTDetails } from '@/hooks/useSubgraph';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { Pagination } from '@/components/common/Pagination';

interface ListedNFTsProps {
  owner: Address;
}

const PAGE_SIZE = 12;

export function ListedNFTs({ owner }: ListedNFTsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const { data, loading, error } = useUserListings(owner, 1000);

  // Deduplicate listings by collection+tokenId and ensure owner matches
  const uniqueListings = useMemo(() => {
    const allListings = data?.pairs || [];
    const seen = new Set<string>();
    const unique: any[] = [];

    allListings.forEach((pair: any) => {
      // Only include active listings
      if (pair.bValid !== true) {
        return;
      }

      // Ensure owner matches (safety check)
      if (pair.owner?.toLowerCase() !== owner.toLowerCase()) {
        return;
      }

      // Create unique key
      const key = `${pair.collection?.toLowerCase()}:${pair.tokenId}`;
      
      // Skip if already seen (duplicate)
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      unique.push(pair);
    });

    // Sort by timestamp (newest first)
    return unique.sort((a, b) => {
      const timeA = Number(a.timestamp || 0);
      const timeB = Number(b.timestamp || 0);
      return timeB - timeA;
    });
  }, [data, owner]);

  // Paginate the results
  const paginatedListings = useMemo(() => {
    const start = skip;
    const end = start + PAGE_SIZE;
    return uniqueListings.slice(start, end);
  }, [uniqueListings, skip]);

  const totalPages = Math.ceil(uniqueListings.length / PAGE_SIZE);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl aspect-square" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">Error loading listings: {error.message}</p>
      </div>
    );
  }

  if (uniqueListings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No active listings</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">List your NFTs to start selling</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
        {paginatedListings.map((pair: any) => {
          const uniqueKey = `${pair.collection?.toLowerCase()}:${pair.tokenId}`;
          return (
            <ListedNFTCard key={uniqueKey} pair={pair} />
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

function ListedNFTCard({ pair }: { pair: any }) {
  const { data: itemData } = useNFTDetails(pair.collection, pair.tokenId, true);
  const item = itemData?.items?.[0];
  const { metadata, getImageUrl } = useIPFSMetadata(item?.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <Link
      href={`/nft/${pair.collection}/${pair.tokenId}`}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-in"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-purple-500/0 to-secondary-500/0 group-hover:from-primary-500/20 group-hover:via-purple-500/20 group-hover:to-secondary-500/20 transition-all duration-500 rounded-2xl -z-10 blur-xl"></div>
      
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 overflow-hidden">
        {imageUrl && metadata?.image ? (
          <>
            <IPFSImage
              src={metadata.image}
              alt={metadata.name || `NFT #${pair.tokenId}`}
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
              <p className="text-xs sm:text-sm">Token #{pair.tokenId}</p>
            </div>
          </div>
        )}
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Price badge on hover */}
        <div className="absolute top-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <p className="text-primary-600 dark:text-primary-400 font-bold text-sm">
              {formatEther(pair.price)} TGR
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-3 relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-purple-50/0 group-hover:from-primary-50/50 group-hover:to-purple-50/50 dark:group-hover:from-primary-900/20 dark:group-hover:to-purple-900/20 transition-all duration-500 rounded-b-2xl"></div>
        
        <div className="relative z-10">
          <p className="font-bold text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate mb-1.5">
            {metadata?.name || `NFT #${pair.tokenId.toString()}`}
          </p>
          <div className="flex justify-between items-center">
            <div className="transform group-hover:scale-105 transition-transform duration-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-medium">Price</p>
              <p className="text-primary-600 dark:text-primary-400 font-bold text-base bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                {formatEther(pair.price)} TGR
              </p>
            </div>
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              Listed
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
