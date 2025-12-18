'use client';

import { useState, useEffect, useRef } from 'react';
import {
  uploadToIPFS,
  uploadMetadata,
  uploadNFT,
  uploadToPinata,
  fetchMetadata,
  ipfsToGateway,
  type NFTMetadata,
  type CollectionMetadata,
} from '@/lib/ipfs';

export function useIPFSUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File | Blob, fileName: string) => {
    setIsUploading(true);
    setError(null);
    try {
      // Try Lighthouse first, fallback to Pinata
      if (process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY) {
        return await uploadToIPFS(file, fileName);
      } else if (process.env.NEXT_PUBLIC_PINATA_API_KEY) {
        return await uploadToPinata(file, fileName);
      } else {
        throw new Error('No IPFS service configured (Lighthouse or Pinata)');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Upload failed'));
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMetadataFile = async (metadata: NFTMetadata | CollectionMetadata) => {
    setIsUploading(true);
    setError(null);
    try {
      return await uploadMetadata(metadata);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Metadata upload failed'));
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadNFTWithMetadata = async (
    imageFile: File | Blob,
    metadata: Omit<NFTMetadata, 'image'>
  ) => {
    setIsUploading(true);
    setError(null);
    try {
      return await uploadNFT(imageFile, metadata);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('NFT upload failed'));
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    uploadMetadataFile,
    uploadNFTWithMetadata,
    isUploading,
    error,
  };
}

export function useIPFSMetadata(ipfsURI?: string) {
  const [metadata, setMetadata] = useState<NFTMetadata | CollectionMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const loadMetadata = async (uri: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMetadata(uri);
      setMetadata(data);
      hasLoadedRef.current = uri;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load metadata'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load if we have a URI and haven't loaded it yet
    if (!ipfsURI) {
      return;
    }

    // Skip if already loaded or currently loading
    if (hasLoadedRef.current === ipfsURI || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    let cancelled = false;
    
    setIsLoading(true);
    setError(null);
    hasLoadedRef.current = ipfsURI;
    
    fetchMetadata(ipfsURI)
      .then((data) => {
        if (!cancelled) {
          setMetadata(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load metadata'));
          hasLoadedRef.current = null; // Reset on error so we can retry
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      });

    return () => {
      cancelled = true;
      isLoadingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipfsURI ?? '']);

  return {
    metadata,
    isLoading,
    error,
    loadMetadata,
    getImageUrl: (imageURI?: string) => imageURI ? ipfsToGateway(imageURI) : '',
  };
}

