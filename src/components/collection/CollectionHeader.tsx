'use client';

import { IPFSImage } from '@/components/common/IPFSImage';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { formatEther } from 'viem';

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
  const { metadata, getImageUrl } = useIPFSMetadata(collection.uri);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6 sm:mb-8">
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-r from-primary-500 to-primary-700">
        {metadata?.image && (
          <IPFSImage
            src={metadata.image}
            alt={collection.name}
            fill
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">{collection.name}</h1>
            {collection.verified && (
              <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {metadata?.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base leading-relaxed">{metadata.description}</p>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span>Owner: <span className="font-mono">{collection.owner.slice(0, 6)}...{collection.owner.slice(-4)}</span></span>
        </div>
      </div>
    </div>
  );
}

