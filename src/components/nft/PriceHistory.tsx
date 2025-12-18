'use client';

import { useNFTPriceEvents } from '@/hooks/useSubgraph';
import { Address, formatEther } from 'viem';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts';
import { format } from 'date-fns';

interface PriceHistoryProps {
  collection: Address;
  tokenId: bigint;
  currentPrice?: bigint;
}

interface PricePoint {
  timestamp: number;
  price: number;
  priceFormatted: string;
  date: string;
  event: string;
}

export function PriceHistory({ collection, tokenId, currentPrice }: PriceHistoryProps) {
  const { data, loading, error } = useNFTPriceEvents(collection, tokenId, true);

  const priceData = useMemo(() => {
    const events = data?.events || [];
    const pricePoints: PricePoint[] = [];

    // Process events to extract price data
    events.forEach((event: any) => {
      if (event.price && Number(event.price) > 0) {
        const timestamp = Number(event.timestamp);
        const price = Number(formatEther(event.price));
        
        pricePoints.push({
          timestamp,
          price,
          priceFormatted: formatEther(event.price),
          date: format(new Date(timestamp * 1000), 'MMM d, yyyy'),
          event: event.name,
        });
      }
    });

    // Add current price if available and not already in the data
    if (currentPrice && pricePoints.length > 0) {
      const lastPrice = pricePoints[pricePoints.length - 1];
      const currentPriceNum = Number(formatEther(currentPrice));
      
      // Only add if different from last price point
      if (Math.abs(currentPriceNum - lastPrice.price) > 0.0001) {
        pricePoints.push({
          timestamp: Date.now() / 1000,
          price: currentPriceNum,
          priceFormatted: formatEther(currentPrice),
          date: 'Now',
          event: 'Current',
        });
      }
    } else if (currentPrice && pricePoints.length === 0) {
      // If no history but current price exists, show it
      pricePoints.push({
        timestamp: Date.now() / 1000,
        price: Number(formatEther(currentPrice)),
        priceFormatted: formatEther(currentPrice),
        date: 'Now',
        event: 'Current',
      });
    }

    // Sort by timestamp ascending for chart
    return pricePoints.sort((a, b) => a.timestamp - b.timestamp);
  }, [data, currentPrice]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PricePoint;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {data.date}
          </p>
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {data.priceFormatted} TGR
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.event}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isLast = payload === priceData[priceData.length - 1];
    
    return (
      <Dot
        {...props}
        r={isLast ? 6 : 4}
        fill={isLast ? '#ec4899' : '#a855f7'}
        stroke={isLast ? '#ffffff' : '#ffffff'}
        strokeWidth={2}
      />
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Price History
        </h3>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Price History
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm">Error loading price history: {error.message}</p>
      </div>
    );
  }

  if (priceData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Price History
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No price history available</p>
      </div>
    );
  }

  // Calculate price change
  const firstPrice = priceData[0]?.price || 0;
  const lastPrice = priceData[priceData.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Price History
        </h3>
        {priceData.length > 1 && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Price Change</p>
              <p className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {lastPrice.toFixed(4)} TGR
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
            <Line
              type="monotone"
              dataKey="price"
              stroke="#ec4899"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 8, fill: '#a855f7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Price points summary */}
      {priceData.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">First Listed</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {priceData[0].priceFormatted} TGR
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Highest</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {Math.max(...priceData.map(p => p.price)).toFixed(4)} TGR
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Lowest</p>
              <p className="font-semibold text-red-600 dark:text-red-400">
                {Math.min(...priceData.map(p => p.price)).toFixed(4)} TGR
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Updates</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {priceData.filter(p => p.event === 'PriceUpdated').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

