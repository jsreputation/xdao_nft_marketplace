'use client';

import { useParams } from 'next/navigation';
import { isAddress, Address } from 'viem';
import { useCollection } from '@/hooks/useSubgraph';
import dynamic from 'next/dynamic';
import { CollectionHeader } from '@/components/collection/CollectionHeader';
import { CollectionStats } from '@/components/collection/CollectionStats';
import { CollectionNFTs } from '@/components/collection/CollectionNFTs';
import { CollectionRecentSales } from '@/components/collection/CollectionRecentSales';
import { CollectionTopNFTs } from '@/components/collection/CollectionTopNFTs';

// Lazy load heavy chart components (recharts is large)
const CollectionPriceChart = dynamic(
  () => import('@/components/collection/CollectionPriceChart').then(mod => ({ default: mod.CollectionPriceChart })),
  {
    loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
    ssr: false, // Charts don't need SSR
  }
);

const CollectionAnalytics = dynamic(
  () => import('@/components/collection/CollectionAnalytics').then(mod => ({ default: mod.CollectionAnalytics })),
  {
    loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
  }
);

export default function CollectionPage() {
  const params = useParams();
  const collectionAddress = params.address as string;

  if (!isAddress(collectionAddress)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid collection address</p>
      </div>
    );
  }

  const { data, loading, error } = useCollection(collectionAddress.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading collection: {error.message}</p>
      </div>
    );
  }

  if (!data?.collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Collection not found</p>
      </div>
    );
  }

  const collection = data.collection;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CollectionHeader collection={collection} />
        <CollectionStats collection={collection} />
        
        {/* Analytics and Price Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CollectionAnalytics collection={collection.address as Address} />
          <CollectionPriceChart collection={collection.address as Address} />
        </div>
        
        {/* Top NFTs and Recent Sales Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CollectionTopNFTs collection={collection.address as Address} />
          <CollectionRecentSales collection={collection.address as Address} />
        </div>

        <CollectionNFTs collectionAddress={collection.address as Address} />
      </div>
    </div>
  );
}

