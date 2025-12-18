'use client';

import { useAccount } from 'wagmi';
import { Address, formatEther } from 'viem';
import { useBuyNFT, useListNFT, useDelist, useUpdatePrice } from '@/hooks/useMarketplace';
import { useState, useEffect, useRef } from 'react';
import { useApproveTGR, useTGRBalance } from '@/hooks/useMarketplace';
import { MARKET_ADDRESS } from '@/lib/contracts';
import { parseEther } from 'viem';
import dynamic from 'next/dynamic';

// Lazy load modal to reduce initial bundle size
const CreateAuctionModal = dynamic(
  () => import('@/components/auction/CreateAuctionModal').then(mod => ({ default: mod.CreateAuctionModal })),
  { ssr: false }
);
import { useApproveNFT, useNFTApproval } from '@/hooks/useNFT';
import { toastError, toastSuccess, toastWarning } from '@/lib/toast';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import Link from 'next/link';

interface ActionButtonsProps {
  pairId?: bigint;
  collection: Address;
  tokenId: bigint;
  owner: Address;
  price?: bigint;
  isListed: boolean;
  isOwner: boolean;
  isInAuction?: boolean;
  auctionId?: string;
  onStatusChange?: () => void;
}

export function ActionButtons({
  pairId,
  collection,
  tokenId,
  owner,
  price,
  isListed,
  isOwner,
  isInAuction = false,
  auctionId,
  onStatusChange,
}: ActionButtonsProps) {
  const { address } = useAccount();
  const { buyNFT, isPending: isBuying, isConfirming: isBuyingConfirming, isConfirmed: isBuyConfirmed, error: buyError } = useBuyNFT();
  const { listNFT, isPending: isListing, isConfirming: isListingConfirming, isConfirmed: isListConfirmed, error: listError } = useListNFT();
  const { delist, isPending: isDelisting, isConfirming: isDelistingConfirming, isConfirmed: isDelistConfirmed, error: delistError } = useDelist();
  const { updatePrice, isPending: isUpdatingPrice, isConfirming: isUpdatingPriceConfirming, isConfirmed: isUpdatePriceConfirmed, error: updatePriceError } = useUpdatePrice();
  const { approveTGR, isPending: isApproving, isConfirming: isApprovingConfirming, isConfirmed: isTGRApprovalConfirmed } = useApproveTGR();
  const { approveNFT: approveNFTForMarket, isPending: isApprovingNFT, isConfirming: isApprovingNFTConfirming, isConfirmed: isNFTApprovalConfirmed, error: approveNFTError } = useApproveNFT(collection);
  const { balance } = useTGRBalance(address);
  const { isApproved: isNFTApprovedForMarket } = useNFTApproval(collection, tokenId, MARKET_ADDRESS);

  const [listPrice, setListPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [showListModal, setShowListModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [listStep, setListStep] = useState<'approve' | 'list' | 'idle'>('idle');
  const [buyStep, setBuyStep] = useState<'approve' | 'buy' | 'idle'>('idle');

  // Use refs to track if we've already shown notifications (prevent duplicates)
  const buyNotificationShown = useRef(false);
  const listNotificationShown = useRef(false);
  const delistNotificationShown = useRef(false);
  const updatePriceNotificationShown = useRef(false);

  // Check if any operation is in progress (exclude modal states)
  const isAnyOperationPending = isBuying || isBuyingConfirming || isListing || isListingConfirming || 
    isDelisting || isDelistingConfirming || isUpdatingPrice || isUpdatingPriceConfirming || 
    isApproving || isApprovingConfirming || isApprovingNFT || isApprovingNFTConfirming ||
    buyStep !== 'idle' || listStep !== 'idle';

  // Refresh status after operations complete (with duplicate prevention)
  useEffect(() => {
    if (isBuyConfirmed && !buyNotificationShown.current) {
      buyNotificationShown.current = true;
      setBuyStep('idle'); // Reset buy step
      toastSuccess('Purchase completed successfully');
      if (onStatusChange) {
        setTimeout(() => {
          onStatusChange();
        }, 2000);
      }
    }
    if (isListConfirmed && !listNotificationShown.current) {
      listNotificationShown.current = true;
      setShowListModal(false);
      setListPrice('');
      setListStep('idle');
      toastSuccess('NFT listed successfully');
      if (onStatusChange) {
        setTimeout(() => {
          onStatusChange();
        }, 2000);
      }
    }
    if (isDelistConfirmed && !delistNotificationShown.current) {
      delistNotificationShown.current = true;
      toastSuccess('NFT delisted successfully');
      if (onStatusChange) {
        setTimeout(() => {
          onStatusChange();
        }, 2000);
      }
    }
    if (isUpdatePriceConfirmed && !updatePriceNotificationShown.current) {
      updatePriceNotificationShown.current = true;
      setShowPriceModal(false);
      setNewPrice('');
      toastSuccess('Price updated successfully');
      if (onStatusChange) {
        setTimeout(() => {
          onStatusChange();
        }, 2000);
      }
    }
  }, [isBuyConfirmed, isListConfirmed, isDelistConfirmed, isUpdatePriceConfirmed, onStatusChange]);

  // Reset notification flags when transaction states reset
  useEffect(() => {
    if (!isBuyConfirmed && !isBuying && !isBuyingConfirming) {
      buyNotificationShown.current = false;
    }
  }, [isBuyConfirmed, isBuying, isBuyingConfirming]);

  useEffect(() => {
    if (!isListConfirmed && !isListing && !isListingConfirming) {
      listNotificationShown.current = false;
    }
  }, [isListConfirmed, isListing, isListingConfirming]);

  useEffect(() => {
    if (!isDelistConfirmed && !isDelisting && !isDelistingConfirming) {
      delistNotificationShown.current = false;
    }
  }, [isDelistConfirmed, isDelisting, isDelistingConfirming]);

  useEffect(() => {
    if (!isUpdatePriceConfirmed && !isUpdatingPrice && !isUpdatingPriceConfirming) {
      updatePriceNotificationShown.current = false;
    }
  }, [isUpdatePriceConfirmed, isUpdatingPrice, isUpdatingPriceConfirming]);

  const handleBuy = async () => {
    if (!pairId) return;
    
    // Check balance
    if (price && balance && typeof balance === 'bigint' && balance < price) {
      toastError('Insufficient balance');
      return;
    }

    // Step 1: Approve TGR if needed
    if (price && balance && typeof balance === 'bigint' && balance >= price) {
      setBuyStep('approve');
      try {
        approveTGR(MARKET_ADDRESS, price);
      } catch (err) {
        console.error('Approval failed:', err);
        setBuyStep('idle');
        toastError(err);
        return;
      }
      return;
    }

    // Step 2: Buy if already approved or no approval needed
    setBuyStep('buy');
    try {
      buyNFT(pairId);
    } catch (err) {
      console.error('Buy failed:', err);
      setBuyStep('idle');
      toastError(err);
    }
  };

  // Wait for TGR approval to be confirmed, then buy
  useEffect(() => {
    if (buyStep === 'approve' && isTGRApprovalConfirmed) {
      toastSuccess('Approval confirmed');
      setBuyStep('buy');
      try {
        buyNFT(pairId!);
      } catch (err) {
        console.error('Buy failed:', err);
        setBuyStep('idle');
        toastError(err);
      }
    }
  }, [buyStep, isTGRApprovalConfirmed, pairId, buyNFT]);

  const handleList = async () => {
    if (!listPrice) {
      toastWarning('Please enter a price');
      return;
    }

    // Step 1: Check if approval is needed
    if (!isNFTApprovedForMarket) {
      setListStep('approve');
      try {
        approveNFTForMarket(MARKET_ADDRESS, tokenId);
      } catch (err: any) {
        console.error('Approval failed:', err);
        setListStep('idle');
        toastError(err);
        return;
      }
      return;
    }

    // Step 2: List NFT if already approved
    setListStep('list');
    try {
      listNFT(collection, tokenId, listPrice);
    } catch (err: any) {
      console.error('List failed:', err);
      setListStep('idle');
      toastError(err);
    }
  };

  // Wait for approval to be confirmed, then list
  useEffect(() => {
    if (listStep === 'approve' && isNFTApprovalConfirmed) {
      toastSuccess('NFT approved successfully');
      setListStep('list');
      try {
        listNFT(collection, tokenId, listPrice);
      } catch (err: any) {
        console.error('List failed:', err);
        setListStep('idle');
        toastError(err);
      }
    }
  }, [listStep, isNFTApprovalConfirmed, collection, tokenId, listPrice, listNFT]);

  // Handle errors
  useEffect(() => {
    if (approveNFTError && listStep === 'approve') {
      console.error('Approval error:', approveNFTError);
      setListStep('idle');
      toastError(approveNFTError);
    }
  }, [approveNFTError, listStep]);

  useEffect(() => {
    if (listError && listStep === 'list') {
      console.error('List error:', listError);
      setListStep('idle');
      toastError(listError);
    }
  }, [listError, listStep]);

  const handleUpdatePrice = async () => {
    if (!pairId || !newPrice) {
      toastWarning('Please enter a new price');
      return;
    }
    updatePrice(pairId, newPrice);
    // Don't close modal immediately - wait for confirmation
  };

  const handleDelist = async () => {
    if (!pairId) return;
    delist(pairId);
  };

  if (!address) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">Please connect your wallet to interact with this NFT</p>
      </div>
    );
  }

  return (
    <>
      {/* Global backdrop to prevent interaction during operations */}
      {isAnyOperationPending && (
        <LoadingOverlay
          text={
            isBuying || isBuyingConfirming ? 'Processing purchase...' :
            isListing || isListingConfirming ? 'Listing NFT...' :
            isDelisting || isDelistingConfirming ? 'Delisting NFT...' :
            isUpdatingPrice || isUpdatingPriceConfirming ? 'Updating price...' :
            isApprovingNFT || isApprovingNFTConfirming ? 'Approving NFT...' :
            isApproving || isApprovingConfirming ? 'Approving transaction...' :
            'Processing transaction...'
          }
        />
      )}

      <div className={`bg-gray-800 border border-gray-700/50 rounded-xl shadow-md p-4 sm:p-6 space-y-4 ${isAnyOperationPending ? 'pointer-events-none opacity-50' : ''}`}>
      {isListed && price && (
        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-gray-400 mb-2">Current Price</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary-400">
            {formatEther(price)} TGR
          </p>
        </div>
      )}

      {/* Buy button for non-owners when NFT is listed */}
      {isListed && !isOwner && !isInAuction && (
        <button
          onClick={handleBuy}
          disabled={isAnyOperationPending}
          className="w-full bg-primary-600 text-white px-6 py-3 sm:py-4 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          {buyStep === 'approve' && (isApproving || isApprovingConfirming)
            ? (isApproving ? 'Waiting for approval...' : 'Approving...')
            : buyStep === 'buy' && (isBuying || isBuyingConfirming)
            ? (isBuying ? 'Waiting for confirmation...' : 'Processing purchase...')
            : 'Buy Now'}
        </button>
      )}

      {/* If NFT is in auction, show View Auction button for everyone */}
      {isInAuction && auctionId && (
        <Link
          href={`/auction/${auctionId}`}
          className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 text-center transition-colors"
        >
          {isOwner ? 'View & Manage Auction' : 'View Auction & Place Bid'}
        </Link>
      )}

      {/* Owner actions when NFT is listed (can update price or delist) */}
      {isOwner && isListed && !isInAuction && (
        <div className="space-y-3">
          <button
            onClick={() => setShowPriceModal(true)}
            disabled={isUpdatingPrice}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdatingPrice ? 'Updating...' : 'Update Price'}
          </button>
          <button
            onClick={handleDelist}
            disabled={isDelisting}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDelisting ? 'Delisting...' : 'Delist NFT'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            After delisting, you can create an auction from this page
          </p>
        </div>
      )}

      {/* Owner actions when NFT is NOT listed and NOT in auction */}
      {isOwner && !isListed && !isInAuction && (
        <div className="space-y-3">
          <button
            onClick={() => setShowListModal(true)}
            disabled={isListing}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isListing ? 'Listing...' : 'List for Sale'}
          </button>
          <button
            onClick={() => setShowAuctionModal(true)}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Auction
          </button>
        </div>
      )}

      {!isOwner && !isListed && !isInAuction && address && (
        <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-sm text-gray-400">
          <p>You are not the owner of this NFT. Only the owner can list it for sale or create an auction.</p>
        </div>
      )}

      {/* List Modal */}
      {showListModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4" 
          onClick={(e) => {
            if (e.target === e.currentTarget && !isAnyOperationPending) {
              setShowListModal(false);
              setListPrice('');
              setListStep('idle');
            }
          }}
        >
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-white">List NFT for Sale</h3>
            
            {(approveNFTError || listError) && (
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 mb-4 text-sm text-red-300">
                {approveNFTError ? 'Approval failed. Please try again.' : 'Failed to list NFT. Please try again.'}
              </div>
            )}

            {!isNFTApprovedForMarket && listStep === 'idle' && (
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 mb-4 text-sm text-yellow-300">
                You need to approve the marketplace before listing. Click "List" to approve first.
              </div>
            )}

            <input
              type="number"
              step="0.0001"
              placeholder="Price in TGR"
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              disabled={isAnyOperationPending}
              className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 mb-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <div className="flex space-x-4">
              <button
                onClick={handleList}
                disabled={isAnyOperationPending || !listPrice}
                className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2.5 rounded-lg hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/40 font-medium"
              >
                {listStep === 'approve' && (isApprovingNFT || isApprovingNFTConfirming)
                  ? (isApprovingNFT ? 'Waiting for approval...' : 'Approving...')
                  : listStep === 'list' && (isListing || isListingConfirming)
                  ? (isListing ? 'Waiting for confirmation...' : 'Listing...')
                  : 'List'}
              </button>
              <button
                onClick={() => {
                  if (!isAnyOperationPending) {
                    setShowListModal(false);
                    setListPrice('');
                    setListStep('idle');
                  }
                }}
                disabled={isAnyOperationPending}
                className="flex-1 bg-gray-700/50 text-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-700 border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {showPriceModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4" 
          onClick={(e) => {
            if (e.target === e.currentTarget && !isUpdatingPrice && !isUpdatingPriceConfirming) {
              setShowPriceModal(false);
            }
          }}
        >
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-white">Update Price</h3>
            <input
              type="number"
              step="0.0001"
              placeholder="New price in TGR"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              disabled={isUpdatingPrice || isUpdatingPriceConfirming}
              className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 mb-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <div className="flex space-x-4">
              <button
                onClick={handleUpdatePrice}
                disabled={isUpdatingPrice || isUpdatingPriceConfirming || !newPrice}
                className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2.5 rounded-lg hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/40 font-medium"
              >
                {isUpdatingPrice || isUpdatingPriceConfirming ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={() => {
                  if (!isUpdatingPrice && !isUpdatingPriceConfirming) {
                    setShowPriceModal(false);
                    setNewPrice('');
                  }
                }}
                disabled={isUpdatingPrice || isUpdatingPriceConfirming}
                className="flex-1 bg-gray-700/50 text-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-700 border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Auction Modal */}
      {showAuctionModal && (
        <CreateAuctionModal
          collection={collection}
          tokenId={tokenId}
          onClose={() => {
            if (!isAnyOperationPending) {
              setShowAuctionModal(false);
            }
          }}
          onStatusChange={onStatusChange}
        />
      )}
      </div>
    </>
  );
}

