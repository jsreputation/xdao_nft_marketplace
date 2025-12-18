'use client';

import { useNFTPriceEvents } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { useMemo } from 'react';

interface PriceStatisticsProps {
  collection: Address;
  tokenId: bigint;
  currentPrice?: bigint;
}

export function PriceStatistics({ collection, tokenId, currentPrice }: PriceStatisticsProps) {
  const { data, loading, error } = useNFTPriceEvents(collection, tokenId, true);

  const statistics = useMemo(() => {
    const events = data?.events || [];
    const prices: number[] = [];

    // Extract all prices from events
    events.forEach((event: any) => {
      if (event.price && Number(event.price) > 0) {
        prices.push(Number(formatEther(event.price)));
      }
    });

    // Add current price if available
    if (currentPrice) {
      const currentPriceNum = Number(formatEther(currentPrice));
      if (prices.length === 0 || Math.abs(currentPriceNum - prices[prices.length - 1]) > 0.0001) {
        prices.push(currentPriceNum);
      }
    }

    if (prices.length === 0) {
      return null;
    }

    const sortedPrices = [...prices].sort((a, b) => a - b);
    const highest = sortedPrices[sortedPrices.length - 1];
    const lowest = sortedPrices[0];
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;
    const priceUpdates = events.filter((e: any) => e.name === 'PriceUpdated').length;

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (prices.length >= 2) {
      const recentChange = lastPrice - prices[prices.length - 2];
      if (recentChange > 0.0001) trend = 'up';
      else if (recentChange < -0.0001) trend = 'down';
    }

    return {
      highest,
      lowest,
      average,
      firstPrice,
      lastPrice,
      priceChange,
      priceChangePercent,
      priceUpdates,
      totalEvents: prices.length,
      trend,
    };
  }, [data, currentPrice]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Price Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Price Statistics
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading statistics: {error.message}</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Price Statistics
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No price data available</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Current Price',
      value: `${statistics.lastPrice.toFixed(4)} TGR`,
      icon: '💰',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      label: 'Highest Price',
      value: `${statistics.highest.toFixed(4)} TGR`,
      icon: '📈',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Lowest Price',
      value: `${statistics.lowest.toFixed(4)} TGR`,
      icon: '📉',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Average Price',
      value: `${statistics.average.toFixed(4)} TGR`,
      icon: '📊',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Price Change',
      value: `${statistics.priceChange >= 0 ? '+' : ''}${statistics.priceChangePercent.toFixed(2)}%`,
      icon: statistics.trend === 'up' ? '⬆️' : statistics.trend === 'down' ? '⬇️' : '➡️',
      color: statistics.priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Price Updates',
      value: statistics.priceUpdates.toString(),
      icon: '🔄',
      color: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Price Statistics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
          </div>
        ))}
      </div>
    </div>
  );
}

