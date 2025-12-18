'use client';

import Link from 'next/link';
import { useAuctions } from '@/hooks/useSubgraph';
import { formatEther, parseEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import { useMemo, useState } from 'react';
import { AuctionFilters, AuctionFilters as FiltersType } from './AuctionFilters';
import { useNFTDetails } from '@/hooks/useSubgraph';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { IPFSImage } from '@/components/common/IPFSImage';
import { Address } from 'viem';

export function AuctionsList() {
  const [filters, setFilters] = useState<FiltersType>({
    sortBy: 'endTime',
    sortDirection: 'asc',
    endingSoon: false,
  });

  const { data, loading, error } = useAuctions({
    where: { active: true },
    orderBy: filters.sortBy,
    orderDirection: filters.sortDirection,
    first: 100,
  });

  const filteredAuctions = useMemo(() => {
    let auctions = data?.auctions || [];

    // Apply collection filter
    if (filters.collection) {
      auctions = auctions.filter((a: any) =>
        a.collection.toLowerCase() === filters.collection?.toLowerCase()
      );
    }

    // Apply price filters
    if (filters.minPrice) {
      const minPrice = parseEther(filters.minPrice);
      auctions = auctions.filter((a: any) => {
        const currentBid = a.currentBid > 0n ? a.currentBid : a.startPrice;
        return currentBid >= minPrice;
      });
    }

    if (filters.maxPrice) {
      const maxPrice = parseEther(filters.maxPrice);
      auctions = auctions.filter((a: any) => {
        const currentBid = a.currentBid > 0n ? a.currentBid : a.startPrice;
        return currentBid <= maxPrice;
      });
    }

    // Apply ending soon filter (within 24 hours)
    if (filters.endingSoon) {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      auctions = auctions.filter((a: any) => {
        const endTime = Number(a.endTime) * 1000;
        return endTime - now <= oneDay && endTime > now;
      });
    }

    return auctions;
  }, [data, filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Error loading auctions: {error.message}</p>
      </div>
    );
  }

  const auctions = filteredAuctions;

  return (
    <>
      <AuctionFilters onFilterChange={setFilters} />
      
      {auctions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No auctions found matching your filters</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {auctions.length} auction{auctions.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction: any) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function AuctionCard({ auction }: { auction: any }) {
  const endTime = new Date(Number(auction.endTime) * 1000);
  const timeRemaining = formatDistanceToNow(endTime, { addSuffix: true });
  const currentBid = auction.currentBid > 0n ? auction.currentBid : auction.startPrice;
  const isEndingSoon = endTime.getTime() - Date.now() <= 24 * 60 * 60 * 1000;

  const { data: nftData } = useNFTDetails(auction.collection as Address, auction.tokenId);
  const item = nftData?.items?.[0];
  const { metadata, getImageUrl } = useIPFSMetadata(item?.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <Link
      href={`/auction/${auction.id}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {imageUrl && metadata?.image ? (
          <IPFSImage
            src={metadata.image}
            alt={metadata.name || `NFT #${auction.tokenId}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Token #{auction.tokenId.toString()}</p>
            </div>
          </div>
        )}
        {isEndingSoon && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
            Ending Soon
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Ends {timeRemaining}
        </p>
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Bid</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatEther(currentBid)} TGR
          </p>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Bids: {Number(auction.bidCount)}
          </span>
          <span className="text-primary-600 dark:text-primary-400 font-semibold group-hover:underline">
            View Auction →
          </span>
        </div>
      </div>
    </Link>
  );
}
