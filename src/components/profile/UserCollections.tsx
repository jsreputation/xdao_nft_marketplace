'use client';

import Link from 'next/link';
import { useUserCollections } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { IPFSImage } from '@/components/common/IPFSImage';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { useMemo, useState } from 'react';
import { Pagination } from '@/components/common/Pagination';

interface UserCollectionsProps {
  owner: Address;
}

const PAGE_SIZE = 12;

export function UserCollections({ owner }: UserCollectionsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const { data, loading, error } = useUserCollections(owner, 100, 0, true);

  // Deduplicate collections by address
  const uniqueCollections = useMemo(() => {
    const allCollections = data?.collections || [];
    const seen = new Set<string>();
    const unique: any[] = [];

    allCollections.forEach((collection: any) => {
      // Skip if removed
      if (collection.removed === true) {
        return;
      }

      // Ensure owner matches
      if (collection.owner?.toLowerCase() !== owner.toLowerCase()) {
        return;
      }

      // Create unique key from address
      const key = collection.address?.toLowerCase() || collection.id?.toLowerCase();
      
      // Skip if already seen (duplicate)
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      unique.push(collection);
    });

    // Sort by timestamp (newest first)
    return unique.sort((a, b) => {
      const timeA = Number(a.timestamp || 0);
      const timeB = Number(b.timestamp || 0);
      return timeB - timeA;
    });
  }, [data, owner]);

  // Paginate the results
  const paginatedCollections = useMemo(() => {
    const start = skip;
    const end = start + PAGE_SIZE;
    return uniqueCollections.slice(start, end);
  }, [uniqueCollections, skip]);

  const totalPages = Math.ceil(uniqueCollections.length / PAGE_SIZE);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">Error loading collections: {error.message}</p>
      </div>
    );
  }

  if (uniqueCollections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No collections created</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Create a collection to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {paginatedCollections.map((collection: any) => {
          const uniqueKey = collection.address?.toLowerCase() || collection.id?.toLowerCase();
          return (
            <CollectionCard key={uniqueKey} collection={collection} />
          );
        })}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}

function CollectionCard({ collection }: { collection: any }) {
  const { metadata, getImageUrl } = useIPFSMetadata(collection.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <Link
      href={`/collection/${collection.address}`}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-in"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-purple-500/0 to-secondary-500/0 group-hover:from-primary-500/20 group-hover:via-purple-500/20 group-hover:to-secondary-500/20 transition-all duration-500 rounded-2xl -z-10 blur-xl"></div>
      
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        {imageUrl && metadata?.image ? (
          <>
            <IPFSImage
              src={metadata.image}
              alt={metadata.name || collection.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Shimmer overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center p-4 animate-pulse-slow">
              <svg className="w-20 h-20 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">Collection</p>
            </div>
          </div>
        )}
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Verified badge */}
        {collection.verified && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}
      </div>
      
      <div className="p-5 relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-purple-50/0 group-hover:from-primary-50/50 group-hover:to-purple-50/50 dark:group-hover:from-primary-900/20 dark:group-hover:to-purple-900/20 transition-all duration-500 rounded-b-2xl"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate">
            {metadata?.name || collection.name || 'Unnamed Collection'}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1 font-medium">Floor Price</p>
              <p className="font-bold text-lg text-primary-600 dark:text-primary-400">
                {collection.floorPrice ? formatEther(collection.floorPrice) : '—'} TGR
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Volume</p>
              <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {collection.totalVolume ? formatEther(collection.totalVolume) : '0'} TGR
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1 font-medium">Items</p>
              <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {collection.totalItems ? collection.totalItems.toString() : '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1 font-medium">Sales</p>
              <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {collection.totalSales ? collection.totalSales.toString() : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
