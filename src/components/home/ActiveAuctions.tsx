'use client';

import Link from 'next/link';
import { useAuctions } from '@/hooks/useSubgraph';
import { formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/common/Skeleton';

export function ActiveAuctions() {
  // Disable polling for homepage - use cached data
  const { data, loading, error } = useAuctions({
    where: { active: true },
    orderBy: 'endTime',
    orderDirection: 'asc',
    first: 6,
    skipPolling: true,
  });

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-10 sm:mb-12">Active Auctions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-800 dark:text-red-200">Error loading auctions: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  const auctions = data?.auctions || [];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Active Auctions</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Place your bids now</p>
          </div>
          <Link 
            href="/auctions" 
            className="mt-4 sm:mt-0 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm sm:text-base transition-colors flex items-center gap-2"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {auctions.map((auction: any) => {
            const endTime = new Date(Number(auction.endTime) * 1000);
            const timeRemaining = formatDistanceToNow(endTime, { addSuffix: true });
            const currentBid = auction.currentBid > 0n ? auction.currentBid : auction.startPrice;

            return (
              <Link
                key={auction.id}
                href={`/auction/${auction.id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover p-6"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Ends</span>
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                      {timeRemaining}
                    </span>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Bid</p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {formatEther(currentBid)} TGR
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Bids: </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{Number(auction.bidCount)}</span>
                  </div>
                  <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Place Bid
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
