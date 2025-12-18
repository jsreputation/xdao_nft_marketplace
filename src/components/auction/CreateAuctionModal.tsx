'use client';

import { useState, useEffect } from 'react';
import { useCreateAuction } from '@/hooks/useAuction';
import { useApproveNFT } from '@/hooks/useNFT';
import { useAccount } from 'wagmi';
import { AUCTION_ADDRESS } from '@/lib/contracts';
import { Address } from 'viem';
import { toastError, toastSuccess, toastWarning } from '@/lib/toast';

interface CreateAuctionModalProps {
  collection: Address;
  tokenId: bigint;
  onClose: () => void;
  onStatusChange?: () => void;
}

export function CreateAuctionModal({ collection, tokenId, onClose, onStatusChange }: CreateAuctionModalProps) {
  const { address } = useAccount();
  const { createAuction, isPending: isCreatingPending, isConfirming: isCreatingConfirming, isConfirmed: isAuctionCreated, error: createError } = useCreateAuction();
  const { approveNFT, isPending: isApprovingPending, isConfirming: isApprovingConfirming, isConfirmed: isApprovalConfirmed, error: approveError } = useApproveNFT(collection);

  const [formData, setFormData] = useState({
    startPrice: '',
    startTime: '',
    endTime: '',
  });

  const [step, setStep] = useState<'approve' | 'create' | 'idle'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toastWarning('Please connect your wallet');
      return;
    }

    if (!formData.startPrice || !formData.endTime) {
      toastWarning('Please fill in all required fields');
      return;
    }

    // Validate end time is in the future
    const endTimeMs = new Date(formData.endTime).getTime();
    const now = Date.now();
    if (endTimeMs <= now) {
      toastWarning('End time must be in the future');
      return;
    }

    // Validate start time if provided
    if (formData.startTime) {
      const startTimeMs = new Date(formData.startTime).getTime();
      if (startTimeMs <= now) {
        toastWarning('Start time must be in the future');
        return;
      }
      if (startTimeMs >= endTimeMs) {
        toastWarning('Start time must be before end time');
        return;
      }
    }

    // Step 1: Approve NFT transfer
    setStep('approve');
    try {
      approveNFT(AUCTION_ADDRESS, tokenId);
    } catch (err: any) {
      console.error('Approval failed:', err);
      setStep('idle');
      toastError(err);
      return;
    }
  };

  // Wait for approval to be confirmed, then create auction
  useEffect(() => {
    if (step === 'approve' && isApprovalConfirmed) {
      toastSuccess('NFT approved successfully');
      // Calculate timestamps
      const now = Math.floor(Date.now() / 1000);
      const startTime = formData.startTime
        ? BigInt(Math.floor(new Date(formData.startTime).getTime() / 1000))
        : BigInt(now);
      const endTime = BigInt(Math.floor(new Date(formData.endTime).getTime() / 1000));

      setStep('create');
      try {
        createAuction(collection, tokenId, formData.startPrice, startTime, endTime);
      } catch (err: any) {
        console.error('Create auction failed:', err);
        setStep('idle');
        toastError(err);
      }
    }
  }, [step, isApprovalConfirmed, collection, tokenId, formData.startPrice, formData.startTime, formData.endTime, createAuction]);

  // Handle auction creation success
  useEffect(() => {
    if (isAuctionCreated) {
      toastSuccess('Auction created successfully');
      if (onStatusChange) {
        setTimeout(() => {
          onStatusChange();
        }, 2000);
      }
      onClose();
    }
  }, [isAuctionCreated, onClose, onStatusChange]);

  // Handle errors - reset step if transaction is rejected or fails
  useEffect(() => {
    if (approveError && step === 'approve') {
      console.error('Approval error:', approveError);
      setStep('idle');
      toastError(approveError);
    }
  }, [approveError, step]);

  useEffect(() => {
    if (createError && step === 'create') {
      console.error('Create auction error:', createError);
      setStep('idle');
      toastError(createError);
    }
  }, [createError, step]);

  const isProcessing = isApprovingPending || isApprovingConfirming || isCreatingPending || isCreatingConfirming;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4 text-white">Create Auction</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Starting Price (TGR) *
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.startPrice}
              onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
              disabled={isProcessing}
              className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Time (optional, defaults to now)
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              disabled={isProcessing}
              className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Time *
            </label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              disabled={isProcessing}
              className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              required
            />
          </div>

          {(approveError || createError) && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-sm text-red-300">
              {approveError ? 'Approval failed. Please try again.' : 'Failed to create auction. Please try again.'}
            </div>
          )}

          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/40"
            >
              {step === 'approve' && (isApprovingPending || isApprovingConfirming) 
                ? (isApprovingPending ? 'Waiting for approval...' : 'Approving...')
                : step === 'create' && (isCreatingPending || isCreatingConfirming)
                ? (isCreatingPending ? 'Waiting for confirmation...' : 'Creating auction...')
                : 'Create Auction'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 bg-gray-700/50 text-gray-300 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-700 border border-gray-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

