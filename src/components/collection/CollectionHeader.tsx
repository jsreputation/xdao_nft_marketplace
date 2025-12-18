'use client';

import { IPFSImage } from '@/components/common/IPFSImage';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import Link from 'next/link';

interface CollectionHeaderProps {
  collection: {
    id: string;
    address: string;
    name: string;
    uri: string;
    owner: string;
    verified: boolean;
  };
}

export function CollectionHeader({ collection }: CollectionHeaderProps) {
  // Debug: Log collection URI
  if (process.env.NODE_ENV === 'development') {
    console.log('CollectionHeader - Collection URI:', collection.uri);
  }

  const { metadata, isLoading, error: metadataError, getImageUrl } = useIPFSMetadata(collection.uri || '');

  // Extract theme from metadata attributes
  const theme = metadata && 'attributes' in metadata && metadata.attributes
    ? metadata.attributes.find((attr: any) => attr.trait_type === 'Theme')?.value || 'Digital Art'
    : 'Digital Art';

  // Debug: Log metadata fetching status
  if (process.env.NODE_ENV === 'development') {
    console.log('CollectionHeader - Metadata:', {
      isLoading,
      hasMetadata: !!metadata,
      hasDescription: !!metadata?.description,
      description: metadata?.description,
      theme,
      error: metadataError,
    });
  }

  return (
    <div className="mb-6 sm:mb-8">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
        {/* Collection Image Background */}
        {metadata?.image ? (
          <div className="relative h-64 sm:h-80 lg:h-96">
            <IPFSImage
              src={metadata.image}
              alt={collection.name}
              fill
              className="object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-gray-900/40"></div>
          </div>
        ) : (
          <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-primary-600/20 via-purple-600/20 to-primary-600/20">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-gray-900/40"></div>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
          <div className="max-w-4xl">
            {/* Collection Name and Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl">
                {collection.name}
              </h1>
              {collection.verified && (
                <div className="inline-flex items-center gap-1.5 bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold shadow-lg border border-blue-400/50 self-start sm:self-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </div>
              )}
            </div>

            {/* Theme Badge */}
            <div className="mb-4">
              <span className="inline-block text-sm text-gray-200 font-medium px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                {theme}
              </span>
            </div>

            {/* Owner Information */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-gray-300">Owner:</span>
              <Link
                href={`/profile/${collection.owner}`}
                className="font-mono text-primary-300 hover:text-primary-200 transition-colors duration-200 hover:underline"
              >
                {collection.owner.slice(0, 6)}...{collection.owner.slice(-4)}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {collection.uri && (
        <div className="mt-6 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/30 shadow-lg">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-700/50 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-700/50 rounded animate-pulse w-4/6"></div>
            </div>
          ) : metadataError ? (
            <p className="text-red-400 text-sm sm:text-base">
              Error loading metadata: {metadataError.message}
            </p>
          ) : metadata?.description ? (
            <p className="text-gray-200 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              {metadata.description}
            </p>
          ) : (
            <p className="text-gray-400 text-sm sm:text-base italic">
              No description available for this collection
            </p>
          )}
        </div>
      )}
    </div>
  );
}

