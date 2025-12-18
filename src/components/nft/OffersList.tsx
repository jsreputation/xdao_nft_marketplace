'use client';

import { usePairOffers } from '@/hooks/useSubgraph';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useAcceptOffer, useCancelOffer } from '@/hooks/useMarketplace';
import { formatDistanceToNow } from 'date-fns';
import { forwardRef, useImperativeHandle, useEffect, useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { toastError, toastSuccess } from '@/lib/toast';
import Link from 'next/link';

interface OffersListProps {
  pairId: bigint;
  isOwner: boolean;
}

export interface OffersListRef {
  refetch: () => void;
}

type SortField = 'amount' | 'offerer' | 'timestamp';
type SortOrder = 'asc' | 'desc';

export const OffersList = forwardRef<OffersListRef, OffersListProps>(({ pairId, isOwner }, ref) => {
  const { address } = useAccount();
  const { data, loading, error, refetch } = usePairOffers(pairId);
  const { acceptOffer, isPending: isAccepting, isConfirmed: isAcceptConfirmed, error: acceptError } = useAcceptOffer();
  const { cancelOffer, isPending: isCancelling, isConfirmed: isCancelConfirmed, error: cancelError } = useCancelOffer();
  
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [cancellingOfferId, setCancellingOfferId] = useState<bigint | null>(null);

  // Expose refetch method to parent
  useImperativeHandle(ref, () => ({
    refetch: () => {
      refetch();
    },
  }));

  // Handle accept offer success
  useEffect(() => {
    if (isAcceptConfirmed) {
      toastSuccess('Offer accepted successfully');
      // Refetch multiple times to catch subgraph updates
      setTimeout(() => refetch(), 2000);
      setTimeout(() => refetch(), 4000);
      setTimeout(() => refetch(), 6000);
    }
  }, [isAcceptConfirmed, refetch]);

  // Handle cancel offer success
  useEffect(() => {
    if (isCancelConfirmed) {
      toastSuccess('Offer cancelled successfully');
      setCancellingOfferId(null);
      // Refetch multiple times to catch subgraph updates
      setTimeout(() => refetch(), 2000);
      setTimeout(() => refetch(), 4000);
      setTimeout(() => refetch(), 6000);
    }
  }, [isCancelConfirmed, refetch]);

  // Handle accept offer error
  useEffect(() => {
    if (acceptError) {
      toastError(acceptError);
    }
  }, [acceptError]);

  // Handle cancel offer error
  useEffect(() => {
    if (cancelError) {
      toastError(cancelError);
      setCancellingOfferId(null);
    }
  }, [cancelError]);

  const handleAcceptOffer = async (offerId: bigint) => {
    try {
      await acceptOffer(offerId);
    } catch (err) {
      console.error('Accept offer failed:', err);
      toastError(err);
    }
  };

  const handleCancelOffer = async (offerId: bigint) => {
    setCancellingOfferId(offerId);
    try {
      await cancelOffer(offerId);
    } catch (err) {
      console.error('Cancel offer failed:', err);
      toastError(err);
      setCancellingOfferId(null);
    }
  };

  const offers = data?.offers || [];

  // Sort offers
  const sortedOffers = useMemo(() => {
    if (!offers.length) return [];
    
    return [...offers].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'amount':
          aValue = BigInt(a.amount);
          bValue = BigInt(b.amount);
          break;
        case 'offerer':
          aValue = a.offerer.toLowerCase();
          bValue = b.offerer.toLowerCase();
          break;
        case 'timestamp':
          aValue = Number(a.timestamp);
          bValue = Number(b.timestamp);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [offers, sortField, sortOrder]);

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
      <div className="bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-700/50">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Offers</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-700/50">
        <p className="text-red-400 text-sm sm:text-base">Error loading offers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700/50">
      <h3 className="text-lg sm:text-xl font-bold mb-6 text-white">Offers ({offers.length})</h3>
      
      {offers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No offers yet</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-700/30">
                <tr>
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
                      onClick={() => handleSort('offerer')}
                      className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      Owner
                      <SortIcon field="offerer" />
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
                {sortedOffers.map((offer: any) => {
                  const isMyOffer = offer.offerer.toLowerCase() === address?.toLowerCase();
                  const timeAgo = formatDistanceToNow(new Date(Number(offer.timestamp) * 1000), {
                    addSuffix: true,
                  });

                  return (
                    <tr
                      key={offer.id}
                      className="bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-base sm:text-lg text-white">
                          {formatEther(offer.amount)} TGR
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <Link
                            href={`/profile/${offer.offerer}`}
                            className="font-mono text-sm text-gray-300 hover:text-primary-400 transition-colors cursor-pointer"
                          >
                            by {offer.offerer.slice(0, 6)}...{offer.offerer.slice(-4)}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-400">{timeAgo}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          {isOwner && (
                            <button
                              onClick={() => handleAcceptOffer(BigInt(offer.offerId))}
                              disabled={isAccepting || isCancelling}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
                            >
                              {isAccepting ? 'Accepting...' : 'Accept'}
                            </button>
                          )}
                          {isMyOffer && (
                            <button
                              onClick={() => handleCancelOffer(BigInt(offer.offerId))}
                              disabled={isCancelling || cancellingOfferId === BigInt(offer.offerId)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
                            >
                              {(isCancelling && cancellingOfferId === BigInt(offer.offerId)) ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

OffersList.displayName = 'OffersList';

