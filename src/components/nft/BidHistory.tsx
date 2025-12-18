'use client';

import { useNFTBids, useAuctions } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useMemo, forwardRef, useImperativeHandle } from 'react';

interface BidHistoryProps {
  collection: Address;
  tokenId: bigint;
}

export interface BidHistoryRef {
  refetch: () => void;
}

export const BidHistory = forwardRef<BidHistoryRef, BidHistoryProps>(
  function BidHistory({ collection, tokenId }, ref) {
    const { data: bidsData, loading: bidsLoading, error: bidsError, refetch: refetchBids } = useNFTBids(collection, tokenId, true);
    
    // Expose refetch function to parent via ref
    useImperativeHandle(ref, () => ({
      refetch: () => {
        refetchBids();
      },
    }), [refetchBids]);
  const { data: auctionsData } = useAuctions({
    where: {
      collection: collection.toLowerCase(),
      tokenId: tokenId.toString(),
    },
    first: 10,
    skipPolling: true,
  });

  // Get active auction for this NFT
  const activeAuction = useMemo(() => {
    return auctionsData?.auctions?.find((auction: any) => auction.active === true);
  }, [auctionsData]);

  // Get all bids and sort by timestamp
  const bids = useMemo(() => {
    const allBids = bidsData?.bids || [];
    return allBids.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));
  }, [bidsData]);

  // Get highest bid
  const highestBid = useMemo(() => {
    if (bids.length === 0) return null;
    return bids.reduce((max: any, bid: any) => 
      Number(bid.bidPrice) > Number(max.bidPrice) ? bid : max
    );
  }, [bids]);

  if (bidsLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Bid History
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (bidsError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Bid History
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading bids: {bidsError.message}</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Bid History
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No bids yet</p>
        {activeAuction && (
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
            This NFT is currently in an active auction
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Bid History
        </h3>
        {activeAuction && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Current Highest</p>
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {activeAuction.currentBid ? formatEther(activeAuction.currentBid) : '—'} TGR
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Bids</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {bids.length}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {bids.map((bid: any, index: number) => {
          const timeAgo = formatDistanceToNow(new Date(Number(bid.timestamp) * 1000), {
            addSuffix: true,
          });
          const isHighest = highestBid && bid.id === highestBid.id;
          const isCurrentHighest = activeAuction && activeAuction.currentBidder?.toLowerCase() === bid.from?.toLowerCase();

          return (
            <div
              key={bid.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                isHighest || isCurrentHighest
                  ? 'border-primary-500 dark:border-primary-400 bg-gradient-to-r from-primary-50/50 to-purple-50/50 dark:from-primary-900/20 dark:to-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              {/* Bid number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 flex items-center justify-center font-bold text-sm text-primary-600 dark:text-primary-400">
                #{bids.length - index}
              </div>

              {/* Bid details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {formatEther(bid.bidPrice)} TGR
                  </p>
                  {isHighest && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full font-semibold">
                      Highest
                    </span>
                  )}
                  {isCurrentHighest && activeAuction?.active && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-semibold">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-mono">{bid.from?.slice(0, 6)}...{bid.from?.slice(-4)}</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                </div>
              </div>

              {/* Explorer link */}
              <div className="flex-shrink-0">
                <Link
                  href={`https://snowtrace.io/tx/${bid.txhash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  title="View on Explorer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  }
);

