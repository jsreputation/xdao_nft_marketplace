'use client';

import { useEvents } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Pagination } from '@/components/common/Pagination';

interface ActivityHistoryProps {
  userAddress: Address;
}

const PAGE_SIZE = 10;

export function ActivityHistory({ userAddress }: ActivityHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const { data, loading, error } = useEvents({
    where: {
      or: [
        { from: userAddress.toLowerCase() },
        { to: userAddress.toLowerCase() },
      ],
    },
    orderBy: 'timestamp',
    orderDirection: 'desc',
    first: 200,
    skipPolling: true,
  });

  // Deduplicate events by transaction hash and log index
  const uniqueEvents = useMemo(() => {
    const allEvents = data?.events || [];
    const seen = new Set<string>();
    const unique: any[] = [];

    allEvents.forEach((event: any) => {
      // Create unique key from txhash and logIndex
      const key = `${event.txhash}:${event.logIndex}`;
      
      // Skip if already seen (duplicate)
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      unique.push(event);
    });

    // Sort by timestamp (newest first)
    return unique.sort((a, b) => {
      const timeA = Number(a.timestamp || 0);
      const timeB = Number(b.timestamp || 0);
      return timeB - timeA;
    });
  }, [data]);

  // Paginate the results
  const paginatedEvents = useMemo(() => {
    const start = skip;
    const end = start + PAGE_SIZE;
    return uniqueEvents.slice(start, end);
  }, [uniqueEvents, skip]);

  const totalPages = Math.ceil(uniqueEvents.length / PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">Error loading activity: {error.message}</p>
      </div>
    );
  }

  if (uniqueEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Your transactions will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        {paginatedEvents.map((event: any) => {
          const timeAgo = formatDistanceToNow(new Date(Number(event.timestamp) * 1000), {
            addSuffix: true,
          });

          const isFromUser = event.from?.toLowerCase() === userAddress.toLowerCase();
          const isToUser = event.to?.toLowerCase() === userAddress.toLowerCase();

          // Determine event type and styling
          let eventType = 'default';
          let eventIcon = '📋';
          let eventColor = 'gray';
          if (event.name === 'Sold') {
            eventType = isFromUser ? 'sale' : 'purchase';
            eventIcon = isFromUser ? '💸' : '🛒';
            eventColor = isFromUser ? 'green' : 'blue';
          } else if (event.name === 'Listed') {
            eventType = 'listed';
            eventIcon = '📋';
            eventColor = 'purple';
          } else if (event.name === 'Delisted') {
            eventType = 'delisted';
            eventIcon = '❌';
            eventColor = 'red';
          } else if (event.name === 'Bid') {
            eventType = 'bid';
            eventIcon = '💰';
            eventColor = 'yellow';
          }

          return (
            <div
              key={`${event.txhash}:${event.logIndex}`}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 bg-white dark:bg-gray-800/50"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 flex items-center justify-center text-base">
                {eventIcon}
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {event.name}
                  </span>
                  {event.price && Number(event.price) > 0 && (
                    <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                      {formatEther(event.price)} TGR
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {timeAgo}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Link
                    href={`/nft/${event.collection}/${event.tokenId}`}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    NFT #{event.tokenId}
                  </Link>
                  <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {isFromUser ? 'You' : `${event.from?.slice(0, 6)}...${event.from?.slice(-4)}`}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">→</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {isToUser ? 'You' : `${event.to?.slice(0, 6)}...${event.to?.slice(-4)}`}
                  </span>
                </div>
              </div>

              {/* Action button */}
              <div className="flex-shrink-0">
                <a
                  href={`https://snowtrace.io/tx/${event.txhash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  title="View on Explorer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
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
