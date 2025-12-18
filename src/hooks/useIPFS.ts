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
    if (!ipfsURI || ipfsURI.trim() === '') {
      setMetadata(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Skip if already loaded for this URI
    if (hasLoadedRef.current === ipfsURI) {
      return;
    }

    // Skip if currently loading
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    let cancelled = false;
    
    setIsLoading(true);
    setError(null);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('useIPFSMetadata - Fetching metadata for URI:', ipfsURI);
    }
    
    fetchMetadata(ipfsURI)
      .then((data) => {
        if (!cancelled) {
          if (process.env.NODE_ENV === 'development') {
            console.log('useIPFSMetadata - Metadata fetched successfully:', data);
          }
          setMetadata(data);
          hasLoadedRef.current = ipfsURI;
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load metadata';
          if (process.env.NODE_ENV === 'development') {
            console.error('useIPFSMetadata - Error fetching metadata:', errorMessage, err);
          }
          setError(err instanceof Error ? err : new Error(errorMessage));
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

