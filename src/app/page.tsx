import dynamic from 'next/dynamic';
import { Hero } from '@/components/home/Hero';

// Lazy load heavy components for better initial page load
const FeaturedCollections = dynamic(() => import('@/components/home/FeaturedCollections').then(mod => ({ default: mod.FeaturedCollections })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

const TrendingNFTs = dynamic(() => import('@/components/home/TrendingNFTs').then(mod => ({ default: mod.TrendingNFTs })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

const ActiveAuctions = dynamic(() => import('@/components/home/ActiveAuctions').then(mod => ({ default: mod.ActiveAuctions })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

const StatsOverview = dynamic(() => import('@/components/home/StatsOverview').then(mod => ({ default: mod.StatsOverview })), {
  loading: () => <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />,
});

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FeaturedCollections />
      </div>
      <TrendingNFTs />
      <ActiveAuctions />
      <StatsOverview />
    </main>
  );
}
