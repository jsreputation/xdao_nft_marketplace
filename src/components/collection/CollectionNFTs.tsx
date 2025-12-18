'use client';

import Link from 'next/link';
import { IPFSImage } from '@/components/common/IPFSImage';
import { formatEther } from 'viem';
import { useNFTs, useItemsByCollection } from '@/hooks/useSubgraph';
import { Address } from 'viem';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { useMemo } from 'react';

interface CollectionNFTsProps {
  collectionAddress: Address;
}

export function CollectionNFTs({ collectionAddress }: CollectionNFTsProps) {
  // Fetch pairs (NFTs that have been listed)
  const { data: pairsData, loading: pairsLoading, error: pairsError } = useNFTs({
    where: { collection: collectionAddress.toLowerCase() },
    first: 1000, // Get all pairs
  });

  // Fetch items (all NFTs in the collection)
  const { data: itemsData, loading: itemsLoading, error: itemsError } = useItemsByCollection({
    collection: collectionAddress,
    first: 1000, // Get all items
  });

  const loading = pairsLoading || itemsLoading;
  const error = pairsError || itemsError;

  // Merge items and pairs data
  const allNFTs = useMemo(() => {
    const pairs = pairsData?.pairs || [];
    const items = itemsData?.items || [];

    // Create a map of items by tokenId for quick lookup
    const itemsMap = new Map<string, any>();
    items.forEach((item: any) => {
      const key = `${item.collection}-${item.tokenId}`;
      itemsMap.set(key, item);
    });

    // Create a map to track which items we've processed
    const processedItems = new Set<string>();

    // Start with all pairs (they have listing data)
    const merged: any[] = [];
    pairs.forEach((pair: any) => {
      const key = `${pair.collection}-${pair.tokenId}`;
      processedItems.add(key);
      // Find the corresponding item to get the URI
      const item = itemsMap.get(key);
      merged.push({
        ...pair,
        hasPair: true,
        uri: item?.uri || null, // Use URI from item if available
      });
    });

    // Add items that don't have pairs (never been listed)
    items.forEach((item: any) => {
      const key = `${item.collection}-${item.tokenId}`;
      if (!processedItems.has(key)) {
        merged.push({
          id: item.id,
          collection: item.collection,
          tokenId: item.tokenId,
          owner: item.owner,
          creator: item.creator,
          uri: item.uri,
          hasPair: false,
          bValid: false,
          sold: false,
        });
      }
    });

    // Sort by tokenId for consistent display
    return merged.sort((a, b) => {
      const tokenIdA = BigInt(a.tokenId || '0');
      const tokenIdB = BigInt(b.tokenId || '0');
      return tokenIdA < tokenIdB ? -1 : tokenIdA > tokenIdB ? 1 : 0;
    });
  }, [pairsData, itemsData]);

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
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{allNFTs.length} items</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {allNFTs.map((nft: any) => (
          <NFTItemCard key={nft.id || `${nft.collection}-${nft.tokenId}`} nft={nft} />
        ))}
      </div>
    </div>
  );
}

function NFTItemCard({ nft }: { nft: any }) {
  // Use the URI from the item if available, otherwise fetch it
  const uri = nft.uri || '';
  const { metadata, getImageUrl } = useIPFSMetadata(uri);
  
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  // Determine NFT status
  const isListed = nft.bValid === true;
  const isSold = nft.sold === true;
  
  // Get status badge
  const getStatusBadge = () => {
    if (isSold) {
      return (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          Sold
        </div>
      );
    } else if (isListed) {
      return (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          Listed
        </div>
      );
    } else {
      return (
        <div className="absolute top-2 left-2 bg-gray-500 dark:bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          Available
        </div>
      );
    }
  };

  return (
    <Link
      href={`/nft/${nft.collection}/${nft.tokenId}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden card-hover relative"
    >
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
        {imageUrl && metadata?.image ? (
          <IPFSImage
            src={metadata.image}
            alt={metadata.name || `NFT #${nft.tokenId}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs sm:text-sm">Token #{nft.tokenId}</p>
            </div>
          </div>
        )}
        {/* Status Badge */}
        {getStatusBadge()}
      </div>
      <div className="p-3 sm:p-4">
        <p className="font-semibold text-sm sm:text-base mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
          {metadata?.name || `NFT #${nft.tokenId}`}
        </p>
        {isListed && nft.price && (
          <p className="text-primary-600 dark:text-primary-400 font-bold text-sm sm:text-base">
            {formatEther(typeof nft.price === 'string' ? BigInt(nft.price) : nft.price)} TGR
          </p>
        )}
        {isSold && nft.salePrice && (
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm line-through">
            Sold for {formatEther(typeof nft.salePrice === 'string' ? BigInt(nft.salePrice) : nft.salePrice)} TGR
          </p>
        )}
        {!isListed && !isSold && (
          <p className="text-gray-500 dark:text-gray-400 text-xs">Not listed</p>
        )}
      </div>
    </Link>
  );
}

