'use client';

import { useAuction, useAuctionBids } from '@/hooks/useSubgraph';
import { formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import { CountdownTimer } from './CountdownTimer';
import { BidsHistory } from './BidsHistory';
import { PlaceBidButton } from './PlaceBidButton';
import { useAccount } from 'wagmi';
import { useFinalizeAuction } from '@/hooks/useAuction';
import { toastError, toastSuccess } from '@/lib/toast';
import { useEffect } from 'react';

interface AuctionDetailProps {
  auctionId: string;
  onBidSuccess?: () => void;
}

export function AuctionDetail({ auctionId, onBidSuccess }: AuctionDetailProps) {
  const { address } = useAccount();
  const { data, loading, error, refetch: refetchAuction } = useAuction(auctionId);
  const { refetch: refetchBids } = useAuctionBids(BigInt(auctionId));
  const { finalizeAuction, isPending: isFinalizing, isConfirming: isFinalizingConfirming, isConfirmed: isFinalized, error: finalizeError } = useFinalizeAuction();

  // Handle finalize success
  useEffect(() => {
    if (isFinalized) {
      toastSuccess('Auction finalized successfully');
      // Refetch auction data
      setTimeout(() => {
        refetchAuction();
        refetchBids();
      }, 2000);
    }
  }, [isFinalized, refetchAuction, refetchBids]);

  // Handle finalize errors
  useEffect(() => {
    if (finalizeError) {
      toastError(finalizeError);
    }
  }, [finalizeError]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading auction...</p>
      </div>
    );
  }

  if (error || !data?.auction) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
        <p className="text-red-300">Error loading auction: {error?.message || 'Auction not found'}</p>
      </div>
    );
  }

  const auction = data.auction;
  const endTime = new Date(Number(auction.endTime) * 1000);
  const isEnded = endTime < new Date();
  const isOwner = address && address.toLowerCase() === auction.owner.toLowerCase();
  const currentBid = auction.currentBid > 0n ? auction.currentBid : auction.startPrice;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Starting Price</p>
            <p className="text-2xl font-bold text-gray-300">{formatEther(auction.startPrice)} TGR</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Bid</p>
            <p className="text-2xl font-bold text-primary-400">
              {formatEther(currentBid)} TGR
            </p>
          </div>
        </div>

        <div className="mb-6">
          <CountdownTimer endTime={endTime} />
        </div>

        {auction.currentBidder && auction.currentBidder !== '0x0000000000000000000000000000000000000000' && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-1">Current Bidder</p>
            <p className="font-mono text-sm text-gray-300">
              {auction.currentBidder.slice(0, 6)}...{auction.currentBidder.slice(-4)}
            </p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-1">Bid Count</p>
          <p className="text-xl font-semibold text-gray-200">{Number(auction.bidCount)}</p>
        </div>

        {!isEnded && !isOwner && (
          <PlaceBidButton
            auctionId={BigInt(auction.id)}
            currentBid={currentBid}
            startPrice={auction.startPrice}
            onBidSuccess={() => {
              // Refetch auction data and bid history after successful bid
              refetchAuction();
              refetchBids();
              // Also trigger parent's callback if provided
              if (onBidSuccess) {
                onBidSuccess();
              }
            }}
          />
        )}

        {isEnded && isOwner && (
          <button
            onClick={() => {
              try {
                finalizeAuction(BigInt(auction.id));
              } catch (err) {
                console.error('Finalize auction failed:', err);
                toastError(err);
              }
            }}
            disabled={isFinalizing || isFinalizingConfirming}
            className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/40"
          >
            {isFinalizing || isFinalizingConfirming ? (isFinalizing ? 'Waiting for confirmation...' : 'Finalizing...') : 'Finalize Auction'}
          </button>
        )}
      </div>

      <BidsHistory auctionId={BigInt(auction.id)} />
    </div>
  );
}

