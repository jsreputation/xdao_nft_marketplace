'use client';

import { useParams, useRouter } from 'next/navigation';
import { isAddress, Address } from 'viem';
import { useAccount } from 'wagmi';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useUser, useUserOwnedNFTs, useUserListings, useAuctions, useUserCollections } from '@/hooks/useSubgraph';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { OwnedNFTs } from '@/components/profile/OwnedNFTs';
import { ListedNFTs } from '@/components/profile/ListedNFTs';
import { ActivityHistory } from '@/components/profile/ActivityHistory';
import { UserCollections } from '@/components/profile/UserCollections';
import { TradingStatistics } from '@/components/profile/TradingStatistics';
import { MARKET_ADDRESS } from '@/lib/contracts';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();
  const addressParam = params.address as string;

  if (!isAddress(addressParam)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid address</p>
      </div>
    );
  }

  const address = addressParam as Address;
  const prevConnectedAddressRef = useRef<string | undefined>(connectedAddress?.toLowerCase());
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Track the previously connected address
  useEffect(() => {
    if (connectedAddress) {
      prevConnectedAddressRef.current = connectedAddress.toLowerCase();
    }
  }, [connectedAddress]);

  // Check if user is viewing their own profile (current or previously connected)
  const isViewingOwnProfile = 
    (connectedAddress && address.toLowerCase() === connectedAddress.toLowerCase()) ||
    (prevConnectedAddressRef.current && address.toLowerCase() === prevConnectedAddressRef.current);

  // Redirect to home if user disconnects while viewing their own profile
  useEffect(() => {
    if (isViewingOwnProfile && !isConnected) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        router.push('/');
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsRedirecting(false);
    }
  }, [isConnected, isViewingOwnProfile, router]);

  const { data, loading, error } = useUser(address);
  
  // Fetch stats data
  const { data: ownedData } = useUserOwnedNFTs(address, 1000);
  const { data: listingsData } = useUserListings(address, 1000);
  const { data: auctionsData } = useAuctions({
    where: { active: true },
    first: 1000,
    skipPolling: true,
  });
  const { data: collectionsData } = useUserCollections(address, 100, 0, true);

  // Calculate stats
  const stats = useMemo(() => {
    const allItems = ownedData?.items || [];
    const allListings = listingsData?.pairs || [];
    const allAuctions = auctionsData?.auctions || [];
    const allCollections = collectionsData?.collections || [];

    const listedKeys = new Set<string>();
    allListings.forEach((pair: any) => {
      if (pair.bValid === true) {
        const key = `${pair.collection?.toLowerCase()}:${pair.tokenId}`;
        listedKeys.add(key);
      }
    });

    const auctionKeys = new Set<string>();
    allAuctions.forEach((auction: any) => {
      if (auction.active === true) {
        const key = `${auction.collection?.toLowerCase()}:${auction.tokenId}`;
        auctionKeys.add(key);
      }
    });

    const seen = new Set<string>();
    let uniqueOwnedCount = 0;
    allItems.forEach((item: any) => {
      const key = `${item.collection?.toLowerCase()}:${item.tokenId}`;
      if (seen.has(key) || listedKeys.has(key) || auctionKeys.has(key) || 
          item.owner?.toLowerCase() === MARKET_ADDRESS.toLowerCase() ||
          item.owner?.toLowerCase() !== address.toLowerCase()) {
        return;
      }
      seen.add(key);
      uniqueOwnedCount++;
    });

    const seenListings = new Set<string>();
    let activeListingsCount = 0;
    allListings.forEach((pair: any) => {
      if (pair.bValid === true && pair.owner?.toLowerCase() === address.toLowerCase()) {
        const key = `${pair.collection?.toLowerCase()}:${pair.tokenId}`;
        if (!seenListings.has(key)) {
          seenListings.add(key);
          activeListingsCount++;
        }
      }
    });

    const seenCollections = new Set<string>();
    let uniqueCollectionsCount = 0;
    allCollections.forEach((collection: any) => {
      if (collection.removed === true || collection.owner?.toLowerCase() !== address.toLowerCase()) {
        return;
      }
      const key = collection.address?.toLowerCase() || collection.id?.toLowerCase();
      if (!seenCollections.has(key)) {
        seenCollections.add(key);
        uniqueCollectionsCount++;
      }
    });

    return {
      ownedNFTs: uniqueOwnedCount,
      listings: activeListingsCount,
      collections: uniqueCollectionsCount,
    };
  }, [ownedData, listingsData, auctionsData, collectionsData, address]);

  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Redirecting to home...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading profile: {error.message}</p>
      </div>
    );
  }

  const user = data?.user || {
    totalVolume: 0n,
    totalSales: 0n,
    totalPurchases: 0n,
    totalListings: 0n,
    totalCollections: 0n,
  };

  const tabs = [
    {
      id: 'owned',
      label: 'Owned NFTs',
      content: <OwnedNFTs owner={address} />,
    },
    {
      id: 'listed',
      label: 'Listed NFTs',
      content: <ListedNFTs owner={address} />,
    },
    {
      id: 'collections',
      label: 'Collections',
      content: <UserCollections owner={address} />,
    },
    {
      id: 'activity',
      label: 'Activity',
      content: <ActivityHistory userAddress={address} />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: <TradingStatistics userAddress={address} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader address={address} user={user} stats={stats} />
        <ProfileTabs tabs={tabs} />
      </div>
    </div>
  );
}
