'use client';

import { useNFTs } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import Link from 'next/link';
import { useNFTDetails } from '@/hooks/useSubgraph';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { IPFSImage } from '@/components/common/IPFSImage';
import { useMemo } from 'react';

interface CollectionTopNFTsProps {
  collection: Address;
  limit?: number;
}

export function CollectionTopNFTs({ collection, limit = 8 }: CollectionTopNFTsProps) {
  // Get all NFTs in collection, not just listed ones
  const { data, loading, error } = useNFTs({
    where: {
      collection: collection.toLowerCase(),
    },
    orderBy: 'price',
    orderDirection: 'asc',
    first: 100,
    skipPolling: true,
  });

  const topNFTs = useMemo(() => {
    const pairs = data?.pairs || [];
    
    // If we have listed NFTs, prioritize those
    const listedNFTs = pairs.filter((p: any) => p.bValid && p.price);
    const unlistedNFTs = pairs.filter((p: any) => !p.bValid);
    
    // Get NFTs with highest prices (current listings)
    const sortedByPrice = [...listedNFTs]
      .sort((a: any, b: any) => {
        const priceA = BigInt(a.price || '0');
        const priceB = BigInt(b.price || '0');
        return priceB > priceA ? 1 : priceB < priceA ? -1 : 0;
      })
      .slice(0, limit);

    // Also get NFTs with highest sale prices if available
    const withSales = pairs.filter((p: any) => p.sold && p.salePrice);
    const sortedBySalePrice = [...withSales]
      .sort((a: any, b: any) => {
        const saleA = BigInt(a.salePrice || '0');
        const saleB = BigInt(b.salePrice || '0');
        return saleB > saleA ? 1 : saleB < saleA ? -1 : 0;
      })
      .slice(0, limit);

    // If we have enough listed/sold NFTs, use those
    if (sortedByPrice.length + sortedBySalePrice.length >= limit) {
      const combined = [...sortedByPrice, ...sortedBySalePrice];
      const unique = combined.filter((pair, index, self) =>
        index === self.findIndex((p) => p.collection === pair.collection && p.tokenId === pair.tokenId)
      );
      return unique.slice(0, limit);
    }

    // Otherwise, include unlisted NFTs to fill the gap
    const allNFTs = [...sortedByPrice, ...sortedBySalePrice, ...unlistedNFTs];
    const unique = allNFTs.filter((pair, index, self) =>
      index === self.findIndex((p) => p.collection === pair.collection && p.tokenId === pair.tokenId)
    );

    return unique.slice(0, limit);
  }, [data, limit]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Top NFTs
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Top NFTs
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading NFTs: {error.message}</p>
      </div>
    );
  }

  if (topNFTs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Top NFTs
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No NFTs found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Top NFTs
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {topNFTs.map((pair: any) => (
          <TopNFTCard
            key={pair.id}
            collection={collection}
            tokenId={BigInt(pair.tokenId)}
            price={pair.price ? BigInt(pair.price) : undefined}
            salePrice={pair.salePrice ? BigInt(pair.salePrice) : undefined}
            isListed={pair.bValid}
          />
        ))}
      </div>
    </div>
  );
}

function TopNFTCard({
  collection,
  tokenId,
  price,
  salePrice,
  isListed,
}: {
  collection: Address;
  tokenId: bigint;
  price?: bigint;
  salePrice?: bigint;
  isListed: boolean;
}) {
  const { data: nftData } = useNFTDetails(collection, tokenId);
  const item = nftData?.items?.[0];
  const { metadata, getImageUrl } = useIPFSMetadata(item?.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  const displayPrice = isListed ? price : salePrice;

  return (
    <Link
      href={`/nft/${collection}/${tokenId}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
        {imageUrl && metadata?.image ? (
          <IPFSImage
            src={metadata.image}
            alt={metadata.name || `NFT #${tokenId}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs sm:text-sm">#{tokenId.toString()}</p>
            </div>
          </div>
        )}
        {isListed && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Listed
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="font-semibold text-sm sm:text-base mb-2 text-gray-900 dark:text-gray-100 truncate">
          {metadata?.name || `Token #${tokenId}`}
        </p>
        {displayPrice && (
          <p className="text-primary-600 dark:text-primary-400 font-bold text-sm sm:text-base">
            {formatEther(displayPrice)} TGR
          </p>
        )}
        {!displayPrice && (
          <p className="text-gray-500 dark:text-gray-400 text-xs">No price data</p>
        )}
      </div>
    </Link>
  );
}

