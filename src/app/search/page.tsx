'use client';

import { useSearchParams } from 'next/navigation';
import { useCollections, useNFTs } from '@/hooks/useSubgraph';
import { isAddress } from 'viem';
import Link from 'next/link';
import { formatEther } from 'viem';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { IPFSImage } from '@/components/common/IPFSImage';
import { useIPFSMetadata } from '@/hooks/useIPFS';

function NFTSearchCard({ pair }: { pair: any }) {
  const { metadata } = useIPFSMetadata(pair.item?.tokenURI);
  
  return (
    <Link
      href={`/nft/${pair.collection}/${pair.tokenId}`}
      className="bg-gray-800 border border-gray-700/50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square relative bg-gray-700">
        {pair.item?.tokenURI ? (
          <IPFSImage
            src={pair.item.tokenURI}
            alt={`NFT #${pair.tokenId}`}
            className="w-full h-full object-cover"
            fill
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm text-white">
          {metadata?.name || `NFT #${pair.tokenId}`}
        </p>
        {pair.bValid && (
          <p className="text-primary-400 font-bold mt-2">
            {formatEther(pair.price)} TGR
          </p>
        )}
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  // Disable polling for search results - use cached data
  const { data: collectionsData, loading: collectionsLoading } = useCollections({
    first: 50,
    where: query ? { name_contains_nocase: query, removed: false } : { removed: false },
    skipPolling: true,
  });

  const { data: nftsData, loading: nftsLoading } = useNFTs({
    first: 100,
    skipPolling: true,
  });

  const collections = collectionsData?.collections || [];
  const nfts = nftsData?.pairs || [];

  // Filter NFTs by query - search by tokenId or collection address
  const filteredNFTs = query
    ? nfts.filter((pair: any) => {
        const tokenIdStr = pair.tokenId?.toString() || '';
        const collectionStr = pair.collection?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        return tokenIdStr.includes(query) || collectionStr.includes(queryLower);
      })
    : [];

  const isLoading = collectionsLoading || nftsLoading;

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-900 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">Search</h1>
          <p className="text-gray-400 text-sm sm:text-base">Enter a search query to find collections and NFTs</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" text="Searching..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-white">Search Results for "{query}"</h1>

        {isAddress(query) ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl p-6">
            <p className="mb-4 text-gray-300">Address detected. View profile:</p>
            <Link
              href={`/profile/${query}`}
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              Go to Profile →
            </Link>
          </div>
        ) : (
          <>
            {collections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">Collections ({collections.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.map((collection: any) => (
                    <Link
                      key={collection.id}
                      href={`/collection/${collection.address}`}
                      className="bg-gray-800 border border-gray-700/50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2 text-white">{collection.name}</h3>
                        {collection.verified && (
                          <span className="text-blue-400 text-sm">✓ Verified</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredNFTs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">NFTs ({filteredNFTs.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredNFTs.map((pair: any) => (
                    <NFTSearchCard key={pair.id} pair={pair} />
                  ))}
                </div>
              </div>
            )}

            {collections.length === 0 && filteredNFTs.length === 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl p-12 text-center">
                <p className="text-gray-400 text-lg">No results found for "{query}"</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

