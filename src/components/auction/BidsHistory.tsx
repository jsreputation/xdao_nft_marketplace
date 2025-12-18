'use client';

import { useAuctionBids } from '@/hooks/useSubgraph';
import { formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';

interface BidsHistoryProps {
  auctionId: bigint;
}

export function BidsHistory({ auctionId }: BidsHistoryProps) {
  const { data, loading, error } = useAuctionBids(auctionId);

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Bid History</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700/50 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl p-6">
        <p className="text-red-400">Error loading bids: {error.message}</p>
      </div>
    );
  }

  const bids = data?.bids || [];

  return (
    <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4 text-white">Bid History ({bids.length})</h3>
      
      {bids.length === 0 ? (
        <p className="text-gray-400">No bids yet</p>
      ) : (
        <div className="space-y-3">
          {bids.map((bid: any, index: number) => {
            const timeAgo = formatDistanceToNow(new Date(Number(bid.timestamp) * 1000), {
              addSuffix: true,
            });

            return (
              <div
                key={bid.id}
                className={`border rounded-lg p-4 ${
                  index === 0 
                    ? 'bg-primary-500/10 border-primary-500/30' 
                    : 'bg-gray-700/30 border-gray-600/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    {index === 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mr-2 font-semibold">
                        Highest
                      </span>
                    )}
                    <p className="font-semibold text-lg text-white">
                      {formatEther(bid.bidPrice)} TGR
                    </p>
                    <p className="text-sm text-gray-400">
                      by {bid.from.slice(0, 6)}...{bid.from.slice(-4)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

