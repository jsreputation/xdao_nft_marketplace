'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { getNFTContract } from '@/lib/contracts';
import { Address, parseEther } from 'viem';

export function useMintNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const mintNFT = async (collectionAddress: Address, tokenURI: string, royalty: number) => {
    // Royalty is in basis points (50-100, where 100 = 10%)
    writeContract({
      ...getNFTContract(collectionAddress),
      functionName: 'addItem',
      args: [tokenURI, BigInt(royalty)],
    });
  };

  return {
    mintNFT,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useNFTDetails(collectionAddress?: Address, tokenId?: bigint) {
  const { data: item, isLoading, error } = useReadContract({
    ...getNFTContract(collectionAddress!),
    functionName: 'Items',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!collectionAddress && tokenId !== undefined,
    },
  });

  return { item, isLoading, error };
}

export function useNFTOwner(collectionAddress?: Address, tokenId?: bigint) {
  const { data: owner, isLoading, error } = useReadContract({
    ...getNFTContract(collectionAddress!),
    functionName: 'ownerOf',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!collectionAddress && tokenId !== undefined,
    },
  });

  return { owner, isLoading, error };
}

export function useApproveNFT(collectionAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const approveNFT = async (spender: Address, tokenId: bigint) => {
    writeContract({
      ...getNFTContract(collectionAddress),
      functionName: 'approve',
      args: [spender, tokenId],
    });
  };

  return {
    approveNFT,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useNFTApproval(collectionAddress?: Address, tokenId?: bigint, spender?: Address) {
  const { data: approvedAddress, isLoading, error } = useReadContract({
    ...getNFTContract(collectionAddress!),
    functionName: 'getApproved',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!collectionAddress && tokenId !== undefined,
    },
  });

  const isApproved = spender && approvedAddress 
    ? (approvedAddress as Address).toLowerCase() === spender.toLowerCase()
    : false;

  return { isApproved, approvedAddress, isLoading, error };
}

