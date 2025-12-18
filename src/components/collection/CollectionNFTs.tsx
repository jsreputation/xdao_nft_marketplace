'use client';

import Link from 'next/link';
import { IPFSImage } from '@/components/common/IPFSImage';
import { formatEther } from 'viem';
import { useNFTs, useNFTDetails } from '@/hooks/useSubgraph';
import { Address } from 'viem';
import { useIPFSMetadata } from '@/hooks/useIPFS';

interface CollectionNFTsProps {
  collectionAddress: Address;
}

export function CollectionNFTs({ collectionAddress }: CollectionNFTsProps) {
  const { data, loading, error } = useNFTs({
    where: { collection: collectionAddress.toLowerCase() },
    first: 50,
  });

  const nfts = data?.pairs || [];

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading NFTs: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">NFTs in Collection</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{nfts.length} items</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {nfts.map((pair: any) => (
          <NFTItemCard key={pair.id} pair={pair} />
        ))}
      </div>
    </div>
  );
}

function NFTItemCard({ pair }: { pair: any }) {
  const { data: itemData } = useNFTDetails(pair.collection, pair.tokenId);
  const item = itemData?.items?.[0];
  const { metadata, getImageUrl } = useIPFSMetadata(item?.uri);
  
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <Link
      href={`/nft/${pair.collection}/${pair.tokenId}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden card-hover"
    >
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
        {imageUrl && metadata?.image ? (
          <IPFSImage
            src={metadata.image}
            alt={metadata.name || `NFT #${pair.tokenId}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs sm:text-sm">Token #{pair.tokenId}</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="font-semibold text-sm sm:text-base mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
          {metadata?.name || `NFT #${pair.tokenId}`}
        </p>
        {pair.bValid && (
          <p className="text-primary-600 dark:text-primary-400 font-bold text-sm sm:text-base">
            {formatEther(pair.price)} TGR
          </p>
        )}
      </div>
    </Link>
  );
}

