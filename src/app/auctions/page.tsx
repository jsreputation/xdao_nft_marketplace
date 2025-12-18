import { AuctionsList } from '@/components/auctions/AuctionsList';

export default function AuctionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Active Auctions</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Place bids on time-based NFT auctions</p>
        </div>
        <AuctionsList />
      </div>
    </div>
  );
}

