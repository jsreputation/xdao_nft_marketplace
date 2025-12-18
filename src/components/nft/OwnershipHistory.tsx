'use client';

import { useNFTEvents } from '@/hooks/useSubgraph';
import { Address } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useMemo } from 'react';

interface OwnershipHistoryProps {
  collection: Address;
  tokenId: bigint;
  currentOwner?: string;
}

export function OwnershipHistory({ collection, tokenId, currentOwner }: OwnershipHistoryProps) {
  const { data, loading, error } = useNFTEvents(collection, tokenId);

  // Filter and process transfer events
  const ownershipHistory = useMemo(() => {
    const events = data?.events || [];
    const transfers = events.filter((event: any) => 
      event.name === 'Transfer' || event.name === 'Sold' || event.name === 'Minted'
    );

    // Process transfers to show ownership changes
    const history: any[] = [];
    
    transfers.forEach((event: any) => {
      if (event.name === 'Minted' && event.to) {
        history.push({
          ...event,
          type: 'mint',
          to: event.to,
          from: null,
        });
      } else if (event.name === 'Transfer' || event.name === 'Sold') {
        history.push({
          ...event,
          type: event.name === 'Sold' ? 'sale' : 'transfer',
          to: event.to,
          from: event.from,
        });
      }
    });

    // Sort by timestamp descending (newest first)
    return history.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Ownership History
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Ownership History
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading ownership history: {error.message}</p>
      </div>
    );
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'mint':
        return { label: 'Minted', icon: '🎨', color: 'purple' };
      case 'sale':
        return { label: 'Sold', icon: '💰', color: 'green' };
      case 'transfer':
        return { label: 'Transferred', icon: '🔄', color: 'blue' };
      default:
        return { label: 'Transfer', icon: '📝', color: 'gray' };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Ownership History
        </h3>
        {currentOwner && (
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Current Owner</p>
            <Link
              href={`/profile/${currentOwner}`}
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline font-mono"
            >
              {currentOwner.slice(0, 6)}...{currentOwner.slice(-4)}
            </Link>
          </div>
        )}
      </div>

      {ownershipHistory.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No ownership history available</p>
      ) : (
        <div className="space-y-3">
          {ownershipHistory.map((event: any, index: number) => {
            const timeAgo = formatDistanceToNow(new Date(Number(event.timestamp) * 1000), {
              addSuffix: true,
            });
            const eventType = getEventTypeLabel(event.type);
            const isCurrent = index === 0 && currentOwner && event.to?.toLowerCase() === currentOwner.toLowerCase();

            return (
              <div
                key={event.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                  isCurrent
                    ? 'border-primary-500 dark:border-primary-400 bg-gradient-to-r from-primary-50/50 to-purple-50/50 dark:from-primary-900/20 dark:to-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
              >
                {/* Event icon */}
                <div className="flex-shrink-0 text-2xl">{eventType.icon}</div>

                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {eventType.label}
                    </p>
                    {isCurrent && (
                      <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs px-2 py-1 rounded-full font-semibold">
                        Current
                      </span>
                    )}
                    {event.price && Number(event.price) > 0 && (
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {event.price ? Number(event.price) / 1e18 : '0'} TGR
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    {event.from && (
                      <>
                        <span>From:</span>
                        <Link
                          href={`/profile/${event.from}`}
                          className="font-mono hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {event.from.slice(0, 6)}...{event.from.slice(-4)}
                        </Link>
                        <span>→</span>
                      </>
                    )}
                    {event.to && (
                      <>
                        <span>To:</span>
                        <Link
                          href={`/profile/${event.to}`}
                          className="font-mono hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {event.to.slice(0, 6)}...{event.to.slice(-4)}
                        </Link>
                      </>
                    )}
                    <span>•</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>

                {/* Explorer link */}
                {event.txhash && (
                  <div className="flex-shrink-0">
                    <Link
                      href={`https://snowtrace.io/tx/${event.txhash}`}
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

