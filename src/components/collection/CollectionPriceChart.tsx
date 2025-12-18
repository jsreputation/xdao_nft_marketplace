'use client';

import { useCollection } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CollectionPriceChartProps {
  collection: Address;
}

export function CollectionPriceChart({ collection }: CollectionPriceChartProps) {
  const { data, loading, error } = useCollection(collection.toLowerCase());

  const chartData = useMemo(() => {
    if (!data?.collection) return [];

    const collection = data.collection;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return [
      {
        period: '24h',
        volume: Number(formatEther(collection.volume24h || 0n)),
        sales: Number(collection.sales24h || 0n),
        floorPrice: Number(formatEther(collection.floorPrice || 0n)),
      },
      {
        period: '7d',
        volume: Number(formatEther(collection.volume7d || 0n)),
        sales: Number(collection.sales7d || 0n),
        floorPrice: Number(formatEther(collection.floorPrice || 0n)),
      },
      {
        period: '30d',
        volume: Number(formatEther(collection.volume30d || 0n)),
        sales: Number(collection.sales30d || 0n),
        floorPrice: Number(formatEther(collection.floorPrice || 0n)),
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Volume & Sales Trends
        </h3>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Volume & Sales Trends
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading chart: {error.message}</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {payload[0].payload.period}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Volume') ? `${entry.value.toFixed(2)} TGR` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        Volume & Sales Trends
      </h3>

      {chartData.length > 0 && (
        <div className="space-y-8">
          {/* Volume Chart */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Volume Over Time
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="period"
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
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.3}
                    name="Volume"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Chart */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Sales Count Over Time
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="period"
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
                  <Bar dataKey="sales" fill="#a855f7" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {chartData.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
          No volume data available
        </p>
      )}
    </div>
  );
}

