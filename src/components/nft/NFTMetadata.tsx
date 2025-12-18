'use client';

import { useIPFSMetadata } from '@/hooks/useIPFS';

interface NFTMetadataProps {
  uri?: string;
  tokenId: bigint;
  creator: string;
  owner: string;
  royalty: bigint;
}

export function NFTMetadata({ uri, tokenId, creator, owner, royalty }: NFTMetadataProps) {
  const { metadata, isLoading } = useIPFSMetadata(uri);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
        {metadata?.name || `NFT #${tokenId}`}
      </h2>
      
      {metadata?.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{metadata.description}</p>
      )}

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Creator</p>
          <p className="font-mono text-xs sm:text-sm break-all">{creator}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Owner</p>
          <p className="font-mono text-xs sm:text-sm break-all">{owner}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Royalty</p>
          <p className="font-semibold text-sm sm:text-base">{(Number(royalty) / 10).toFixed(1)}%</p>
        </div>
      </div>

      {metadata && 'attributes' in metadata && metadata.attributes && metadata.attributes.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3">Attributes</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {metadata.attributes.map((attr: any, index: number) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{attr.trait_type}</p>
                <p className="font-semibold text-xs sm:text-sm">{attr.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

