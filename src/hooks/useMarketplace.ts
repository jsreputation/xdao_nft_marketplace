'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { marketContract, tgrContract } from '@/lib/contracts';
import { Address, parseEther } from 'viem';
import { useState } from 'react';

export function useCreateCollection() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const createCollection = async (name: string, uri: string, isPublic: boolean) => {
    writeContract({
      ...marketContract,
      functionName: 'createCollection',
      args: [name, uri, isPublic],
    });
  };

  return {
    createCollection,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useListNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const listNFT = async (collection: Address, tokenId: bigint, price: string) => {
    writeContract({
      ...marketContract,
      functionName: 'list',
      args: [collection, tokenId, parseEther(price)],
    });
  };

  return {
    listNFT,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useBuyNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const buyNFT = async (pairId: bigint) => {
    writeContract({
      ...marketContract,
      functionName: 'buy',
      args: [pairId],
    });
  };

  return {
    buyNFT,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useCreateOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const createOffer = async (pairId: bigint, amount: string) => {
    writeContract({
      ...marketContract,
      functionName: 'createOffer',
      args: [pairId, parseEther(amount)],
    });
  };

  return {
    createOffer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useAcceptOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const acceptOffer = async (offerId: bigint) => {
    writeContract({
      ...marketContract,
      functionName: 'acceptOffer',
      args: [offerId],
    });
  };

  return {
    acceptOffer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useCancelOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const cancelOffer = async (offerId: bigint) => {
    writeContract({
      ...marketContract,
      functionName: 'cancelOffer',
      args: [offerId],
    });
  };

  return {
    cancelOffer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useUpdatePrice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const updatePrice = async (pairId: bigint, newPrice: string) => {
    writeContract({
      ...marketContract,
      functionName: 'updatePrice',
      args: [pairId, parseEther(newPrice)],
    });
  };

  return {
    updatePrice,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useDelist() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const delist = async (pairId: bigint) => {
    writeContract({
      ...marketContract,
      functionName: 'delist',
      args: [pairId],
    });
  };

  return {
    delist,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useApproveTGR() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const approveTGR = async (spender: Address, amount: bigint) => {
    writeContract({
      ...tgrContract,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return {
    approveTGR,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useTGRBalance(address?: Address) {
  const { data: balance, isLoading, error } = useReadContract({
    ...tgrContract,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { balance, isLoading, error };
}

export function useTGRAllowance(owner?: Address, spender?: Address) {
  const { data: allowance, isLoading, error, refetch } = useReadContract({
    ...tgrContract,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender,
    },
  });

  return { allowance, isLoading, error, refetch };
}

