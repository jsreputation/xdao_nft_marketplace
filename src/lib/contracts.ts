import { Address } from 'viem';
import TheXdaoMarketABI from '@/contracts/abis/TheXdaoMarket.json';
import TheXdaoAuctionABI from '@/contracts/abis/TheXdaoAuction.json';
import TheXdaoNFTABI from '@/contracts/abis/TheXdaoNFT.json';
import TGRABI from '@/contracts/abis/TGR.json';

export const MARKET_ADDRESS = (process.env.NEXT_PUBLIC_MARKET_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;
export const AUCTION_ADDRESS = (process.env.NEXT_PUBLIC_AUCTION_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;
export const TGR_ADDRESS = (process.env.NEXT_PUBLIC_TGR_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;

export const marketContract = {
  address: MARKET_ADDRESS,
  abi: TheXdaoMarketABI.abi,
} as const;

export const auctionContract = {
  address: AUCTION_ADDRESS,
  abi: TheXdaoAuctionABI.abi,
} as const;

export const tgrContract = {
  address: TGR_ADDRESS,
  abi: TGRABI.abi,
} as const;

export function getNFTContract(address: Address) {
  return {
    address,
    abi: TheXdaoNFTABI.abi,
  } as const;
}

