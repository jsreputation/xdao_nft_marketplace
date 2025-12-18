'use client';

import { useCollections } from '@/hooks/useSubgraph';
import { useNFTs } from '@/hooks/useSubgraph';
import { useAuctions } from '@/hooks/useSubgraph';
import { formatEther } from 'viem';

export function StatsOverview() {
  // Fetch all collections to get accurate count (using a large number to get all)
  // Disable polling for stats - they don't need real-time updates
  const { data: collectionsData } = useCollections({ first: 1000, skipPolling: true });
  
  // Fetch all active listings to get accurate count
  const { data: nftsData } = useNFTs({ 
    first: 1000, 
    where: { bValid: true },
    skipPolling: true
  });
  
  // Fetch all active auctions to get accurate count
  const { data: auctionsData } = useAuctions({ 
    first: 1000, 
    where: { active: true },
    skipPolling: true
  });

  // Calculate total volume from all collections
  const totalVolume = collectionsData?.collections?.reduce(
    (sum: bigint, col: any) => {
      const volume = col.totalVolume ? BigInt(col.totalVolume) : BigInt(0);
      return sum + volume;
    },
    BigInt(0)
  ) || BigInt(0);

  // Get accurate counts
  const totalCollections = collectionsData?.collections?.length || 0;
  const activeListings = nftsData?.pairs?.length || 0;
  const activeAuctions = auctionsData?.auctions?.length || 0;

  const stats = [
    {
      label: 'Total Collections',
      value: totalCollections,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Active Listings',
      value: activeListings,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Active Auctions',
      value: activeAuctions,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Total Volume',
      value: totalVolume > 0 ? `${formatEther(totalVolume)} TGR` : '0 TGR',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Marketplace Statistics</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Real-time data from our decentralized marketplace
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8 text-center card-hover"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
