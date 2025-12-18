'use client';

import { useNFTEvents } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useMemo } from 'react';

interface ActivityTimelineProps {
  collection: Address;
  tokenId: bigint;
}

export function ActivityTimeline({ collection, tokenId }: ActivityTimelineProps) {
  const { data, loading, error } = useNFTEvents(collection, tokenId);

  // Process events to track price changes
  const processedEvents = useMemo(() => {
    const events = data?.events || [];
    const processed: any[] = [];
    let previousPrice: bigint | null = null;

    // Sort events by timestamp ascending to track price history
    const sortedEvents = [...events].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    sortedEvents.forEach((event: any) => {
      const eventPrice = event.price ? BigInt(event.price) : null;
      
      if (event.name === 'PriceUpdated' && eventPrice && previousPrice) {
        // Calculate price change
        const oldPrice = previousPrice;
        const newPrice = eventPrice;
        const priceDiff = newPrice - oldPrice;
        const priceChangePercent = Number((priceDiff * 10000n) / oldPrice) / 100; // Percentage with 2 decimals
        
        processed.push({
          ...event,
          oldPrice,
          newPrice,
          priceChange: priceDiff,
          priceChangePercent,
        });
      } else {
        processed.push(event);
      }

      // Update previous price for next iteration
      if (eventPrice && (event.name === 'Listed' || event.name === 'PriceUpdated' || event.name === 'Sold')) {
        previousPrice = eventPrice;
      }
    });

    // Sort back to descending for display
    return processed.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Activity Timeline
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Activity Timeline
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm sm:text-base">Error loading activity: {error.message}</p>
      </div>
    );
  }

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'Minted':
        return '🎨';
      case 'Listed':
        return '📋';
      case 'Sold':
        return '💰';
      case 'Delisted':
        return '❌';
      case 'PriceUpdated':
        return '📊';
      case 'OfferCreated':
        return '💵';
      case 'OfferAccepted':
        return '✅';
      case 'OfferCancelled':
        return '🚫';
      case 'Bid':
        return '🔨';
      case 'AuctionCreated':
        return '🔔';
      case 'AuctionFinalized':
        return '🏁';
      default:
        return '📝';
    }
  };

  const getEventColor = (eventName: string, priceChangePercent?: number) => {
    if (eventName === 'PriceUpdated' && priceChangePercent !== undefined) {
      return priceChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    }
    if (eventName === 'Sold') return 'text-green-600 dark:text-green-400';
    if (eventName === 'Delisted') return 'text-red-600 dark:text-red-400';
    return 'text-primary-600 dark:text-primary-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Activity Timeline
      </h3>
      
      {processedEvents.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No activity yet</p>
      ) : (
        <div className="space-y-4">
          {processedEvents.map((event: any) => {
            const timeAgo = formatDistanceToNow(new Date(Number(event.timestamp) * 1000), {
              addSuffix: true,
            });

            const isPriceUpdate = event.name === 'PriceUpdated' && event.oldPrice && event.newPrice;
            const priceColor = getEventColor(event.name, event.priceChangePercent);

            return (
              <div 
                key={event.id} 
                className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg p-3 -m-3 transition-colors duration-200"
              >
                <div className="text-2xl flex-shrink-0">{getEventIcon(event.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-base text-gray-900 dark:text-gray-100">{event.name}</p>
                        {isPriceUpdate && event.priceChangePercent !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            event.priceChangePercent >= 0 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {event.priceChangePercent >= 0 ? '+' : ''}{event.priceChangePercent.toFixed(2)}%
                          </span>
                        )}
                      </div>
                      
                      {isPriceUpdate ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Old Price:</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatEther(event.oldPrice)} TGR
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">→</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatEther(event.newPrice)} TGR
                            </span>
                            <span className={`text-sm font-bold ${priceColor}`}>
                              New Price
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Change: {event.priceChange >= 0n ? '+' : ''}{formatEther(event.priceChange >= 0n ? event.priceChange : -event.priceChange)} TGR
                          </div>
                        </div>
                      ) : (
                        event.price && Number(event.price) > 0 && (
                          <p className={`font-semibold text-base mb-1 ${priceColor}`}>
                            {formatEther(event.price)} TGR
                          </p>
                        )
                      )}
                      
                      {(event.from || event.to) && (
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {event.from && (
                            <span>
                              From: <span className="font-mono">{event.from.slice(0, 6)}...{event.from.slice(-4)}</span>
                            </span>
                          )}
                          {event.to && (
                            <span>
                              To: <span className="font-mono">{event.to.slice(0, 6)}...{event.to.slice(-4)}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">{timeAgo}</p>
                      <Link
                        href={`https://snowtrace.io/tx/${event.txhash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 transition-colors"
                      >
                        View on Explorer
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
