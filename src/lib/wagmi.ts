import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalanche, avalancheFuji } from 'wagmi/chains';

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '43114');
const selectedChain = chainId === 43114 ? avalanche : avalancheFuji;

export const config = getDefaultConfig({
  appName: 'NFT Marketplace',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [selectedChain],
  ssr: true,
});

