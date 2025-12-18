'use client';

import { useEvents } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

interface TradingStatisticsProps {
  userAddress: Address;
}

export function TradingStatistics({ userAddress }: TradingStatisticsProps) {
  const { data: salesData, loading: salesLoading } = useEvents({
    where: {
      name: 'Sold',
      to: userAddress.toLowerCase(),
    },
    orderBy: 'timestamp',
    orderDirection: 'asc',
    first: 1000,
    skipPolling: true,
  });

  const { data: purchasesData, loading: purchasesLoading } = useEvents({
    where: {
      name: 'Sold',
      from: userAddress.toLowerCase(),
    },
    orderBy: 'timestamp',
    orderDirection: 'asc',
    first: 1000,
    skipPolling: true,
  });

  const statistics = useMemo(() => {
    const sales = salesData?.events || [];
    const purchases = purchasesData?.events || [];

    // Calculate sales statistics
    const salesPrices = sales.map((s: any) => Number(formatEther(s.price)));
    const totalSalesVolume = salesPrices.reduce((sum: number, p: number) => sum + p, 0);
    const avgSalePrice = salesPrices.length > 0 ? totalSalesVolume / salesPrices.length : 0;
    const highestSale = salesPrices.length > 0 ? Math.max(...salesPrices) : 0;

    // Calculate purchase statistics
    const purchasePrices = purchases.map((p: any) => Number(formatEther(p.price)));
    const totalPurchaseVolume = purchasePrices.reduce((sum: number, p: number) => sum + p, 0);
    const avgPurchasePrice = purchasePrices.length > 0 ? totalPurchaseVolume / purchasePrices.length : 0;
    const highestPurchase = purchasePrices.length > 0 ? Math.max(...purchasePrices) : 0;

    // Group by date for charts
    const salesByDate = sales.reduce((acc: any, sale: any) => {
      const date = format(new Date(Number(sale.timestamp) * 1000), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, sales: 0, volume: 0 };
      }
      acc[date].sales += 1;
      acc[date].volume += Number(formatEther(sale.price));
      return acc;
    }, {});

    const purchasesByDate = purchases.reduce((acc: any, purchase: any) => {
      const date = format(new Date(Number(purchase.timestamp) * 1000), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, purchases: 0, volume: 0 };
      }
      acc[date].purchases += 1;
      acc[date].volume += Number(formatEther(purchase.price));
      return acc;
    }, {});

    // Combine dates and create chart data
    const allDates = new Set([
      ...Object.keys(salesByDate),
      ...Object.keys(purchasesByDate),
    ]);
    const chartData = Array.from(allDates)
      .sort()
      .map((date) => ({
        date: format(new Date(date), 'MMM d'),
        sales: salesByDate[date]?.sales || 0,
        purchases: purchasesByDate[date]?.purchases || 0,
        salesVolume: salesByDate[date]?.volume || 0,
        purchaseVolume: purchasesByDate[date]?.volume || 0,
      }));

    return {
      sales: {
        count: sales.length,
        totalVolume: totalSalesVolume,
        avgPrice: avgSalePrice,
        highest: highestSale,
      },
      purchases: {
        count: purchases.length,
        totalVolume: totalPurchaseVolume,
        avgPrice: avgPurchasePrice,
        highest: highestPurchase,
      },
      chartData,
    };
  }, [salesData, purchasesData]);

  const loading = salesLoading || purchasesLoading;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Trading Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Sales',
      value: statistics.sales.count.toString(),
      icon: '💰',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Sales Volume',
      value: `${statistics.sales.totalVolume.toFixed(2)} TGR`,
      icon: '📈',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      label: 'Avg Sale Price',
      value: `${statistics.sales.avgPrice.toFixed(4)} TGR`,
      icon: '📊',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Highest Sale',
      value: `${statistics.sales.highest.toFixed(4)} TGR`,
      icon: '⭐',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Total Purchases',
      value: statistics.purchases.count.toString(),
      icon: '🛒',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Purchase Volume',
      value: `${statistics.purchases.totalVolume.toFixed(2)} TGR`,
      icon: '💸',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Avg Purchase Price',
      value: `${statistics.purchases.avgPrice.toFixed(4)} TGR`,
      icon: '📉',
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Highest Purchase',
      value: `${statistics.purchases.highest.toFixed(4)} TGR`,
      icon: '💎',
      color: 'text-pink-600 dark:text-pink-400',
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {payload[0].payload.date}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">{stat.icon}</div>
            <p className={`text-lg sm:text-xl font-bold mb-1 ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {statistics.chartData.length > 0 && (
        <div className="space-y-4">
          {/* Trading Activity Chart */}
          <div>
            <h4 className="text-sm sm:text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Trading Activity Over Time
            </h4>
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="sales" fill="#ec4899" name="Sales" />
                  <Bar dataKey="purchases" fill="#a855f7" name="Purchases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume Chart */}
          <div>
            <h4 className="text-sm sm:text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Volume Over Time
            </h4>
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(value) => `${value.toFixed(2)} TGR`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="salesVolume"
                    stroke="#ec4899"
                    strokeWidth={2}
                    name="Sales Volume"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="purchaseVolume"
                    stroke="#a855f7"
                    strokeWidth={2}
                    name="Purchase Volume"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {statistics.chartData.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
          No trading activity yet
        </p>
      )}
    </div>
  );
}

