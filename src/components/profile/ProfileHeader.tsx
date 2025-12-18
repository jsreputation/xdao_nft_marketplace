'use client';

import { Address, formatEther } from 'viem';
import { useUser, useEvents } from '@/hooks/useSubgraph';
import { formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';
import Link from 'next/link';
import { ClipboardDocumentIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ProfileHeaderProps {
  address: Address;
  user: {
    totalVolume: bigint;
    totalSales: bigint;
    totalPurchases: bigint;
    totalListings: bigint;
    totalCollections: bigint;
  };
  stats: {
    ownedNFTs: number;
    listings: number;
    collections: number;
  };
}

export function ProfileHeader({ address, user, stats }: ProfileHeaderProps) {
  const { data: recentActivity } = useEvents({
    where: {
      or: [
        { from: address.toLowerCase() },
        { to: address.toLowerCase() },
      ],
    },
    orderBy: 'timestamp',
    orderDirection: 'desc',
    first: 1,
    skipPolling: true,
  });

  const lastActivity = useMemo(() => {
    if (recentActivity?.events?.[0]) {
      return formatDistanceToNow(new Date(Number(recentActivity.events[0].timestamp) * 1000), {
        addSuffix: true,
      });
    }
    return null;
  }, [recentActivity]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  const initials = address.slice(2, 4).toUpperCase();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-4 animate-fade-in">
      {/* Compact Header with integrated stats */}
      <div className="relative bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 p-4 sm:p-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {initials}
            </span>
          </div>

          {/* Profile Info - Compact */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                Profile
              </h1>
              {user && Number(user.totalVolume) > 0 && (
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold whitespace-nowrap">
                  Active Trader
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-mono text-xs sm:text-sm text-white/90">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Copy address"
              >
                <ClipboardDocumentIcon className="w-3.5 h-3.5 text-white/90" />
              </button>
              <Link
                href={`https://snowtrace.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="View on Explorer"
              >
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-white/90" />
              </Link>
              {lastActivity && (
                <span className="text-xs text-white/80 ml-2">
                  • Active {lastActivity}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar - Integrated */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
              {formatEther(user.totalVolume || 0n)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Volume</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              {stats.ownedNFTs}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Owned</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              {stats.listings}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Listed</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              {user.totalSales?.toString() || '0'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Sales</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              {user.totalPurchases?.toString() || '0'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Bought</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              {stats.collections}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Collections</p>
          </div>
        </div>
      </div>
    </div>
  );
}
