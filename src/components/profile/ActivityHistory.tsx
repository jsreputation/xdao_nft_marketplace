'use client';

import { useEvents } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Pagination } from '@/components/common/Pagination';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ActivityHistoryProps {
  userAddress: Address;
}

const PAGE_SIZE = 10;

type SortField = 'type' | 'amount' | 'nft' | 'from' | 'to' | 'timestamp';
type SortOrder = 'asc' | 'desc';

export function ActivityHistory({ userAddress }: ActivityHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
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

    return unique;
  }, [data]);

  // Sort events
  const sortedEvents = useMemo(() => {
    if (!uniqueEvents.length) return [];
    
    return [...uniqueEvents].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'type':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'amount':
          aValue = BigInt(a.price || 0);
          bValue = BigInt(b.price || 0);
          break;
        case 'nft':
          aValue = Number(a.tokenId || 0);
          bValue = Number(b.tokenId || 0);
          break;
        case 'from':
          aValue = a.from?.toLowerCase() || '';
          bValue = b.from?.toLowerCase() || '';
          break;
        case 'to':
          aValue = a.to?.toLowerCase() || '';
          bValue = b.to?.toLowerCase() || '';
          break;
        case 'timestamp':
          aValue = Number(a.timestamp || 0);
          bValue = Number(b.timestamp || 0);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [uniqueEvents, sortField, sortOrder]);

  // Paginate the results
  const paginatedEvents = useMemo(() => {
    const start = skip;
    const end = start + PAGE_SIZE;
    return sortedEvents.slice(start, end);
  }, [sortedEvents, skip]);

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

  if (loading) {
    return (
      <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50">
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-700/50 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50">
        <p className="text-red-400 text-sm sm:text-base">Error loading activity: {error.message}</p>
      </div>
    );
  }

  if (uniqueEvents.length === 0) {
    return (
      <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50 text-center py-8">
        <p className="text-gray-400 text-sm">No activity yet</p>
        <p className="text-gray-500 text-xs mt-1">Your transactions will appear here</p>
      </div>
    );
  }

  const totalPages = Math.ceil(sortedEvents.length / PAGE_SIZE);

  return (
    <>
      <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-700/30">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left">
                    <span className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Type</span>
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
                      onClick={() => handleSort('nft')}
                      className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      NFT
                      <SortIcon field="nft" />
                    </button>
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('from')}
                      className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      From
                      <SortIcon field="from" />
                    </button>
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('to')}
                      className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      To
                      <SortIcon field="to" />
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
                  <th scope="col" className="px-4 sm:px-6 py-3 text-right">
                    <span className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
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
                  } else if (event.name === 'AuctionCreated') {
                    eventType = 'auction';
                    eventIcon = '🔨';
                    eventColor = 'orange';
                  } else if (event.name === 'PriceUpdated') {
                    eventType = 'price';
                    eventIcon = '📊';
                    eventColor = 'blue';
                  } else if (event.name === 'Minted') {
                    eventType = 'mint';
                    eventIcon = '✨';
                    eventColor = 'purple';
                  }

                  return (
                    <tr
                      key={`${event.txhash}:${event.logIndex}`}
                      className="bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center text-sm">
                            {eventIcon}
                          </div>
                          <span className="font-semibold text-sm text-white">
                            {event.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {event.price && Number(event.price) > 0 ? (
                          <span className="font-bold text-sm text-primary-400">
                            {formatEther(event.price)} TGR
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/nft/${event.collection}/${event.tokenId}`}
                          className="text-sm text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
                        >
                          NFT #{event.tokenId}
                        </Link>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {isFromUser ? (
                          <span className="text-sm text-gray-300 font-medium">You</span>
                        ) : event.from ? (
                          <Link
                            href={`/profile/${event.from}`}
                            className="font-mono text-sm text-gray-300 hover:text-primary-400 transition-colors cursor-pointer"
                          >
                            {event.from?.slice(0, 6)}...{event.from?.slice(-4)}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {isToUser ? (
                          <span className="text-sm text-gray-300 font-medium">You</span>
                        ) : event.to ? (
                          <Link
                            href={`/profile/${event.to}`}
                            className="font-mono text-sm text-gray-300 hover:text-primary-400 transition-colors cursor-pointer"
                          >
                            {event.to?.slice(0, 6)}...{event.to?.slice(-4)}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-400">{timeAgo}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`https://snowtrace.io/tx/${event.txhash}`}
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
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
