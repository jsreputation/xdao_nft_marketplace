'use client';

import { IPFSImage } from '@/components/common/IPFSImage';
import { useIPFSMetadata } from '@/hooks/useIPFS';

interface NFTImageProps {
  uri?: string;
  collection: string;
  tokenId: bigint;
}

export function NFTImage({ uri, collection, tokenId }: NFTImageProps) {
  const { metadata, getImageUrl } = useIPFSMetadata(uri);

  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <div className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden">
      {imageUrl ? (
        <IPFSImage
          src={metadata!.image}
          alt={metadata?.name || `NFT #${tokenId}`}
          fill
          className="object-contain"
          priority
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg">Loading image...</p>
          </div>
        </div>
      )}
    </div>
  );
}

