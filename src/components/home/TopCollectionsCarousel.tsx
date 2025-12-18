'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTopCollections } from '@/hooks/useSubgraph';
import { IPFSImage } from '@/components/common/IPFSImage';
import { useIPFSMetadata } from '@/hooks/useIPFS';
import { Skeleton } from '@/components/common/Skeleton';
import { formatEther } from 'viem';

export function TopCollectionsCarousel() {
  const { data, loading, error } = useTopCollections(3, true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate current collection URI BEFORE any early returns to maintain hook order
  // Always ensure we have a stable string value for the hook
  const collections = data?.collections?.slice(0, 3) || [];
  const currentCollection = collections.length > 0 && currentIndex < collections.length 
    ? collections[currentIndex] 
    : null;
  const currentCollectionUri = currentCollection?.uri ?? '';
  
  // Fetch metadata once for the current collection to share between components
  // MUST be called before any early returns to maintain hook order
  // Always pass a string (never undefined) to ensure consistent hook calls
  const { metadata: currentMetadata, isLoading: isMetadataLoading } = useIPFSMetadata(currentCollectionUri || '');

  useEffect(() => {
    if (!data?.collections || data.collections.length === 0 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.collections.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [data, isPaused]);

  if (loading) {
    return (
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
            <div className="relative aspect-[16/9] flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
          <div className="mt-10 sm:mt-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.collections || data.collections.length === 0) {
    return null;
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % collections.length);
  };

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="relative">
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Previous Button - Outside Carousel */}
          {collections.length > 1 && (
            <button
              onClick={goToPrevious}
              className="hidden lg:flex flex-shrink-0 bg-gradient-to-r from-primary-500/90 to-purple-500/90 hover:from-primary-400 hover:to-purple-400 backdrop-blur-md rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg shadow-primary-500/50 border border-white/20 z-20"
              aria-label="Previous slide"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Enhanced Carousel */}
          <div className="flex-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-primary-500/30 shadow-2xl shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-500">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-purple-500/10 animate-pulse"></div>
            
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {collections.map((collection: any, index: number) => (
                <CollectionSlide key={collection.id} collection={collection} />
              ))}
            </div>

            {/* Navigation Arrows - Inside Carousel (for mobile) */}
            {collections.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full p-2.5 transition-all duration-300 shadow-lg border border-white/20"
                  aria-label="Previous slide"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={goToNext}
                  className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full p-2.5 transition-all duration-300 shadow-lg border border-white/20"
                  aria-label="Next slide"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Collection Thumbnails Indicator - Right Side Overlapped */}
            {collections.length > 1 && (
              <div className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col space-y-3 bg-black/70 backdrop-blur-xl rounded-2xl px-3 py-4 border border-white/25 shadow-2xl">
                {collections.map((collection: any, index: number) => (
                  <CollectionThumbnail
                    key={collection.id}
                    collection={collection}
                    isActive={index === currentIndex}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Next Button - Outside Carousel */}
          {collections.length > 1 && (
            <button
              onClick={goToNext}
              className="hidden lg:flex flex-shrink-0 bg-gradient-to-r from-primary-500/90 to-purple-500/90 hover:from-primary-400 hover:to-purple-400 backdrop-blur-md rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg shadow-primary-500/50 border border-white/20 z-20"
              aria-label="Next slide"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Collection Description - Enhanced UI */}
        {currentCollection && (
          <div className="mt-10 sm:mt-12">
            <div key={currentCollection.id} className="animate-fade-in">
              <CollectionDescription collection={currentCollection} metadata={currentMetadata} isLoading={isMetadataLoading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionSlide({ collection }: { collection: any }) {
  // Always pass a string to the hook to maintain consistent hook calls
  const { metadata, getImageUrl } = useIPFSMetadata(collection?.uri || '');
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';
  const collectionName = metadata?.name || collection?.name || `${collection?.address?.slice(0, 6) || ''}...${collection?.address?.slice(-4) || ''}`;

  return (
    <div className="min-w-full relative aspect-[16/9] flex items-center justify-center overflow-hidden group">
      {imageUrl && metadata?.image ? (
        <>
          <IPFSImage
            src={metadata.image}
            alt={collectionName}
            fill
            className="object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-purple-500/20"></div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-500/30 via-purple-500/30 to-pink-500/30 flex items-center justify-center relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          </div>
          <div className="relative z-10 text-white/80 text-7xl sm:text-8xl font-extrabold drop-shadow-2xl">
            {collection.name?.charAt(0) || '?'}
          </div>
        </div>
      )}

      {/* Metadata Overlay - Improved Layout */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-5 sm:p-6 lg:p-8">
        {/* Top Section - Collection Name */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent -mx-5 sm:-mx-6 lg:-mx-8 -mt-5 sm:-mt-6 lg:-mt-8 h-24 sm:h-28"></div>
          <div className="relative">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-2xl">
                {collectionName}
              </h3>
              {collection.verified && (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Stats and Button */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent -mx-5 sm:-mx-6 lg:-mx-8 -mb-5 sm:-mb-6 lg:-mb-8 h-36 sm:h-44"></div>
          <div className="relative space-y-3.5 sm:space-y-4">
            {/* Stats Row - Better Spacing */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {collection.floorPrice && (
                <div className="flex items-center gap-2 bg-white/12 backdrop-blur-md rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 border border-white/25 shadow-lg hover:bg-white/18 transition-all">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-white/70 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Floor</p>
                    <p className="text-white font-bold text-sm sm:text-base">
                      {formatEther(collection.floorPrice)} TGR
                    </p>
                  </div>
                </div>
              )}

              {collection.totalVolume && (
                <div className="flex items-center gap-2 bg-white/12 backdrop-blur-md rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 border border-white/25 shadow-lg hover:bg-white/18 transition-all">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div>
                    <p className="text-white/70 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Volume</p>
                    <p className="text-white font-bold text-sm sm:text-base">
                      {formatEther(collection.totalVolume)} TGR
                    </p>
                  </div>
                </div>
              )}

              {collection.totalItems && (
                <div className="flex items-center gap-2 bg-white/12 backdrop-blur-md rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 border border-white/25 shadow-lg hover:bg-white/18 transition-all">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  <div>
                    <p className="text-white/70 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Items</p>
                    <p className="text-white font-bold text-sm sm:text-base">
                      {collection.totalItems}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* View Collection Button - Larger */}
            <Link
              href={`/collection/${collection.address}`}
              className="inline-block group"
            >
              <button className="relative px-6 py-3 sm:px-7 sm:py-3.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm sm:text-base hover:from-primary-400 hover:via-purple-400 hover:to-pink-400 transition-all duration-300 shadow-xl shadow-primary-500/40 hover:shadow-primary-500/60 hover:scale-105 transform overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  View Collection
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionThumbnail({
  collection,
  isActive,
  onClick,
}: {
  collection: any;
  isActive: boolean;
  onClick: () => void;
}) {
  // Always pass a string to the hook to maintain consistent hook calls
  const { metadata, getImageUrl } = useIPFSMetadata(collection?.uri || '');
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <button
      onClick={onClick}
      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
        isActive
          ? 'border-primary-400 scale-110 shadow-xl shadow-primary-400/70 ring-2 ring-primary-400/50'
          : 'border-white/30 hover:border-white/50 hover:scale-105 opacity-75 hover:opacity-100'
      }`}
      aria-label={`Go to ${collection.name || 'collection'}`}
    >
      {imageUrl && metadata?.image ? (
        <>
          <IPFSImage
            src={metadata.image}
            alt={metadata.name || collection.name}
            fill
            className="object-cover"
          />
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-purple-400/30"></div>
          )}
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center transition-all ${
          isActive ? 'from-primary-400/60 to-purple-400/60' : 'from-primary-400/40 to-purple-400/40'
        }`}>
          <div className={`font-bold transition-all ${
            isActive ? 'text-white text-sm' : 'text-white/80 text-xs'
          }`}>
            {collection.name?.charAt(0) || '?'}
          </div>
        </div>
      )}
    </button>
  );
}

function CollectionDescription({ 
  collection, 
  metadata, 
  isLoading 
}: { 
  collection: any;
  metadata?: any;
  isLoading?: boolean;
}) {
  // Check if collection has a URI
  if (!collection?.uri) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
      </div>
    );
  }

  // Debug: Log metadata to see what we're getting
  if (metadata && process.env.NODE_ENV === 'development') {
    console.log('Collection metadata for', collection.address, ':', {
      hasName: !!metadata.name,
      hasImage: !!metadata.image,
      hasDescription: !!metadata.description,
      description: metadata.description,
      fullMetadata: metadata
    });
  }

  const description = metadata?.description?.trim() || '';

  if (!description) {
    // In development, show a message if description is missing
    if (process.env.NODE_ENV === 'development' && metadata) {
      console.warn('Collection has metadata but no description:', collection.address, metadata);
    }
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="relative">
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full mb-6"></div>
        
        {/* Description Card */}
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          <p className="text-white/90 text-base sm:text-lg lg:text-xl leading-relaxed font-normal text-center">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

