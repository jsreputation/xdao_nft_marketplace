/**
 * Environment variable validation and utilities
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_MARKET_ADDRESS',
  'NEXT_PUBLIC_AUCTION_ADDRESS',
  'NEXT_PUBLIC_TGR_ADDRESS',
  'NEXT_PUBLIC_SUBGRAPH_URL',
] as const;

const optionalEnvVars = [
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_LIGHTHOUSE_API_KEY',
  'NEXT_PUBLIC_PINATA_API_KEY',
] as const;

interface EnvConfig {
  marketAddress: string;
  auctionAddress: string;
  tgrAddress: string;
  subgraphUrl: string;
  chainId: string;
  walletConnectProjectId: string;
  lighthouseApiKey?: string;
  pinataApiKey?: string;
}

function validateEnv(): EnvConfig {
  const missing: string[] = [];

  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === '' || value === '0x0000000000000000000000000000000000000000') {
      missing.push(varName);
    }
  });

  if (missing.length > 0 && typeof window === 'undefined') {
    // Only warn on server-side, client-side will handle gracefully
    console.warn(
      `⚠️ Missing or invalid environment variables: ${missing.join(', ')}\n` +
      'Please set these in your .env file. The app may not function correctly without them.'
    );
  }

  return {
    marketAddress: process.env.NEXT_PUBLIC_MARKET_ADDRESS || '0x0000000000000000000000000000000000000000',
    auctionAddress: process.env.NEXT_PUBLIC_AUCTION_ADDRESS || '0x0000000000000000000000000000000000000000',
    tgrAddress: process.env.NEXT_PUBLIC_TGR_ADDRESS || '0x0000000000000000000000000000000000000000',
    subgraphUrl: process.env.NEXT_PUBLIC_SUBGRAPH_URL || '',
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '43114',
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    lighthouseApiKey: process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
    pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  };
}

export const env = validateEnv();

/**
 * Check if all required environment variables are set
 */
export function isEnvValid(): boolean {
  return (
    env.marketAddress !== '0x0000000000000000000000000000000000000000' &&
    env.auctionAddress !== '0x0000000000000000000000000000000000000000' &&
    env.tgrAddress !== '0x0000000000000000000000000000000000000000' &&
    env.subgraphUrl !== ''
  );
}

/**
 * Get environment validation status for debugging
 */
export function getEnvStatus() {
  return {
    isValid: isEnvValid(),
    marketAddress: env.marketAddress,
    auctionAddress: env.auctionAddress,
    tgrAddress: env.tgrAddress,
    subgraphUrl: env.subgraphUrl ? 'Set' : 'Missing',
    chainId: env.chainId,
    walletConnectProjectId: env.walletConnectProjectId ? 'Set' : 'Missing',
    ipfsConfigured: !!(env.lighthouseApiKey || env.pinataApiKey),
  };
}

