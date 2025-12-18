'use client';

import { useState, useEffect } from 'react';
import { useMintNFT } from '@/hooks/useNFT';
import { useIPFSUpload } from '@/hooks/useIPFS';
import { useAccount } from 'wagmi';
import { useCollections } from '@/hooks/useSubgraph';
import { Address, isAddress } from 'viem';
import { useRouter } from 'next/navigation';
import { toastError, toastSuccess, toastWarning } from '@/lib/toast';

export function MintForm() {
  const { address } = useAccount();
  const router = useRouter();
  const { mintNFT, isPending, isConfirmed, error: mintError, isConfirming } = useMintNFT();
  const { uploadNFTWithMetadata, isUploading } = useIPFSUpload();
  // Disable polling for mint form - use cached data
  const { data: collectionsData } = useCollections({ first: 100, skipPolling: true });

  const [formData, setFormData] = useState({
    collection: '',
    name: '',
    description: '',
    image: null as File | null,
    royalty: 50, // 5% default
    attributes: [] as Array<{ trait_type: string; value: string }>,
  });

  const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' });

  const collections = collectionsData?.collections || [];

  // Handle mint success
  useEffect(() => {
    if (isConfirmed) {
      toastSuccess('NFT minted successfully');
      // Reset form
      setFormData({
        collection: '',
        name: '',
        description: '',
        image: null,
        royalty: 50,
        attributes: [],
      });
      setTimeout(() => {
        router.push('/explore');
      }, 1500);
    }
  }, [isConfirmed, router]);

  // Handle mint errors
  useEffect(() => {
    if (mintError) {
      toastError(mintError);
    }
  }, [mintError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toastWarning('Please connect your wallet');
      return;
    }

    if (!isAddress(formData.collection)) {
      toastWarning('Invalid collection address');
      return;
    }

    if (!formData.image) {
      toastWarning('Please select an image');
      return;
    }

    try {
      // Upload NFT image and metadata to IPFS
      const metadata = {
        name: formData.name,
        description: formData.description,
        attributes: formData.attributes,
      };

      const { metadataURI } = await uploadNFTWithMetadata(formData.image, metadata);

      // Mint NFT
      try {
        mintNFT(formData.collection as Address, metadataURI, formData.royalty);
      } catch (error) {
        console.error('Error calling mintNFT:', error);
        toastError(error);
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toastError(error);
    }
  };

  const addAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setFormData({
        ...formData,
        attributes: [...formData.attributes, newAttribute],
      });
      setNewAttribute({ trait_type: '', value: '' });
    }
  };

  const removeAttribute = (index: number) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-white">Mint NFT</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Collection *
          </label>
          <select
            value={formData.collection}
            onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
            className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            required
          >
            <option value="">Select a collection</option>
            {collections.map((collection: any) => (
              <option key={collection.id} value={collection.address} className="bg-gray-800">
                {collection.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            NFT Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 h-32 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({
                ...formData,
                image: e.target.files?.[0] || null,
              })
            }
            className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            required
          />
          {formData.image && (
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className="mt-4 w-32 sm:w-48 h-32 sm:h-48 object-cover rounded-lg border border-gray-600/50"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Royalty ({formData.royalty / 10}%) *
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={formData.royalty}
            onChange={(e) => setFormData({ ...formData, royalty: parseInt(e.target.value) })}
            className="w-full accent-primary-500"
          />
          <p className="text-xs text-gray-400 mt-1">Must be between 5% and 10%</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Attributes
          </label>
          <div className="space-y-2 mb-2">
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-900/50 border border-gray-600/50 p-2 rounded-lg">
                <span className="text-sm text-gray-300">
                  <strong className="text-primary-400">{attr.trait_type}:</strong> <span className="text-gray-200">{attr.value}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Trait type"
              value={newAttribute.trait_type}
              onChange={(e) =>
                setNewAttribute({ ...newAttribute, trait_type: e.target.value })
              }
              className="flex-1 bg-gray-900/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            />
            <input
              type="text"
              placeholder="Value"
              value={newAttribute.value}
              onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
              className="flex-1 bg-gray-900/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            />
            <button
              type="button"
              onClick={addAttribute}
              className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-purple-600 transition-all shadow-lg shadow-primary-500/40"
            >
              Add
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || isUploading || !address || !formData.collection}
          className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 sm:py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 transform hover:scale-[1.02] text-sm sm:text-base"
        >
          {isUploading
            ? 'Uploading to IPFS...'
            : isPending || isConfirming
            ? (isPending ? 'Waiting for confirmation...' : 'Minting NFT...')
            : 'Mint NFT'}
        </button>
      </form>
    </div>
  );
}

