'use client';

import { useEvents } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNFTDetails } from '@/hooks/useSubgraph';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { IPFSImage } from '@/components/common/IPFSImage';

interface CollectionRecentSalesProps {
  collection: Address;
  limit?: number;
}

export function CollectionRecentSales({ collection, limit = 10 }: CollectionRecentSalesProps) {
  const { data, loading, error } = useEvents({
    where: {
      collection: collection.toLowerCase(),
      name: 'Sold',
    },
    orderBy: 'timestamp',
    orderDirection: 'desc',
    first: limit,
    skipPolling: true,
  });

  const sales = data?.events || [];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Recent Sales
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Recent Sales
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading sales: {error.message}</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Recent Sales
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No sales yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Recent Sales
      </h3>
      <div className="space-y-3">
        {sales.map((sale: any) => {
          const tokenId = typeof sale.tokenId === 'string' 
            ? BigInt(sale.tokenId) 
            : typeof sale.tokenId === 'bigint' 
            ? sale.tokenId 
            : BigInt(String(sale.tokenId));
          return (
            <SaleItem
              key={sale.id}
              collection={collection}
              tokenId={tokenId}
              from={sale.from}
              to={sale.to}
              price={sale.price}
              timestamp={sale.timestamp}
              txhash={sale.txhash}
            />
          );
        })}
      </div>
    </div>
  );
}

function SaleItem({
  collection,
  tokenId,
  from,
  to,
  price,
  timestamp,
  txhash,
}: {
  collection: Address;
  tokenId: bigint;
  from: string;
  to: string;
  price: string | bigint;
  timestamp: string;
  txhash: string;
}) {
  const router = useRouter();
  const { data: nftData } = useNFTDetails(collection, tokenId);
  const item = nftData?.items?.[0];
  const { metadata, getImageUrl } = useIPFSMetadata(item?.uri || '');
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  const timeAgo = formatDistanceToNow(new Date(Number(timestamp) * 1000), {
    addSuffix: true,
  });

  const handleItemClick = () => {
    router.push(`/nft/${collection}/${tokenId}`);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${to}`);
  };

  const handleTxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://snowtrace.io/tx/${txhash}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleItemClick}
      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200 hover:shadow-md group cursor-pointer"
    >
      {/* NFT Image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
        {imageUrl && metadata?.image ? (
          <IPFSImage
            src={metadata.image}
            alt={metadata.name || `NFT #${tokenId}`}
            width={64}
            height={64}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
            #{tokenId.toString()}
          </div>
        )}
      </div>

      {/* Sale Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
            {metadata?.name || `Token #${tokenId}`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="font-mono">{from.slice(0, 6)}...{from.slice(-4)}</span>
          <span>→</span>
          <button
            type="button"
            onClick={handleProfileClick}
            className="font-mono hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
          >
            {to.slice(0, 6)}...{to.slice(-4)}
          </button>
        </div>
      </div>

      {/* Price and Time */}
      <div className="flex-shrink-0 text-right">
        <p className="font-bold text-lg text-primary-600 dark:text-primary-400 mb-1">
          {formatEther(typeof price === 'string' ? BigInt(price) : price)} TGR
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
        <button
          type="button"
          onClick={handleTxClick}
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block"
        >
          View TX
        </button>
      </div>
    </div>
  );
}

