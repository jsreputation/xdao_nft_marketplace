import { Address } from 'viem';

export interface Collection {
  id: string;
  address: Address;
  name: string;
  uri: string;
  owner: Address;
  verified: boolean;
  totalItems: bigint;
  totalVolume: bigint;
  floorPrice: bigint;
  totalSales: bigint;
}

export interface NFT {
  id: string;
  collection: Address;
  tokenId: bigint;
  uri: string;
  creator: Address;
  owner: Address;
  royalty: bigint;
}

export interface Listing {
  id: string;
  collection: Address;
  tokenId: bigint;
  price: bigint;
  owner: Address;
  creator: Address;
  creatorFee: bigint;
  bValid: boolean;
  offerCount: bigint;
}

export interface Offer {
  id: string;
  offerId: bigint;
  pairId: bigint;
  offerer: Address;
  amount: bigint;
  isActive: boolean;
  accepted: boolean;
  cancelled: boolean;
}

export interface Auction {
  id: string;
  collection: Address;
  tokenId: bigint;
  startTime: bigint;
  endTime: bigint;
  startPrice: bigint;
  creator: Address;
  owner: Address;
  active: boolean;
  currentBid: bigint;
  currentBidder: Address;
  bidCount: bigint;
}

export interface Bid {
  id: string;
  auctionId: bigint;
  from: Address;
  bidPrice: bigint;
  timestamp: bigint;
}

export interface Event {
  id: string;
  name: string;
  collection: Address;
  tokenId: bigint;
  from: string;
  to: string;
  price: bigint;
  timestamp: bigint;
  txhash: string;
}

export interface User {
  id: string;
  totalVolume: bigint;
  totalSales: bigint;
  totalPurchases: bigint;
  totalListings: bigint;
  totalCollections: bigint;
}

