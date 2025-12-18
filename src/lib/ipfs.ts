const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.lighthouse.storage/ipfs/';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface CollectionMetadata {
  name: string;
  description: string;
  image: string;
  external_link?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Upload file to IPFS using Lighthouse Storage
 */
export async function uploadToIPFS(file: File | Blob, fileName: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

  if (!apiKey) {
    throw new Error('LIGHTHOUSE_API_KEY is not configured');
  }

  const formData = new FormData();
  formData.append('file', file, fileName);

  const response = await fetch('https://api.lighthouse.storage/api/v0/add', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Lighthouse upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  const cid = data.Hash || data.hash || data.cid;

  if (!cid) {
    throw new Error('Lighthouse upload failed: missing CID in response');
  }

  return `ipfs://${cid}`;
}

/**
 * Upload JSON metadata to IPFS using Lighthouse Storage
 */
export async function uploadMetadata(metadata: NFTMetadata | CollectionMetadata): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

  if (!apiKey) {
    throw new Error('LIGHTHOUSE_API_KEY is not configured');
  }

  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: 'application/json',
  });

  const formData = new FormData();
  formData.append('file', blob, 'metadata.json');

  const response = await fetch('https://api.lighthouse.storage/api/v0/add', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Lighthouse metadata upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  const cid = data.Hash || data.hash || data.cid;

  if (!cid) {
    throw new Error('Lighthouse metadata upload failed: missing CID in response');
  }

  return `ipfs://${cid}`;
}

/**
 * Upload image and metadata to IPFS
 */
export async function uploadNFT(
  imageFile: File | Blob,
  metadata: Omit<NFTMetadata, 'image'>
): Promise<{ imageURI: string; metadataURI: string }> {
  // First upload the image
  const imageURI = await uploadToIPFS(imageFile, 'image');
  
  // Then upload metadata with image URI
  const metadataWithImage = {
    ...metadata,
    image: imageURI,
  };
  const metadataURI = await uploadMetadata(metadataWithImage);
  
  return { imageURI, metadataURI };
}

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export function ipfsToGateway(ipfsURI: string): string {
  if (!ipfsURI) return '';
  
  if (ipfsURI.startsWith('ipfs://')) {
    const cid = ipfsURI.replace('ipfs://', '');
    return `${IPFS_GATEWAY}${cid}`;
  }
  
  if (ipfsURI.startsWith('https://') || ipfsURI.startsWith('http://')) {
    return ipfsURI;
  }
  
  // Assume it's already a gateway URL or CID
  if (ipfsURI.startsWith('Qm') || ipfsURI.startsWith('baf')) {
    return `${IPFS_GATEWAY}${ipfsURI}`;
  }
  
  return ipfsURI;
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchMetadata(ipfsURI: string): Promise<NFTMetadata | CollectionMetadata> {
  if (!ipfsURI || ipfsURI.trim() === '') {
    throw new Error('IPFS URI is empty');
  }

  const url = ipfsToGateway(ipfsURI);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchMetadata - Converting URI:', ipfsURI, 'to URL:', url);
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (process.env.NODE_ENV === 'development') {
      console.warn('fetchMetadata - Response is not JSON. Content-Type:', contentType, 'First 200 chars:', text.substring(0, 200));
    }
    // Try to parse as JSON anyway
    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Failed to parse metadata: Response is not valid JSON`);
    }
  }
  
  const data = await response.json();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('fetchMetadata - Successfully fetched and parsed metadata:', data);
  }
  
  return data;
}

/**
 * Alternative: Upload using Pinata
 */
export async function uploadToPinata(file: File | Blob, fileName: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    throw new Error('Pinata API keys are not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return `ipfs://${data.IpfsHash}`;
}

