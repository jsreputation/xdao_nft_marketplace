'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { usePlaceBid } from '@/hooks/useAuction';
import { useTGRBalance, useApproveTGR } from '@/hooks/useMarketplace';
import { useAccount } from 'wagmi';
import { AUCTION_ADDRESS } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';
import { toastError, toastSuccess, toastWarning } from '@/lib/toast';
import { useReadContract } from 'wagmi';
import { tgrContract } from '@/lib/contracts';

interface PlaceBidButtonProps {
  auctionId: bigint;
  currentBid: bigint;
  startPrice: bigint;
  onBidSuccess?: () => void;
}

export function PlaceBidButton({ auctionId, currentBid, startPrice, onBidSuccess }: PlaceBidButtonProps) {
  const { address } = useAccount();
  const { placeBid, isPending, isConfirmed, error: placeBidError } = usePlaceBid();
  const { balance } = useTGRBalance(address);
  const { approveTGR, isPending: isApproving, isConfirmed: isApprovalConfirmed, error: approveError } = useApproveTGR();
  const [showModal, setShowModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [step, setStep] = useState<'idle' | 'approve' | 'bid'>('idle');

  // Check current TGR allowance for auction contract
  const { data: allowance, refetch: refetchAllowance, isLoading: isLoadingAllowance } = useReadContract({
    ...tgrContract,
    functionName: 'allowance',
    args: address && AUCTION_ADDRESS && AUCTION_ADDRESS !== '0x0000000000000000000000000000000000000000' ? [address, AUCTION_ADDRESS] : undefined,
    query: {
      enabled: !!address && !!AUCTION_ADDRESS && AUCTION_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Refetch allowance when step changes to 'approve'
  useEffect(() => {
    if (step === 'approve' && refetchAllowance) {
      const interval = setInterval(() => {
        refetchAllowance();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [step, refetchAllowance]);

  // Calculate minimum bid (current bid + 5%) - use useMemo to prevent recalculation on every render
  const minBid = useMemo(() => {
    if (!currentBid || typeof currentBid !== 'bigint') {
      // If no current bid, use start price
      if (!startPrice || typeof startPrice !== 'bigint') {
        return BigInt(0);
      }
      return startPrice;
    }
    // Calculate 5% increment: currentBid + (currentBid * 5 / 100)
    const increment = (currentBid * BigInt(5)) / BigInt(100);
    return currentBid + increment;
  }, [currentBid, startPrice]);

  useEffect(() => {
    if (isConfirmed) {
      toastSuccess('Bid placed successfully');
      setShowModal(false);
      setBidAmount('');
      setStep('idle');
      // Trigger refetch of bid history and auction data
      if (onBidSuccess) {
        onBidSuccess();
      }
    }
  }, [isConfirmed, onBidSuccess]);

  // Handle errors from approval
  useEffect(() => {
    if (approveError && step === 'approve') {
      console.error('Approval error:', approveError);
      toastError(approveError);
      setStep('idle');
    }
  }, [approveError, step]);

  // Handle errors from placing bid
  useEffect(() => {
    if (placeBidError && step === 'bid') {
      console.error('Place bid error:', placeBidError);
      console.error('Error details:', {
        error: placeBidError,
        step,
        auctionId: auctionId.toString(),
        bidAmount,
        allowance: allowance?.toString() || '0',
        balance: balance?.toString() || '0',
      });
      toastError(placeBidError);
      setStep('idle');
    }
  }, [placeBidError, step, auctionId, bidAmount]);

  // Stable callback for placing bid after approval
  const handleBidAfterApproval = useCallback(async () => {
    if (!bidAmount) return;
    
    toastSuccess('Approval confirmed');
    // Wait a bit for the blockchain state to update, then check allowance and place bid
    // Wait for transaction to be mined and state to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Refetch allowance to get updated value
    const { data: updatedAllowance } = await refetchAllowance();
    
    // Verify allowance is sufficient
    try {
      const amount = parseEther(bidAmount);
      const currentAllowance = updatedAllowance && typeof updatedAllowance === 'bigint' ? updatedAllowance : BigInt(0);
      
      if (currentAllowance >= amount) {
        setStep('bid');
        placeBid(auctionId, bidAmount);
      } else {
        console.error('Allowance still insufficient after approval:', {
          currentAllowance: currentAllowance.toString(),
          required: amount.toString(),
        });
        toastError('Approval confirmed but allowance is still insufficient. Please try again.');
        setStep('idle');
      }
    } catch (err) {
      console.error('Error checking allowance after approval:', err);
      toastError('Error verifying approval. Please try again.');
      setStep('idle');
    }
  }, [bidAmount, auctionId, placeBid, refetchAllowance]);

  // Wait for approval confirmation, then place bid
  useEffect(() => {
    if (step === 'approve' && isApprovalConfirmed) {
      handleBidAfterApproval();
    }
  }, [step, isApprovalConfirmed, handleBidAfterApproval]);

  const handlePlaceBid = async () => {
    if (!bidAmount) {
      toastWarning('Please enter a bid amount');
      return;
    }

    let amount: bigint;
    try {
      amount = parseEther(bidAmount);
      
      if (amount < minBid) {
        toastWarning(`Bid must be at least ${formatEther(minBid)} TGR`);
        return;
      }

      if (!balance || typeof balance !== 'bigint' || balance < amount) {
        toastError('Insufficient balance');
        return;
      }
    } catch (err) {
      toastError('Invalid bid amount');
      return;
    }

    // Check if approval is needed
    // Wait for allowance to load if it's still loading
    if (isLoadingAllowance) {
      toastWarning('Checking approval status...');
      return;
    }

    const currentAllowance = allowance && typeof allowance === 'bigint' ? allowance : BigInt(0);
    const needsApproval = currentAllowance < amount;

    console.log('Place Bid Debug:', {
      bidAmount,
      amount: amount.toString(),
      currentAllowance: currentAllowance.toString(),
      needsApproval,
      auctionAddress: AUCTION_ADDRESS,
      isLoadingAllowance,
    });

    if (needsApproval) {
      // Step 1: Approve TGR for AUCTION_ADDRESS (not MARKET_ADDRESS!)
      // Approve a larger amount to avoid needing to approve again for subsequent bids
      setStep('approve');
      try {
        // Approve a large amount to allow for multiple bids without re-approval
        // Using max uint256 or a very large amount (amount * 1000)
        const approvalAmount = amount * BigInt(1000);
        console.log('Approving TGR:', {
          spender: AUCTION_ADDRESS,
          amount: approvalAmount.toString(),
        });
        approveTGR(AUCTION_ADDRESS, approvalAmount);
      } catch (err) {
        console.error('Approval failed:', err);
        setStep('idle');
        toastError(err);
        return;
      }
    } else {
      // Already approved, go directly to placing bid
      console.log('Already approved, placing bid directly');
      setStep('bid');
      placeBid(auctionId, bidAmount);
    }
  };

  if (!address) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
        <p className="text-yellow-300">Please connect your wallet to place a bid</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-purple-600 transition-all shadow-lg shadow-primary-500/40"
      >
        Place Bid
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Place Bid</h3>
            
            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-300">
                Current Bid: <span className="font-semibold text-primary-400">{formatEther(currentBid)} TGR</span>
              </p>
              <p className="text-sm text-gray-300">
                Minimum Bid: <span className="font-semibold text-purple-400">{formatEther(minBid)} TGR</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bid Amount (TGR)
              </label>
              <input
                type="number"
                step="0.0001"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                placeholder={formatEther(minBid)}
                min={formatEther(minBid)}
                required
              />
              {balance && typeof balance === 'bigint' ? (
                <div className="mt-1.5 space-y-1">
                  <p className="text-xs text-gray-400">
                    Balance: <span className="text-gray-300 font-medium">{formatEther(balance)} TGR</span>
                  </p>
                  {!isLoadingAllowance && allowance !== undefined && (
                    <p className="text-xs text-gray-400">
                      Approved: <span className="text-gray-300 font-medium">{formatEther(allowance && typeof allowance === 'bigint' ? allowance : BigInt(0))} TGR</span>
                    </p>
                  )}
                  {bidAmount && (() => {
                    try {
                      const bidValue = parseEther(bidAmount);
                      const isBidValid = bidValue >= minBid;
                      const hasEnoughBalance = balance >= bidValue;
                      const currentAllowance = allowance && typeof allowance === 'bigint' ? allowance : BigInt(0);
                      const hasEnoughAllowance = currentAllowance >= bidValue;
                      
                      if (!isBidValid) {
                        return (
                          <p className="text-xs text-red-400">
                            Bid must be at least {formatEther(minBid)} TGR
                          </p>
                        );
                      }
                      if (!hasEnoughBalance) {
                        return (
                          <p className="text-xs text-red-400">
                            Insufficient balance. You need {formatEther(bidValue)} TGR
                          </p>
                        );
                      }
                      if (!hasEnoughAllowance && !isLoadingAllowance) {
                        return (
                          <p className="text-xs text-yellow-400">
                            ⚠ Approval needed. Click "Place Bid" to approve first.
                          </p>
                        );
                      }
                      return (
                        <p className="text-xs text-green-400">
                          ✓ Valid bid amount
                        </p>
                      );
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              ) : (
                <p className="text-xs text-yellow-400 mt-1.5">
                  Loading balance...
                </p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handlePlaceBid}
                disabled={
                  step !== 'idle' ||
                  isPending || 
                  isApproving || 
                  !bidAmount || 
                  (() => {
                    try {
                      if (!bidAmount) return true;
                      const bidValue = parseEther(bidAmount);
                      if (bidValue < minBid) return true;
                      if (!balance || typeof balance !== 'bigint') return true;
                      if (balance < bidValue) return true;
                      return false;
                    } catch {
                      return true;
                    }
                  })()
                }
                className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2.5 rounded-lg hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/40 font-medium"
              >
                {step === 'approve' && (isApproving || isApprovalConfirmed)
                  ? (isApproving ? 'Waiting for approval...' : 'Approving...')
                  : step === 'bid' && (isPending)
                  ? 'Placing Bid...'
                  : 'Place Bid'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setBidAmount('');
                  setStep('idle');
                }}
                disabled={step !== 'idle'}
                className="flex-1 bg-gray-700/50 text-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-700 border border-gray-600/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

