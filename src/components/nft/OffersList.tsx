'use client';

import { usePairOffers } from '@/hooks/useSubgraph';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useAcceptOffer, useCancelOffer } from '@/hooks/useMarketplace';
import { formatDistanceToNow } from 'date-fns';

interface OffersListProps {
  pairId: bigint;
  isOwner: boolean;
}

export function OffersList({ pairId, isOwner }: OffersListProps) {
  const { address } = useAccount();
  const { data, loading, error } = usePairOffers(pairId);
  const { acceptOffer, isPending: isAccepting } = useAcceptOffer();
  const { cancelOffer, isPending: isCancelling } = useCancelOffer();

  const offers = data?.offers || [];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">Offers</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
        <p className="text-red-500 dark:text-red-400 text-sm sm:text-base">Error loading offers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold mb-4">Offers ({offers.length})</h3>
      
      {offers.length === 0 ? (
        <p className="text-gray-500">No offers yet</p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer: any) => {
            const isMyOffer = offer.offerer.toLowerCase() === address?.toLowerCase();
            const timeAgo = formatDistanceToNow(new Date(Number(offer.timestamp) * 1000), {
              addSuffix: true,
            });

            return (
              <div
                key={offer.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-base sm:text-lg mb-1">
                    {formatEther(offer.amount)} TGR
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                    by {offer.offerer.slice(0, 6)}...{offer.offerer.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {isOwner && (
                    <button
                      onClick={() => acceptOffer(BigInt(offer.offerId))}
                      disabled={isAccepting}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm sm:text-base font-medium"
                    >
                      {isAccepting ? 'Accepting...' : 'Accept'}
                    </button>
                  )}
                  {isMyOffer && (
                    <button
                      onClick={() => cancelOffer(BigInt(offer.offerId))}
                      disabled={isCancelling}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm sm:text-base font-medium"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

