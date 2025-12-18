'use client';

import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Address, isAddress } from 'viem';
import { NFTImage } from '@/components/nft/NFTImage';
import { NFTMetadata } from '@/components/nft/NFTMetadata';
import { ActionButtons } from '@/components/nft/ActionButtons';
import { OffersList } from '@/components/nft/OffersList';
import { ActivityTimeline } from '@/components/nft/ActivityTimeline';
import { NFTTabs } from '@/components/nft/NFTTabs';
import dynamic from 'next/dynamic';

// Lazy load heavy components for better performance
const PriceHistory = dynamic(() => import('@/components/nft/PriceHistory').then(mod => ({ default: mod.PriceHistory })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

const PriceStatistics = dynamic(() => import('@/components/nft/PriceStatistics').then(mod => ({ default: mod.PriceStatistics })), {
  loading: () => <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

const BidHistory = dynamic(() => import('@/components/nft/BidHistory').then(mod => ({ default: mod.BidHistory })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

const OfferHistory = dynamic(() => import('@/components/nft/OfferHistory').then(mod => ({ default: mod.OfferHistory })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

const OwnershipHistory = dynamic(() => import('@/components/nft/OwnershipHistory').then(mod => ({ default: mod.OwnershipHistory })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

const MakeOfferModal = dynamic(() => import('@/components/nft/MakeOfferModal').then(mod => ({ default: mod.MakeOfferModal })), {
  ssr: false,
});
import { useState, useEffect, useRef } from 'react';
import { useNFTDetails, useAuctions } from '@/hooks/useSubgraph';
import { useNFTOwner } from '@/hooks/useNFT';
import { MARKET_ADDRESS } from '@/lib/contracts';
import Link from 'next/link';
import { OffersListRef } from '@/components/nft/OffersList';

export default function NFTDetailPage() {
  const params = useParams();
  const { address } = useAccount();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const offersListRef = useRef<OffersListRef>(null);

  const collectionAddress = params.collection as string;
  const tokenId = params.tokenId as string;

  const handleStatusChange = () => {
    // Force refresh by updating key
    // The subgraph queries will automatically refetch due to polling
    setRefreshKey(prev => prev + 1);
  };

  if (!isAddress(collectionAddress)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid collection address</p>
      </div>
    );
  }

  const collection = collectionAddress as Address;
  const tokenIdBigInt = BigInt(tokenId);

  // Use refreshKey to force re-fetch
  const { data: nftData, loading: nftLoading, refetch: refetchNFT } = useNFTDetails(collection, tokenIdBigInt);
  const { owner, isLoading: ownerLoading } = useNFTOwner(collection, tokenIdBigInt);
  
  // Check if NFT is in an active auction
  const { data: auctionsData, refetch: refetchAuctions } = useAuctions({
    where: {
      collection: collection.toLowerCase(),
      tokenId: tokenIdBigInt.toString(),
      active: true,
    },
    first: 1,
  });

  // Refresh data when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      // Wait a bit for subgraph to index, then refetch
      const timer = setTimeout(() => {
        refetchNFT();
        refetchAuctions();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [refreshKey, refetchNFT, refetchAuctions]);

  // Ensure collection is properly formatted
  const collectionLower = collection.toLowerCase();

  const item = nftData?.items?.[0];
  const pair = nftData?.pairs?.[0];
  const activeAuction = auctionsData?.auctions?.[0];
  const isInAuction = !!activeAuction;

  // Determine effective owner:
  // - If listed, use the pair's owner (seller)
  // - If in auction, use the auction seller
  // - If owner is market address and not listed/auction, use creator
  // - Otherwise, use the contract owner
  const ownerAddress = owner as string | undefined;
  const creatorAddress = item?.creator;
  const pairOwner = pair?.owner;

  // Check if NFT is listed - pair exists and bValid is true
  // Also check if contract owner is market address (which indicates listing)
  const isListed = Boolean((pair?.bValid === true) || (ownerAddress && ownerAddress.toLowerCase() === MARKET_ADDRESS.toLowerCase() && !isInAuction));
  
  let effectiveOwner: string | undefined;
  
  if (isListed && pairOwner) {
    // When listed, the pair's owner is the seller
    effectiveOwner = pairOwner;
  } else if (isInAuction && activeAuction?.owner) {
    // When in auction, use the auction owner (seller)
    effectiveOwner = activeAuction.owner;
  } else if (
    ownerAddress && 
    ownerAddress.toLowerCase() === MARKET_ADDRESS.toLowerCase() && 
    !isListed && 
    !isInAuction && 
    creatorAddress
  ) {
    // If owned by market but not listed/auction, creator is the effective owner
    effectiveOwner = creatorAddress;
  } else {
    // Otherwise, use the contract owner
    effectiveOwner = ownerAddress;
  }

  // Check if connected user is the effective owner
  const isOwner = address && effectiveOwner && address.toLowerCase() === effectiveOwner.toLowerCase();

  if (nftLoading || ownerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Loading NFT details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">NFT not found</p>
      </div>
    );
  }

  const currentPrice = pair?.price ? BigInt(pair.price) : undefined;

  // Build tabs based on available data
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'price', label: 'Price History', icon: '📈' },
  ];

  if (isInAuction) {
    tabs.push({ id: 'bids', label: 'Bids', icon: '🔨' });
  }

  if (isListed && pair) {
    tabs.push({ id: 'offers', label: 'Offers', icon: '💵' });
  }

  tabs.push(
    { id: 'activity', label: 'Activity', icon: '📝' },
    { id: 'ownership', label: 'Ownership', icon: '👤' }
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <Link href="/explore" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm sm:text-base inline-flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Explore
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Left Column - Image */}
          <div>
            <NFTImage
              uri={item.uri}
              collection={collection}
              tokenId={tokenIdBigInt}
            />
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <NFTMetadata
              uri={item.uri}
              tokenId={tokenIdBigInt}
              creator={item.creator}
              owner={effectiveOwner || item.owner}
              royalty={item.royalty}
            />

            {/* Price Statistics - Quick View */}
            <PriceStatistics 
              collection={collection} 
              tokenId={tokenIdBigInt} 
              currentPrice={currentPrice}
            />

            {/* Show warning if NFT is in active auction */}
            {isInAuction && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm sm:text-base font-medium mb-2">
                  This NFT is currently in an active auction
                </p>
                <Link
                  href={`/auction/${activeAuction.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View Auction →
                </Link>
              </div>
            )}

            <ActionButtons
              pairId={pair ? BigInt(pair.id) : undefined}
              collection={collection}
              tokenId={tokenIdBigInt}
              owner={effectiveOwner || item.owner}
              price={currentPrice}
              isListed={isListed}
              isOwner={!!isOwner}
              isInAuction={isInAuction}
              auctionId={activeAuction?.id}
              onStatusChange={handleStatusChange}
            />

            {!isOwner && isListed && (
              <button
                onClick={() => setShowOfferModal(true)}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Make Offer
              </button>
            )}
          </div>
        </div>

        {/* Active Offers Section (if listed) */}
        {pair && isListed && (
          <div className="mb-8">
            <OffersList ref={offersListRef} pairId={BigInt(pair.id)} isOwner={!!isOwner} />
          </div>
        )}

        {/* Tabs Section */}
        <NFTTabs tabs={tabs} defaultTab="overview">
          {/* Overview Tab */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isListed && pair && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Listing Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Price</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {currentPrice ? (Number(currentPrice) / 1e18).toFixed(4) : '—'} TGR
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Creator Fee</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {pair.creatorFee ? (Number(pair.creatorFee) / 10).toFixed(1) : '0'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Offers</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {pair.offerCount || 0}
                      </span>
                    </div>
                    {pair.priceUpdated && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Price Update</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {pair.lastPriceUpdate ? new Date(Number(pair.lastPriceUpdate) * 1000).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {isInAuction && activeAuction && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Auction Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Bid</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {activeAuction.currentBid ? (Number(activeAuction.currentBid) / 1e18).toFixed(4) : '—'} TGR
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Bids</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {activeAuction.bidCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">End Time</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {activeAuction.endTime ? new Date(Number(activeAuction.endTime) * 1000).toLocaleString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price History Tab */}
          <PriceHistory 
            collection={collection} 
            tokenId={tokenIdBigInt} 
            currentPrice={currentPrice}
          />

          {/* Bids Tab (only if in auction) */}
          {isInAuction ? (
            <BidHistory collection={collection} tokenId={tokenIdBigInt} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">This NFT is not currently in an auction</p>
            </div>
          )}

          {/* Offers Tab (only if listed) */}
          {isListed && pair ? (
            <OfferHistory 
              pairId={BigInt(pair.id)} 
              collection={collection} 
              tokenId={tokenIdBigInt}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">This NFT is not currently listed</p>
            </div>
          )}

          {/* Activity Tab */}
          <ActivityTimeline collection={collection} tokenId={tokenIdBigInt} />

          {/* Ownership Tab */}
          <OwnershipHistory 
            collection={collection} 
            tokenId={tokenIdBigInt} 
            currentOwner={effectiveOwner || item.owner}
          />
        </NFTTabs>

        {/* Make Offer Modal */}
        {showOfferModal && pair && (
          <MakeOfferModal
            pairId={BigInt(pair.id)}
            currentPrice={currentPrice}
            onClose={() => setShowOfferModal(false)}
            onOfferSuccess={() => {
              // Refetch offers multiple times to catch subgraph indexing
              // Subgraph indexing can take a few seconds
              setTimeout(() => offersListRef.current?.refetch(), 2000);
              setTimeout(() => offersListRef.current?.refetch(), 4000);
              setTimeout(() => offersListRef.current?.refetch(), 6000);
              setTimeout(() => offersListRef.current?.refetch(), 10000);
            }}
          />
        )}
      </div>
    </div>
  );
}
