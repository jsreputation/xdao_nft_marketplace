'use client';

import { formatEther } from 'viem';

interface CollectionStatsProps {
  collection: {
    totalItems: bigint;
    totalListings: bigint;
    totalVolume: bigint;
    floorPrice: bigint;
    totalSales: bigint;
    volume24h: bigint;
    volume7d: bigint;
    volume30d: bigint;
    sales24h: bigint;
    sales7d: bigint;
    sales30d: bigint;
  };
}

export function CollectionStats({ collection }: CollectionStatsProps) {
  const stats = [
    {
      label: 'Total Items',
      value: collection.totalItems.toString(),
    },
    {
      label: 'Listings',
      value: collection.totalListings.toString(),
    },
    {
      label: 'Total Volume',
      value: `${formatEther(collection.totalVolume)} TGR`,
    },
    {
      label: 'Floor Price',
      value: collection.floorPrice > 0n
        ? `${formatEther(collection.floorPrice)} TGR`
        : '—',
    },
    {
      label: 'Total Sales',
      value: collection.totalSales.toString(),
    },
  ];

  const timeStats = [
    {
      label: '24h Volume',
      value: `${formatEther(collection.volume24h)} TGR`,
      sales: collection.sales24h.toString(),
    },
    {
      label: '7d Volume',
      value: `${formatEther(collection.volume7d)} TGR`,
      sales: collection.sales7d.toString(),
    },
    {
      label: '30d Volume',
      value: `${formatEther(collection.volume30d)} TGR`,
      sales: collection.sales30d.toString(),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Statistics</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Time-based Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeStats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-primary-600 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.sales} sales</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

