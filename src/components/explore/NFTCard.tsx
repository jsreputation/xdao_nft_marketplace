'use client';

import Link from 'next/link';
import { memo } from 'react';
import { IPFSImage } from '@/components/common/IPFSImage';
import { formatEther } from 'viem';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { useNFTDetails } from '@/hooks/useSubgraph';
import { Address } from 'viem';

interface NFTCardProps {
  pair: {
    id: string;
    collection: Address;
    tokenId: bigint;
    price: bigint;
    owner: Address;
    bValid: boolean;
  };
}

function NFTCardComponent({ pair }: NFTCardProps) {
  // Fetch item metadata to get the URI
  const { data: itemData } = useNFTDetails(pair.collection, pair.tokenId);
  const item = itemData?.items?.[0];
  const { metadata, getImageUrl } = useIPFSMetadata(item?.uri);
  
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';
  
  return (
    <Link
      href={`/nft/${pair.collection}/${pair.tokenId}`}
      className="group relative bg-gray-800 border border-gray-700/50 rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-in"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-purple-500/0 to-secondary-500/0 group-hover:from-primary-500/20 group-hover:via-purple-500/20 group-hover:to-secondary-500/20 transition-all duration-500 rounded-2xl -z-10 blur-xl"></div>
      
      <div className="relative aspect-square bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700 overflow-hidden">
        {imageUrl && metadata?.image ? (
          <>
            <IPFSImage
              src={metadata.image}
              alt={metadata.name || `NFT #${pair.tokenId}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Shimmer overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center p-4 animate-pulse-slow">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs sm:text-sm">Token #{pair.tokenId.toString()}</p>
            </div>
          </div>
        )}
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Price badge on hover */}
        <div className="absolute top-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          <div className="bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-primary-500/30">
            <p className="text-primary-400 font-bold text-sm">
              {formatEther(pair.price)} TGR
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-5 relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/0 to-purple-900/0 group-hover:from-primary-900/20 group-hover:to-purple-900/20 transition-all duration-500 rounded-b-2xl"></div>
        
        <div className="relative z-10">
          <p className="text-xs text-gray-400 mb-1.5 font-medium">Token #{pair.tokenId.toString()}</p>
          <p className="font-bold text-base sm:text-lg mb-4 text-white group-hover:text-primary-400 transition-colors duration-300 truncate">
            {metadata?.name || `NFT #${pair.tokenId.toString()}`}
          </p>
          <div className="flex justify-between items-center">
            <div className="transform group-hover:scale-105 transition-transform duration-300">
              <p className="text-xs text-gray-400 mb-1 font-medium">Price</p>
              <p className="text-primary-400 font-bold text-lg bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                {formatEther(pair.price)} TGR
              </p>
            </div>
            {pair.bValid && (
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                For Sale
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export const NFTCard = memo(NFTCardComponent, (prevProps, nextProps) => {
  // Only re-render if pair data actually changes
  return (
    prevProps.pair.id === nextProps.pair.id &&
    prevProps.pair.price === nextProps.pair.price &&
    prevProps.pair.bValid === nextProps.pair.bValid &&
    prevProps.pair.owner === nextProps.pair.owner
  );
});
