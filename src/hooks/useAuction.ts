'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { auctionContract } from '@/lib/contracts';
import { Address, parseEther } from 'viem';

export function useCreateAuction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const createAuction = async (
    collection: Address,
    tokenId: bigint,
    startPrice: string,
    startTime: bigint,
    endTime: bigint
  ) => {
    writeContract({
      ...auctionContract,
      functionName: 'createAuction',
      args: [collection, tokenId, parseEther(startPrice), startTime, endTime],
    });
  };

  return {
    createAuction,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function usePlaceBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const placeBid = async (auctionId: bigint, amount: string) => {
    writeContract({
      ...auctionContract,
      functionName: 'bidOnAuction',
      args: [auctionId, parseEther(amount)],
    });
  };

  return {
    placeBid,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useFinalizeAuction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const finalizeAuction = async (auctionId: bigint) => {
    writeContract({
      ...auctionContract,
      functionName: 'finalizeAuction',
      args: [auctionId],
    });
  };

  return {
    finalizeAuction,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useAuctionDetails(auctionId?: bigint) {
  const { data: auction, isLoading, error } = useReadContract({
    ...auctionContract,
    functionName: 'auctions',
    args: auctionId !== undefined ? [auctionId] : undefined,
    query: {
      enabled: auctionId !== undefined,
    },
  });

  return { auction, isLoading, error };
}

export function useCurrentBid(auctionId?: bigint) {
  const { data, isLoading, error } = useReadContract({
    ...auctionContract,
    functionName: 'getCurrentBids',
    args: auctionId !== undefined ? [auctionId] : undefined,
    query: {
      enabled: auctionId !== undefined,
    },
  });

  const result = data as [bigint, Address] | undefined;

  return {
    amount: result?.[0],
    bidder: result?.[1],
    isLoading,
    error,
  };
}

