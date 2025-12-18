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
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
            <div className="relative aspect-[3/4] flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.collections || data.collections.length === 0) {
    return null;
  }

  const collections = data.collections.slice(0, 3);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % collections.length);
  };

  const currentCollection = collections[currentIndex];

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        {/* Left Column - Carousel */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {collections.map((collection: any, index: number) => (
                <CollectionSlide key={collection.id} collection={collection} />
              ))}
            </div>

            {/* Navigation Arrows */}
            {collections.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110"
                  aria-label="Previous slide"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110"
                  aria-label="Next slide"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Collection Thumbnails Indicator */}
            {collections.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-3">
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
        </div>

        {/* Right Column - Collection Info */}
        <div className="text-white">
          <div key={currentCollection.id} className="animate-fade-in">
            <CollectionInfo collection={currentCollection} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionSlide({ collection }: { collection: any }) {
  const { metadata, getImageUrl } = useIPFSMetadata(collection.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <div className="min-w-full relative aspect-[3/4] flex items-center justify-center overflow-hidden">
      {imageUrl && metadata?.image ? (
        <IPFSImage
          src={metadata.image}
          alt={metadata.name || collection.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-400/20 to-purple-400/20 flex items-center justify-center">
          <div className="text-white/50 text-4xl font-bold">
            {collection.name?.charAt(0) || '?'}
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
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
  const { metadata, getImageUrl } = useIPFSMetadata(collection.uri);
  const imageUrl = metadata?.image ? getImageUrl(metadata.image) : '';

  return (
    <button
      onClick={onClick}
      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
        isActive
          ? 'border-white scale-110 shadow-lg shadow-white/50'
          : 'border-white/40 hover:border-white/60 hover:scale-105'
      }`}
      aria-label={`Go to ${collection.name || 'collection'}`}
    >
      {imageUrl && metadata?.image ? (
        <IPFSImage
          src={metadata.image}
          alt={metadata.name || collection.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-400/40 to-purple-400/40 flex items-center justify-center">
          <div className="text-white/70 text-lg font-bold">
            {collection.name?.charAt(0) || '?'}
          </div>
        </div>
      )}
      {isActive && (
        <div className="absolute inset-0 bg-white/20"></div>
      )}
    </button>
  );
}

function CollectionInfo({ collection }: { collection: any }) {
  const { metadata } = useIPFSMetadata(collection.uri);
  const description = metadata?.description || '';

  return (
    <div className="space-y-4">
      {/* Collection Name */}
      <div>
        <Link
          href={`/collection/${collection.address}`}
          className="inline-block group"
        >
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white group-hover:text-primary-200 transition-colors">
              {metadata?.name || collection.name || `${collection.address.slice(0, 6)}...${collection.address.slice(-4)}`}
            </h2>
            {collection.verified && (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <svg
              className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Description */}
      {description && (
        <p className="text-white/80 text-base sm:text-lg leading-relaxed">
          {description}
        </p>
      )}

      {/* Collection Stats */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4">
        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-xl p-4">
          <p className="text-white/70 text-sm mb-1">Floor Price</p>
          <p className="text-white font-bold text-xl sm:text-2xl">
            {collection.floorPrice ? formatEther(collection.floorPrice) : '—'} TGR
          </p>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-xl p-4">
          <p className="text-white/70 text-sm mb-1">Total Volume</p>
          <p className="text-white font-bold text-xl sm:text-2xl">
            {collection.totalVolume ? formatEther(collection.totalVolume) : '0'} TGR
          </p>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-xl p-4">
          <p className="text-white/70 text-sm mb-1">Total Items</p>
          <p className="text-white font-bold text-xl sm:text-2xl">
            {collection.totalItems || 0}
          </p>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-xl p-4">
          <p className="text-white/70 text-sm mb-1">Total Sales</p>
          <p className="text-white font-bold text-xl sm:text-2xl">
            {collection.totalSales || 0}
          </p>
        </div>
      </div>

      {/* View Collection Button */}
      <Link
        href={`/collection/${collection.address}`}
        className="inline-block mt-4"
      >
        <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-base hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform">
          View Collection
        </button>
      </Link>
    </div>
  );
}

