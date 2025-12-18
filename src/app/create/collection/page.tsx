'use client';

import { CollectionForm } from '@/components/create/CollectionForm';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WalletConnectButton } from '@/components/ConnectButton';

export default function CreateCollectionPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      // Small delay to allow connection state to stabilize
      const timer = setTimeout(() => {
        if (!isConnected) {
          router.push('/');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please connect your wallet to create a collection.
            </p>
            <WalletConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <CollectionForm />
      </div>
    </div>
  );
}

