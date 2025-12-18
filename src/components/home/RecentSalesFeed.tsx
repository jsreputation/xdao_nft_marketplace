'use client';

import { useEvents } from '@/hooks/useSubgraph';
import { formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useNFTDetails } from '@/hooks/useSubgraph';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { IPFSImage } from '@/components/common/IPFSImage';
import { Address } from 'viem';
import { useMemo } from 'react';

interface RecentSalesFeedProps {
  limit?: number;
}

export function RecentSalesFeed({ limit = 10 }: RecentSalesFeedProps) {
  const { data, loading, error } = useEvents({
    where: {
      name: 'Sold',
    },
    orderBy: 'timestamp',
    orderDirection: 'desc',
    first: limit,
    skipPolling: false,
  });

  const sales = useMemo(() => {
    const events = data?.events || [];
    // Deduplicate by txhash:logIndex to avoid showing same sale twice
    const unique = events.filter((event: any, index: number, self: any[]) =>
      index === self.findIndex((e: any) => e.txhash === event.txhash && e.logIndex === event.logIndex)
    );
    return unique;
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Recent Sales
        </h2>
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
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Recent Sales
        </h2>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading sales: {error.message}</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Recent Sales
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent sales</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Recent Sales
      </h2>
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {sales.map((sale: any, index: number) => {
          const tokenId = typeof sale.tokenId === 'string' 
            ? BigInt(sale.tokenId) 
            : typeof sale.tokenId === 'bigint' 
            ? sale.tokenId 
            : BigInt(String(sale.tokenId));
          return (
            <SaleFeedItem
              key={sale.id}
              collection={sale.collection as Address}
              tokenId={tokenId}
              from={sale.from}
              to={sale.to}
              price={sale.price}
              timestamp={sale.timestamp}
              txhash={sale.txhash}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}

function SaleFeedItem({
  collection,
  tokenId,
  from,
  to,
  price,
  timestamp,
  txhash,
  index,
}: {
  collection: Address;
  tokenId: bigint;
  from: string;
  to: string;
  price: string | bigint;
  timestamp: string;
  txhash: string;
  index: number;
}) {
  const { data: nftData } = useNFTDetails(collection, tokenId);
  const item = nftData?.items?.[0];
  const { metadata, getImageUrl } = useIPFSMetadata(item?.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  const timeAgo = formatDistanceToNow(new Date(Number(timestamp) * 1000), {
    addSuffix: true,
  });

  return (
    <Link
      href={`/nft/${collection}/${tokenId}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-purple-50/50 dark:hover:from-primary-900/20 dark:hover:to-purple-900/20 transition-all duration-300 hover:shadow-md group animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* NFT Image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-transparent group-hover:ring-primary-500 dark:group-hover:ring-primary-400 transition-all duration-300">
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
          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
          <Link
            href={`/collection/${collection}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline truncate"
          >
            Collection
          </Link>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="font-mono">{from.slice(0, 6)}...{from.slice(-4)}</span>
          <span>→</span>
          <Link
            href={`/profile/${to}`}
            onClick={(e) => e.stopPropagation()}
            className="font-mono hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {to.slice(0, 6)}...{to.slice(-4)}
          </Link>
        </div>
      </div>

      {/* Price and Time */}
      <div className="flex-shrink-0 text-right">
        <p className="font-bold text-lg text-primary-600 dark:text-primary-400 mb-1">
          {formatEther(typeof price === 'string' ? BigInt(price) : price)} TGR
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
        <Link
          href={`https://snowtrace.io/tx/${txhash}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-flex items-center gap-1"
        >
          View TX
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </Link>
  );
}

