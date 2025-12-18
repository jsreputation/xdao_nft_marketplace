'use client';

import { useNFTBids, useAuctions } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface BidHistoryProps {
  collection: Address;
  tokenId: bigint;
}

export interface BidHistoryRef {
  refetch: () => void;
}

type SortField = 'amount' | 'bidder' | 'timestamp' | 'number';
type SortOrder = 'asc' | 'desc';

export const BidHistory = forwardRef<BidHistoryRef, BidHistoryProps>(
  function BidHistory({ collection, tokenId }, ref) {
    const { data: bidsData, loading: bidsLoading, error: bidsError, refetch: refetchBids } = useNFTBids(collection, tokenId, true);
    
    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    
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

    // Get all bids
    const allBids = useMemo(() => {
      return bidsData?.bids || [];
    }, [bidsData]);

    // Get highest bid
    const highestBid = useMemo(() => {
      if (allBids.length === 0) return null;
      return allBids.reduce((max: any, bid: any) => 
        Number(bid.bidPrice) > Number(max.bidPrice) ? bid : max
      );
    }, [allBids]);

    // Sort bids
    const sortedBids = useMemo(() => {
      if (!allBids.length) return [];
      
      return [...allBids].sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case 'amount':
            aValue = BigInt(a.bidPrice);
            bValue = BigInt(b.bidPrice);
            break;
          case 'bidder':
            aValue = a.from?.toLowerCase() || '';
            bValue = b.from?.toLowerCase() || '';
            break;
          case 'timestamp':
            aValue = Number(a.timestamp);
            bValue = Number(b.timestamp);
            break;
          case 'number':
            // Sort by reverse index (newest first by default)
            const aIndex = allBids.findIndex((bid: any) => bid.id === a.id);
            const bIndex = allBids.findIndex((bid: any) => bid.id === b.id);
            aValue = allBids.length - aIndex;
            bValue = allBids.length - bIndex;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }, [allBids, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
      if (sortField === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
      if (sortField !== field) {
        return (
          <div className="inline-flex flex-col ml-1 opacity-30">
            <ChevronUpIcon className="w-3 h-3 -mb-1" />
            <ChevronDownIcon className="w-3 h-3" />
          </div>
        );
      }
      return sortOrder === 'asc' ? (
        <ChevronUpIcon className="w-4 h-4 ml-1 text-primary-400" />
      ) : (
        <ChevronDownIcon className="w-4 h-4 ml-1 text-primary-400" />
      );
    };

    if (bidsLoading) {
      return (
        <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Bid History
          </h3>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700/50 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      );
    }

    if (bidsError) {
      return (
        <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Bid History
          </h3>
          <p className="text-red-400 text-sm">Error loading bids: {bidsError.message}</p>
        </div>
      );
    }

    if (allBids.length === 0) {
      return (
        <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Bid History
          </h3>
          <p className="text-gray-400 text-sm">No bids yet</p>
          {activeAuction && (
            <p className="text-gray-500 text-xs mt-2">
              This NFT is currently in an active auction
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Bid History ({allBids.length})
          </h3>
          {activeAuction && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Current Highest</p>
                <p className="text-lg font-bold text-primary-400">
                  {activeAuction.currentBid ? formatEther(activeAuction.currentBid) : '—'} TGR
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Bids</p>
                <p className="text-lg font-bold text-white">
                  {allBids.length}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-700/30">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('number')}
                      className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      #
                      <SortIcon field="number" />
                    </button>
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      Amount
                      <SortIcon field="amount" />
                    </button>
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('bidder')}
                      className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      Bidder
                      <SortIcon field="bidder" />
                    </button>
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      Time
                      <SortIcon field="timestamp" />
                    </button>
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left">
                    <span className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</span>
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-right">
                    <span className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {sortedBids.map((bid: any, index: number) => {
                  const timeAgo = formatDistanceToNow(new Date(Number(bid.timestamp) * 1000), {
                    addSuffix: true,
                  });
                  const isHighest = highestBid && bid.id === highestBid.id;
                  const isCurrentHighest = activeAuction && activeAuction.currentBidder?.toLowerCase() === bid.from?.toLowerCase();
                  const bidNumber = sortedBids.length - index;

                  return (
                    <tr
                      key={bid.id}
                      className={`bg-gray-800/30 hover:bg-gray-700/30 transition-colors ${
                        isHighest || isCurrentHighest
                          ? 'border-l-4 border-primary-500'
                          : ''
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center font-bold text-sm text-primary-400">
                          #{bidNumber}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-base sm:text-lg text-white">
                          {formatEther(bid.bidPrice)} TGR
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/profile/${bid.from}`}
                          className="font-mono text-sm text-gray-300 hover:text-primary-400 transition-colors cursor-pointer"
                        >
                          {bid.from?.slice(0, 6)}...{bid.from?.slice(-4)}
                        </Link>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-400">{timeAgo}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isHighest && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-semibold border border-green-500/30">
                              Highest
                            </span>
                          )}
                          {isCurrentHighest && activeAuction?.active && (
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full font-semibold border border-blue-500/30">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`https://snowtrace.io/tx/${bid.txhash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-primary-400 transition-all duration-200"
                          title="View on Explorer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

