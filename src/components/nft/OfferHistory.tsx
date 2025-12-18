'use client';

import { useAllPairOffers } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useMemo } from 'react';

interface OfferHistoryProps {
  pairId?: bigint;
  collection: Address;
  tokenId: bigint;
}

export function OfferHistory({ pairId, collection, tokenId }: OfferHistoryProps) {
  // If pairId is provided, use it; otherwise we'd need to fetch it first
  // For now, we'll require pairId
  const { data, loading, error } = useAllPairOffers(pairId!, true);

  const offers = useMemo(() => {
    const allOffers = data?.offers || [];
    // Sort by timestamp descending (newest first)
    return allOffers.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));
  }, [data]);

  if (!pairId || pairId === 0n) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Offer History
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">This NFT is not currently listed</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Offer History
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
          Offer History
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading offers: {error.message}</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Offer History
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No offers have been made yet</p>
      </div>
    );
  }

  // Count offers by status
  const activeCount = offers.filter((o: any) => o.isActive && !o.accepted && !o.cancelled).length;
  const acceptedCount = offers.filter((o: any) => o.accepted).length;
  const cancelledCount = offers.filter((o: any) => o.cancelled).length;

  const getOfferStatus = (offer: any) => {
    if (offer.accepted) return { label: 'Accepted', color: 'green', icon: '✅' };
    if (offer.cancelled) return { label: 'Cancelled', color: 'red', icon: '🚫' };
    if (offer.isActive) return { label: 'Active', color: 'blue', icon: '💵' };
    return { label: 'Inactive', color: 'gray', icon: '⏸️' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Offer History
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">{activeCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Accepted</p>
            <p className="font-bold text-green-600 dark:text-green-400">{acceptedCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
            <p className="font-bold text-red-600 dark:text-red-400">{cancelledCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">{offers.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {offers.map((offer: any) => {
          const timeAgo = formatDistanceToNow(new Date(Number(offer.timestamp) * 1000), {
            addSuffix: true,
          });
          const status = getOfferStatus(offer);
          const statusColorClass = {
            green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
            red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
            gray: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300',
          }[status.color];

          return (
            <div
              key={offer.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                offer.accepted
                  ? 'border-green-500 dark:border-green-400 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20'
                  : offer.cancelled
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 opacity-75'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 text-2xl">{status.icon}</div>

              {/* Offer details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {formatEther(offer.amount)} TGR
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColorClass}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                  <span className="font-mono">{offer.offerer?.slice(0, 6)}...{offer.offerer?.slice(-4)}</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                  {offer.accepted && offer.acceptedTimestamp && (
                    <>
                      <span>•</span>
                      <span>Accepted {formatDistanceToNow(new Date(Number(offer.acceptedTimestamp) * 1000), { addSuffix: true })}</span>
                    </>
                  )}
                  {offer.cancelled && offer.cancelledTimestamp && (
                    <>
                      <span>•</span>
                      <span>Cancelled {formatDistanceToNow(new Date(Number(offer.cancelledTimestamp) * 1000), { addSuffix: true })}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Explorer link */}
              {offer.txhash && (
                <div className="flex-shrink-0">
                  <Link
                    href={`https://snowtrace.io/tx/${offer.txhash}`}
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
    </div>
  );
}

