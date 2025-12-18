'use client';

import { useCollection } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { useMemo } from 'react';

interface CollectionAnalyticsProps {
  collection: Address;
}

export function CollectionAnalytics({ collection }: CollectionAnalyticsProps) {
  const { data, loading, error } = useCollection(collection.toLowerCase());

  const analytics = useMemo(() => {
    if (!data?.collection) return null;

    const col = data.collection;
    const totalVolume = Number(formatEther(col.totalVolume || 0n));
    const totalSales = Number(col.totalSales || 0n);
    const totalItems = Number(col.totalItems || 0n);
    const floorPrice = Number(formatEther(col.floorPrice || 0n));

    // Calculate averages
    const avgSalePrice = totalSales > 0 ? totalVolume / totalSales : 0;
    const salesVelocity = totalSales > 0 ? totalSales / Math.max(1, totalItems) : 0;
    const priceChangePercent = 0; // Would need historical data to calculate

    // Volume trends
    const volume24h = Number(formatEther(col.volume24h || 0n));
    const volume7d = Number(formatEther(col.volume7d || 0n));
    const volume30d = Number(formatEther(col.volume30d || 0n));
    const volumeTrend = volume7d > 0 ? ((volume24h / (volume7d / 7)) - 1) * 100 : 0;

    return {
      avgSalePrice,
      salesVelocity,
      priceChangePercent,
      volumeTrend,
      totalVolume,
      totalSales,
      totalItems,
      floorPrice,
      uniqueOwners: Number(col.uniqueOwners || 0n),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Collection Analytics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Collection Analytics
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading analytics: {error.message}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Collection Analytics
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No analytics data available</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Average Sale Price',
      value: `${analytics.avgSalePrice.toFixed(4)} TGR`,
      icon: '📊',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      label: 'Sales Velocity',
      value: `${(analytics.salesVelocity * 100).toFixed(2)}%`,
      icon: '⚡',
      color: 'text-purple-600 dark:text-purple-400',
      description: 'Sales per item',
    },
    {
      label: 'Unique Owners',
      value: analytics.uniqueOwners.toString(),
      icon: '👥',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Floor Price',
      value: analytics.floorPrice > 0 ? `${analytics.floorPrice.toFixed(4)} TGR` : '—',
      icon: '🏠',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Volume',
      value: `${analytics.totalVolume.toFixed(2)} TGR`,
      icon: '💰',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Total Sales',
      value: analytics.totalSales.toString(),
      icon: '🎯',
      color: 'text-pink-600 dark:text-pink-400',
    },
    {
      label: 'Total Items',
      value: analytics.totalItems.toString(),
      icon: '📦',
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: '24h Volume Trend',
      value: `${analytics.volumeTrend >= 0 ? '+' : ''}${analytics.volumeTrend.toFixed(2)}%`,
      icon: analytics.volumeTrend >= 0 ? '📈' : '📉',
      color: analytics.volumeTrend >= 0 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Collection Analytics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className={`text-xl font-bold mb-1 ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
            </p>
            {stat.description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stat.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

