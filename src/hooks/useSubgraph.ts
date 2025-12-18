'use client';

import { useQuery } from '@apollo/client';
import {
  GET_COLLECTIONS,
  GET_COLLECTION,
  GET_TOP_COLLECTIONS,
} from '@/graphql/queries/collections';
import {
  GET_NFTS,
  GET_NFT_DETAILS,
  GET_TRENDING_NFTS,
  GET_ITEMS_BY_COLLECTION,
} from '@/graphql/queries/nfts';
import {
  GET_AUCTIONS,
  GET_AUCTION,
  GET_AUCTION_BIDS,
  GET_NFT_BIDS,
} from '@/graphql/queries/auctions';
import {
  GET_OFFERS,
  GET_PAIR_OFFERS,
  GET_ALL_PAIR_OFFERS,
} from '@/graphql/queries/offers';
import {
  GET_EVENTS,
  GET_NFT_EVENTS,
  GET_NFT_PRICE_EVENTS,
} from '@/graphql/queries/events';
import {
  GET_USER,
  GET_USER_OWNED_NFTS,
  GET_USER_LISTINGS,
  GET_USER_COLLECTIONS,
} from '@/graphql/queries/users';
import { Address } from 'viem';

export function useCollections(variables?: {
  first?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: any;
  skipPolling?: boolean;
}) {
  return useQuery(GET_COLLECTIONS, {
    variables: variables || {},
    pollInterval: variables?.skipPolling ? 0 : 180000, // Poll every 3 minutes (reduced from 2)
    errorPolicy: 'all',
    fetchPolicy: 'cache-first', // Use cache first to reduce requests
    nextFetchPolicy: 'cache-first',
  });
}

export function useCollection(id: string) {
  return useQuery(GET_COLLECTION, {
    variables: { id: id.toLowerCase() },
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useTopCollections(first: number = 10, skipPolling: boolean = false) {
  return useQuery(GET_TOP_COLLECTIONS, {
    variables: { first },
    pollInterval: skipPolling ? 0 : 120000, // Poll every 2 minutes, or disable if requested
    errorPolicy: 'all',
  });
}

export function useNFTs(variables?: {
  where?: any;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  first?: number;
  skip?: number;
  skipPolling?: boolean;
}) {
  return useQuery(GET_NFTS, {
    variables,
    pollInterval: variables?.skipPolling ? 0 : 180000, // Poll every 3 minutes (reduced)
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });
}

export function useNFTDetails(collection: Address, tokenId: bigint, skipPolling: boolean = false) {
  return useQuery(GET_NFT_DETAILS, {
    variables: { collection, tokenId: tokenId.toString() },
    pollInterval: skipPolling ? 0 : 120000, // Poll every 2 minutes, or disable if requested
    errorPolicy: 'all',
    fetchPolicy: 'cache-first', // Use cache first for NFT details
  });
}

export function useTrendingNFTs(first: number = 12, skipPolling: boolean = false) {
  return useQuery(GET_TRENDING_NFTS, {
    variables: { first },
    pollInterval: skipPolling ? 0 : 120000, // Poll every 2 minutes, or disable if requested
    errorPolicy: 'all',
  });
}

export function useAuctions(variables?: {
  where?: any;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  first?: number;
  skip?: number;
  skipPolling?: boolean;
}) {
  return useQuery(GET_AUCTIONS, {
    variables,
    pollInterval: variables?.skipPolling ? 0 : 180000, // Poll every 3 minutes (reduced)
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });
}

export function useAuction(id: string) {
  return useQuery(GET_AUCTION, {
    variables: { id },
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useAuctionBids(auctionId: bigint) {
  return useQuery(GET_AUCTION_BIDS, {
    variables: { auctionId: auctionId.toString() },
    pollInterval: 90000, // Poll every 90 seconds (reduced from 60)
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });
}

export function useOffers(variables?: {
  where?: any;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}) {
  return useQuery(GET_OFFERS, {
    variables,
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function usePairOffers(pairId: bigint) {
  return useQuery(GET_PAIR_OFFERS, {
    variables: { pairId: pairId.toString() },
    pollInterval: 30000, // Poll every 30 seconds for faster updates
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // Always fetch fresh data
  });
}

export function useEvents(variables?: {
  where?: any;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  first?: number;
  skip?: number;
  skipPolling?: boolean;
}) {
  return useQuery(GET_EVENTS, {
    variables,
    pollInterval: variables?.skipPolling ? 0 : 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useNFTEvents(collection: Address, tokenId: bigint) {
  return useQuery(GET_NFT_EVENTS, {
    variables: { collection: collection.toLowerCase(), tokenId: tokenId.toString() },
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useNFTPriceEvents(collection: Address, tokenId: bigint, skipPolling?: boolean) {
  return useQuery(GET_NFT_PRICE_EVENTS, {
    variables: { collection: collection.toLowerCase(), tokenId: tokenId.toString() },
    pollInterval: skipPolling ? 0 : 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useNFTBids(collection: Address, tokenId: bigint, skipPolling?: boolean) {
  return useQuery(GET_NFT_BIDS, {
    variables: { collection: collection.toLowerCase(), tokenId: tokenId.toString() },
    pollInterval: skipPolling ? 0 : 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useAllPairOffers(pairId: bigint, skipPolling?: boolean) {
  return useQuery(GET_ALL_PAIR_OFFERS, {
    variables: { pairId: pairId.toString() },
    pollInterval: skipPolling ? 0 : 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useUser(address: Address) {
  return useQuery(GET_USER, {
    variables: { id: address.toLowerCase() },
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useUserOwnedNFTs(owner: Address, first?: number, skip?: number) {
  return useQuery(GET_USER_OWNED_NFTS, {
    variables: { owner: owner.toLowerCase(), first, skip },
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useUserListings(owner: Address, first?: number, skip?: number) {
  return useQuery(GET_USER_LISTINGS, {
    variables: { owner: owner.toLowerCase(), first, skip },
    pollInterval: 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useUserCollections(owner: Address, first?: number, skip?: number, skipPolling?: boolean) {
  return useQuery(GET_USER_COLLECTIONS, {
    variables: { owner: owner.toLowerCase(), first, skip },
    pollInterval: skipPolling ? 0 : 120000, // Poll every 2 minutes
    errorPolicy: 'all',
  });
}

export function useItemsByCollection(variables?: {
  collection: Address;
  first?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  skipPolling?: boolean;
}) {
  return useQuery(GET_ITEMS_BY_COLLECTION, {
    variables: variables ? {
      ...variables,
      collection: variables.collection.toLowerCase(),
    } : undefined,
    skip: !variables?.collection,
    pollInterval: variables?.skipPolling ? 0 : 180000, // Poll every 3 minutes
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });
}

