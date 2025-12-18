'use client';

import Link from 'next/link';
import { useTrendingNFTs, useNFTDetails } from '@/hooks/useSubgraph';
import { IPFSImage } from '@/components/common/IPFSImage';
import { formatEther } from 'viem';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { Skeleton } from '@/components/common/Skeleton';

function NFTCard({ pair }: { pair: any }) {
  // Disable polling for NFT details on homepage - they're just for display
  const { data: itemData } = useNFTDetails(pair.collection, pair.tokenId, true);
  const item = itemData?.items?.[0];
  const { metadata, getImageUrl } = useIPFSMetadata(item?.uri);
  
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <Link
      href={`/nft/${pair.collection}/${pair.tokenId}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden card-hover"
    >
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
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
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm sm:text-base mb-2 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {metadata?.name || `NFT #${pair.tokenId}`}
        </h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
            <p className="text-primary-600 dark:text-primary-400 font-bold text-sm sm:text-base">
              {formatEther(pair.price)} TGR
            </p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full font-semibold">
            For Sale
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TrendingNFTs() {
  // Disable polling for homepage - use cached data
  const { data, loading, error } = useTrendingNFTs(12, true);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-10 sm:mb-12">Trending NFTs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-800 dark:text-red-200">Error loading NFTs: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  const nfts = data?.pairs || [];

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Trending NFTs</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Hot picks from the marketplace</p>
          </div>
          <Link 
            href="/explore?tab=nfts" 
            className="mt-4 sm:mt-0 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm sm:text-base transition-colors flex items-center gap-2"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {nfts.map((pair: any) => (
            <NFTCard key={pair.id} pair={pair} />
          ))}
        </div>
      </div>
    </section>
  );
}
