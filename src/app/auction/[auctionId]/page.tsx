'use client';

import { useParams } from 'next/navigation';
import { useRef } from 'react';
import { AuctionDetail } from '@/components/auction/AuctionDetail';
import { NFTImage } from '@/components/nft/NFTImage';
import { BidHistory, BidHistoryRef } from '@/components/nft/BidHistory';
import { useAuction } from '@/hooks/useSubgraph';
import { Address, isAddress } from 'viem';
import Link from 'next/link';

export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = params.auctionId as string;
  const bidHistoryRef = useRef<BidHistoryRef>(null);

  const { data, loading, refetch: refetchAuction } = useAuction(auctionId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (!data?.auction) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-red-400">Auction not found</p>
      </div>
    );
  }

  const auction = data.auction;

  if (!isAddress(auction.collection)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-red-400">Invalid collection address</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <Link href="/auctions" className="text-primary-400 hover:text-primary-300 text-sm sm:text-base inline-flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Auctions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div>
            <NFTImage
              collection={auction.collection as Address}
              tokenId={auction.tokenId}
            />
          </div>
          <div>
            <AuctionDetail 
              auctionId={auctionId}
              onBidSuccess={() => {
                // Refetch bid history when bid is successful
                if (bidHistoryRef.current) {
                  bidHistoryRef.current.refetch();
                }
                refetchAuction();
              }}
            />
          </div>
        </div>

        {/* Bid History Section */}
        <div className="mb-8">
          <BidHistory 
            ref={bidHistoryRef}
            collection={auction.collection as Address} 
            tokenId={auction.tokenId}
          />
        </div>
      </div>
    </div>
  );
}

