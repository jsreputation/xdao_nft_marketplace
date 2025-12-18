'use client';

import { useState, useEffect, useRef } from 'react';
import { useCreateOffer } from '@/hooks/useMarketplace';
import { useTGRBalance, useApproveTGR, useTGRAllowance } from '@/hooks/useMarketplace';
import { useAccount } from 'wagmi';
import { MARKET_ADDRESS } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';
import { toastError, toastSuccess, toastWarning } from '@/lib/toast';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';

interface MakeOfferModalProps {
  pairId: bigint;
  currentPrice?: bigint;
  onClose: () => void;
  onOfferSuccess?: () => void;
}

export function MakeOfferModal({ pairId, currentPrice, onClose, onOfferSuccess }: MakeOfferModalProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'idle' | 'approve' | 'create'>('idle');
  
  const { createOffer, isPending: isCreatingOffer, isConfirming: isCreatingOfferConfirming, isConfirmed: isOfferConfirmed, error: createOfferError } = useCreateOffer();
  const { balance } = useTGRBalance(address);
  const { approveTGR, isPending: isApproving, isConfirming: isApprovingConfirming, isConfirmed: isApprovalConfirmed, error: approveError } = useApproveTGR();
  const { allowance, refetch: refetchAllowance } = useTGRAllowance(address, MARKET_ADDRESS);

  // Track if we've shown notifications to prevent duplicates
  const offerNotificationShown = useRef(false);

  // Reset notification flag when offer state resets
  useEffect(() => {
    if (!isOfferConfirmed && !isCreatingOffer && !isCreatingOfferConfirming) {
      offerNotificationShown.current = false;
    }
  }, [isOfferConfirmed, isCreatingOffer, isCreatingOfferConfirming]);

  // Handle offer creation success
  useEffect(() => {
    if (isOfferConfirmed && !offerNotificationShown.current) {
      offerNotificationShown.current = true;
      setStep('idle');
      setAmount('');
      toastSuccess('Offer created successfully');
      // Call the success callback to trigger refetch with multiple attempts
      if (onOfferSuccess) {
        // Trigger immediate refetch attempts to catch the new offer
        onOfferSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isOfferConfirmed, onClose, onOfferSuccess]);

  // Handle approval confirmation - then create offer
  useEffect(() => {
    if (step === 'approve' && isApprovalConfirmed) {
      // Wait a bit for allowance to update, then check and create offer
      setTimeout(async () => {
        await refetchAllowance();
        setStep('create');
        try {
          createOffer(pairId, amount);
        } catch (err) {
          console.error('Create offer failed:', err);
          setStep('idle');
          toastError(err);
        }
      }, 2000);
    }
  }, [step, isApprovalConfirmed, pairId, amount, createOffer, refetchAllowance]);

  // Handle errors
  useEffect(() => {
    if (approveError && step === 'approve') {
      console.error('Approval error:', approveError);
      setStep('idle');
      toastError(approveError);
    }
  }, [approveError, step]);

  useEffect(() => {
    if (createOfferError && step === 'create') {
      console.error('Create offer error:', createOfferError);
      setStep('idle');
      toastError(createOfferError);
    }
  }, [createOfferError, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toastWarning('Please enter an offer amount');
      return;
    }

    const offerAmount = parseEther(amount);
    
    // Check balance
    if (!balance || typeof balance !== 'bigint' || balance < offerAmount) {
      toastError('Insufficient balance');
      return;
    }

    // Check if approval is needed
    const currentAllowance = (allowance && typeof allowance === 'bigint') ? allowance : BigInt(0);
    if (currentAllowance < offerAmount) {
      // Need to approve first
      setStep('approve');
      try {
        // Approve a larger amount to reduce repeated approvals
        approveTGR(MARKET_ADDRESS, offerAmount * BigInt(1000));
      } catch (err) {
        console.error('Approval failed:', err);
        setStep('idle');
        toastError(err);
      }
    } else {
      // Already approved, create offer directly
      setStep('create');
      try {
        createOffer(pairId, amount);
      } catch (err) {
        console.error('Create offer failed:', err);
        setStep('idle');
        toastError(err);
      }
    }
  };

  const isProcessing = step !== 'idle' || isApproving || isApprovingConfirming || isCreatingOffer || isCreatingOfferConfirming;

  return (
    <>
      {/* Loading overlay during processing */}
      {isProcessing && (
        <LoadingOverlay
          text={
            step === 'approve' && (isApproving || isApprovingConfirming)
              ? (isApproving ? 'Waiting for approval...' : 'Approving TGR...')
              : step === 'create' && (isCreatingOffer || isCreatingOfferConfirming)
              ? (isCreatingOffer ? 'Waiting for confirmation...' : 'Creating offer...')
              : 'Processing...'
          }
        />
      )}

      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Make Offer</h3>
          
          {currentPrice && (
            <p className="text-sm text-gray-300 mb-4">
              Current price: <span className="font-semibold text-primary-400">{formatEther(currentPrice)} TGR</span>
            </p>
          )}

          {(approveError || createOfferError) && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 mb-4 text-sm text-red-300">
              {approveError ? 'Approval failed. Please try again.' : 'Failed to create offer. Please try again.'}
            </div>
          )}

          {(() => {
            const currentAllowance = allowance && typeof allowance === 'bigint' ? allowance : null;
            return currentAllowance && currentAllowance > BigInt(0) ? (
              <div className="bg-primary-900/20 border border-primary-800/50 rounded-lg p-3 mb-4 text-sm text-primary-300">
                Approved allowance: <span className="font-semibold">{formatEther(currentAllowance)} TGR</span>
              </div>
            ) : null;
          })()}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Offer Amount (TGR)
              </label>
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                placeholder="0.0"
                required
              />
              {balance && typeof balance === 'bigint' ? (
                <p className="text-xs text-gray-400 mt-1.5">
                  Balance: <span className="text-gray-300 font-medium">{formatEther(balance)} TGR</span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={isProcessing || !amount}
                className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2.5 sm:py-3 rounded-lg hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm sm:text-base shadow-lg shadow-primary-500/40"
              >
                {step === 'approve' && (isApproving || isApprovingConfirming)
                  ? (isApproving ? 'Waiting for approval...' : 'Approving...')
                  : step === 'create' && (isCreatingOffer || isCreatingOfferConfirming)
                  ? (isCreatingOffer ? 'Waiting for confirmation...' : 'Creating offer...')
                  : 'Make Offer'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 bg-gray-700/50 text-gray-300 px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

