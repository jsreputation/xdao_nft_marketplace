'use client';

import Link from 'next/link';
import { useTopCollections } from '@/hooks/useSubgraph';
import { IPFSImage } from '@/components/common/IPFSImage';
import { formatEther } from 'viem';
import { Skeleton } from '@/components/common/Skeleton';
import { useIPFSMetadata } from '@/hooks/useIPFS';

export function FeaturedCollections() {
  // Disable polling for homepage - use cached data
  const { data, loading, error } = useTopCollections(6, true);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-0">Featured Collections</h2>
            <Link href="/explore?tab=collections" className="text-primary-600 hover:text-primary-700 font-semibold text-sm sm:text-base transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
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
            <p className="text-red-800 dark:text-red-200">Error loading collections: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  const collections = data?.collections || [];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Featured Collections</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Discover the most popular NFT collections</p>
          </div>
          <Link 
            href="/explore?tab=collections" 
            className="mt-4 sm:mt-0 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm sm:text-base transition-colors flex items-center gap-2"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((collection: any) => (
            <FeaturedCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCollectionCard({ collection }: { collection: any }) {
  const { metadata, getImageUrl } = useIPFSMetadata(collection.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <Link
      href={`/collection/${collection.address}`}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover"
    >
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        {imageUrl && metadata?.image && (
          <IPFSImage
            src={metadata.image}
            alt={metadata.name || collection.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {collection.verified && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
          {metadata?.name || collection.name}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">Floor Price</p>
            <p className="font-bold text-lg text-primary-600 dark:text-primary-400">
              {collection.floorPrice ? formatEther(collection.floorPrice) : '—'} TGR
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">Total Volume</p>
            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {collection.totalVolume ? formatEther(collection.totalVolume) : '0'} TGR
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

