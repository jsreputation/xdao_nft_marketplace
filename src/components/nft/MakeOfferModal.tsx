'use client';

import { useState, useEffect } from 'react';
import { useCreateOffer } from '@/hooks/useMarketplace';
import { useTGRBalance } from '@/hooks/useMarketplace';
import { useAccount } from 'wagmi';
import { MARKET_ADDRESS } from '@/lib/contracts';
import { parseEther, formatEther } from 'viem';
import { useApproveTGR } from '@/hooks/useMarketplace';
import { toastError, toastSuccess, toastWarning } from '@/lib/toast';

interface MakeOfferModalProps {
  pairId: bigint;
  currentPrice?: bigint;
  onClose: () => void;
}

export function MakeOfferModal({ pairId, currentPrice, onClose }: MakeOfferModalProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const { createOffer, isPending, isConfirmed } = useCreateOffer();
  const { balance } = useTGRBalance(address);
  const { approveTGR, isPending: isApproving } = useApproveTGR();

  useEffect(() => {
    if (isConfirmed) {
      toastSuccess('Offer created successfully');
      onClose();
    }
  }, [isConfirmed, onClose]);

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

    // Approve if needed
    try {
      await approveTGR(MARKET_ADDRESS, offerAmount);
    } catch (err) {
      console.error('Approval failed:', err);
      toastError(err);
      return;
    }

    // Create offer
    createOffer(pairId, amount);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Make Offer</h3>
        
        {currentPrice && (
          <p className="text-sm text-gray-300 mb-4">
            Current price: <span className="font-semibold text-primary-400">{formatEther(currentPrice)} TGR</span>
          </p>
        )}

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
              className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
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
              disabled={isPending || isApproving || !amount}
              className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2.5 sm:py-3 rounded-lg hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 transition-all font-semibold text-sm sm:text-base shadow-lg shadow-primary-500/40"
            >
              {isApproving ? 'Approving...' : isPending ? 'Creating Offer...' : 'Make Offer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700/50 text-gray-300 px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 border border-gray-600/50 transition-all font-semibold text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

