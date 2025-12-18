'use client';

import { useState, useEffect } from 'react';
import { useCreateCollection } from '@/hooks/useMarketplace';
import { useIPFSUpload } from '@/hooks/useIPFS';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { toastError, toastSuccess, toastWarning } from '@/lib/toast';

export function CollectionForm() {
  const { address } = useAccount();
  const router = useRouter();
  const { createCollection, isPending, isConfirmed } = useCreateCollection();
  const { uploadMetadataFile, isUploading } = useIPFSUpload();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
    isPublic: true,
  });

  useEffect(() => {
    if (isConfirmed) {
      toastSuccess('Collection created successfully');
      router.push('/explore');
    }
  }, [isConfirmed, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toastWarning('Please connect your wallet');
      return;
    }

    try {
      // Upload collection metadata to IPFS
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: formData.image ? URL.createObjectURL(formData.image) : '',
      };

      const metadataURI = await uploadMetadataFile(metadata);

      // Create collection on contract
      createCollection(formData.name, metadataURI, formData.isPublic);
    } catch (error) {
      console.error('Error creating collection:', error);
      toastError(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-white">Create Collection</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Collection Name *
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
            Collection Image *
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
              className="mt-4 w-32 h-32 object-cover rounded-lg border border-gray-600/50"
            />
          )}
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:ring-offset-gray-800 cursor-pointer transition-all"
            />
            <span className="text-sm text-gray-300">Public Collection</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending || isUploading || !address}
          className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 sm:py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 transform hover:scale-[1.02] text-sm sm:text-base"
        >
          {isUploading
            ? 'Uploading to IPFS...'
            : isPending
            ? 'Creating Collection...'
            : 'Create Collection'}
        </button>
      </form>
    </div>
  );
}

